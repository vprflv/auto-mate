'use client';

import * as React from 'react';
import Link from 'next/link';
import { Database, SearchX } from 'lucide-react';

import { useNodeCatalog } from '@/features/admin/catalog/hooks/useNodeCatalog';

import { NodeCatalogHeader } from '@/features/admin/catalog/components/NodeCatalogHeader';
import { CatalogPartCard } from '@/features/admin/catalog/components/CatalogPartCard';
import { PartDetailsModal } from '@/features/admin/catalog/components/PartDetailsModal';

import type { CatalogSearchParams } from '@/features/admin/catalog/lib/catalogFilters';

interface Props {
    params: Promise<{
        brand: string;
        model: string;
        nodeId: string;
    }>;

    searchParams: Promise<CatalogSearchParams>;
}

export default function NodeCatalogPage({
                                            params,
                                            searchParams
                                        }: Props) {
    const { brand, model, nodeId } = React.use(params);
    const query = React.use(searchParams);

    const catalog = useNodeCatalog(
        brand,
        model,
        nodeId,
        query
    );

    if (!catalog.loaded) {
        return (
            <div className="py-12 text-center text-sm text-[var(--text-muted)]">
                Загрузка запчастей…
            </div>
        );
    }

    if (!catalog.node) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
                <Database className="h-12 w-12 text-[var(--text-muted)]" />

                <h2 className="text-xl font-bold text-[var(--text)]">
                    Узел не найден
                </h2>

                <Link
                    href={catalog.modelHref}
                    className="rounded-xl bg-[var(--link)] px-6 py-2.5 text-sm font-bold text-[var(--btn-primary-text)] transition hover:bg-[var(--btn-primary-hover)]"
                >
                    Вернуться к модели
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6 pb-20">
            <NodeCatalogHeader
                node={catalog.node}
                visiblePartsCount={catalog.visibleParts.length}
                hasActiveFilters={catalog.hasActiveFilters}
                activeFilterLabels={catalog.activeFilterLabels}
                matchingModCount={catalog.matchingModCount}
                modelHref={catalog.modelHref}
                nodePath={catalog.nodePath}
            />

            {catalog.visibleParts.length > 0 ? (
                <div className="space-y-3">
                    {catalog.visibleParts.map(part => (
                        <CatalogPartCard
                            key={part.id}
                            part={part}
                            analogsCount={
                                catalog.getAnalogsCount(part)
                            }
                            onOpen={catalog.openPart}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center rounded-3xl border border-dashed border-[var(--border)]/60 bg-[var(--bg-elevated)]/20 px-4 py-12 text-center">
                    <SearchX className="mb-3 h-8 w-8 text-[var(--text-dim)]" />

                    <h2 className="text-sm font-bold text-[var(--text-muted)]">
                        {catalog.hasActiveFilters
                            ? 'Подходящие детали не найдены'
                            : 'В этом узле пока нет деталей'}
                    </h2>

                    {catalog.hasActiveFilters && (
                        <>
                            <p className="mt-2 max-w-md text-xs leading-relaxed text-[var(--text-dim)]">
                                {catalog.matchingModCount === 0
                                    ? 'У модели нет модификаций с таким сочетанием параметров.'
                                    : 'В этом узле нет деталей с подтверждённой применимостью к выбранным модификациям.'}
                            </p>

                            <Link
                                href={catalog.nodePath}
                                className="mt-4 text-xs font-bold text-blue-500 hover:underline"
                            >
                                Сбросить фильтры
                            </Link>
                        </>
                    )}
                </div>
            )}

            <PartDetailsModal
                isOpen={catalog.isModalOpen}
                onClose={catalog.closePart}
                part={catalog.selectedPart}
                node={catalog.node}
            />
        </div>
    );
}