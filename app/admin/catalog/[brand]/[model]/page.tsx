'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, GitBranchPlus, Plus } from 'lucide-react';

import { useModelCatalog } from '@/features/admin/catalog/hooks/useModelCatalog';

import { AddModificationModal } from '@/features/admin/catalog/components/AddModificationModal';
import { ModelCatalogHeader } from '@/features/admin/catalog/components/ModelCatalogHeader';
import { ModelCatalogFilters } from '@/features/admin/catalog/components/ModelCatalogFilters';
import { ModelCatalogNodes } from '@/features/admin/catalog/components/ModelCatalogNodes';
import { ModelPartsCatalogList } from '@/features/admin/catalog/components/ModelPartsCatalogList';

import { buildModelCatalogHref, type CatalogSearchParams } from '@/features/admin/catalog/lib/catalogFilters';
import { CatalogSectionLinks } from '@/features/catalog/components/CatalogSectionLinks';
import {ModelModifications} from "@/features/admin/catalog/components/ModelModifications";
import {AddCatalogPartModal} from "@/features/admin/catalog/components/AddCatalogPartModal";
import { ModificationPartsPicker } from '@/features/admin/catalog/components/ModificationPartsPicker';

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

    const catalog = useModelCatalog(decodeURIComponent(brand), decodeURIComponent(model), query);
    const router = useRouter();
    const [addDialog, setAddDialog] = React.useState<'part' | 'modification' | null>(null);
    const addPartLabel = catalog.section === 'fluids' ? 'Добавить жидкость' : 'Добавить запчасть';
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

    if (typeof query.pickPartsFor === 'string' && query.pickPartsFor) {
        return (
            <ModificationPartsPicker
                key={`${catalog.modelPath}:${query.pickPartsFor}`}
                model={catalog.masterModel}
                modelPath={catalog.modelPath}
                modificationId={query.pickPartsFor}
            />
        );
    }

    const editModification = typeof query.editModification === 'string'
        ? catalog.masterModel.modifications?.find(modification => modification.id === query.editModification)
        : undefined;

    return (
        <div className="mx-auto max-w-6xl space-y-8 pb-32">
            <ModelCatalogHeader model={catalog.masterModel} />

            <CatalogSectionLinks
                section={catalog.section}
                partsHref={buildModelCatalogHref(catalog.modelPath, catalog.currentQuery, 'parts')}
                fluidsHref={buildModelCatalogHref(catalog.modelPath, catalog.currentQuery, 'fluids')}
            />

            <div role="group" aria-label="Добавление в каталог"
                className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 flex flex-col items-end gap-2 sm:right-6">
                <button type="button" aria-label={addPartLabel} title={addPartLabel} aria-haspopup="dialog"
                    onClick={() => setAddDialog('part')}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-[var(--btn-primary)] text-sm font-semibold text-[var(--btn-primary-text)] shadow-lg transition hover:bg-[var(--btn-primary-hover)] 2xl:px-4">
                    <Plus className="h-5 w-5" aria-hidden="true" />
                    <span className="hidden 2xl:inline">{addPartLabel}</span>
                </button>
                <button type="button" aria-label="Добавить модификацию" title="Добавить модификацию" aria-haspopup="dialog"
                    onClick={() => setAddDialog('modification')}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] text-sm font-semibold text-[var(--text)] shadow-lg transition hover:bg-[var(--bg-elevated)] 2xl:px-4">
                    <GitBranchPlus className="h-5 w-5 text-[var(--link)]" aria-hidden="true" />
                    <span className="hidden 2xl:inline">Добавить модификацию</span>
                </button>
            </div>

            {addDialog === 'part' && (
                <AddCatalogPartModal
                    key={catalog.section}
                    model={catalog.masterModel}
                    section={catalog.section}
                    onClose={() => setAddDialog(null)}
                />
            )}

            {addDialog === 'modification' && (
                <AddModificationModal key={`add-modification:${catalog.modelPath}`}
                    model={catalog.masterModel}
                    onClose={() => setAddDialog(null)}
                    onCreated={modification => router.push(`${catalog.modelPath}?pickPartsFor=${encodeURIComponent(modification.id)}`)}
                />
            )}

            {editModification && (
                <AddModificationModal
                    key={editModification.id}
                    model={catalog.masterModel}
                    modification={editModification}
                    onClose={() => router.replace(catalog.modelPath)}
                />
            )}

            <ModelModifications
                model={catalog.masterModel}
                selectedModificationIds={catalog.filters.modificationIds ?? []}
                isPending={catalog.isPending}
                onSelectModification={catalog.selectModification}
                onReset={catalog.resetFilters}
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

            {catalog.section === 'parts' && Object.keys(catalog.nodesByCategory).length > 0 ? (
                <ModelPartsCatalogList key={catalog.modelPath} nodesByCategory={catalog.nodesByCategory}
                    modelPath={catalog.modelPath} currentQuery={catalog.currentQuery} />
            ) : (
                <ModelCatalogNodes
                    section={catalog.section}
                    nodesByCategory={catalog.nodesByCategory}
                    visiblePartsCount={catalog.visiblePartsCount}
                    hasActiveFilters={catalog.hasActiveFilters}
                    matchingModCount={catalog.matchingModCount}
                    modelPath={catalog.modelPath}
                    currentQuery={catalog.currentQuery}
                />
            )}
        </div>
    );
}
