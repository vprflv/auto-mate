'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

import { useModelCatalog } from '@/features/admin/catalog/hooks/useModelCatalog';

import { ModelCatalogHeader } from '@/features/admin/catalog/components/ModelCatalogHeader';
import { ModelCatalogFilters } from '@/features/admin/catalog/components/ModelCatalogFilters';
import { ModelCatalogNodes } from '@/features/admin/catalog/components/ModelCatalogNodes';

import type { CatalogSearchParams } from '@/features/admin/catalog/lib/catalogFilters';

interface Props {
    params: Promise<{
        brand: string;
        model: string;
    }>;

    searchParams: Promise<CatalogSearchParams>;
}

export default function ModelCatalogDashboard({
                                                  params,
                                                  searchParams
                                              }: Props) {
    const { brand, model } = React.use(params);
    const query = React.use(searchParams);

    const catalog = useModelCatalog(brand, model, query);

    if (!catalog.loaded) {
        return (
            <div className="py-12 text-center text-sm text-[var(--text-muted)]">
                Загрузка каталога…
            </div>
        );
    }

    if (!catalog.masterModel) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
                <AlertCircle className="h-12 w-12 text-[var(--text-muted)]" />

                <h2 className="text-xl font-bold text-[var(--text)]">
                    Модель не найдена
                </h2>

                <Link
                    href="/admin/catalog"
                    className="rounded-xl bg-[var(--link)] px-6 py-2.5 text-sm font-bold text-[var(--btn-primary-text)] transition hover:bg-[var(--btn-primary-hover)]"
                >
                    Вернуться в каталог
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl space-y-8 pb-20">
            <ModelCatalogHeader
                model={catalog.masterModel}
            />

            <ModelCatalogFilters
                filters={catalog.filters}
                filterOptions={catalog.filterOptions}
                hasActiveFilters={catalog.hasActiveFilters}
                matchingModCount={catalog.matchingModCount}
                isPending={catalog.isPending}
                onChange={catalog.changeFilter}
                onReset={catalog.resetFilters}
            />

            <ModelCatalogNodes
                nodesByCategory={catalog.nodesByCategory}
                visiblePartsCount={catalog.visiblePartsCount}
                hasActiveFilters={catalog.hasActiveFilters}
                matchingModCount={catalog.matchingModCount}
                modelPath={catalog.modelPath}
                currentQuery={catalog.currentQuery}
            />
        </div>
    );
}