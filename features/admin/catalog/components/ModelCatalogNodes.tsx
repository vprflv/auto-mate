import Link from 'next/link';
import { Wrench, Settings2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { getCatalogCategoryLabel, sortCatalogCategoryKeys } from '@/features/admin/lib/system-store/categoryLabels';
import { renameCatalogSection } from '@/features/admin/lib/system-store/actions/renameCatalogSection';
import { DeleteCatalogCategoryDialog } from './DeleteCatalogCategoryDialog';
import { storage } from '@/features/admin/lib/system-store/storage';

import type { StoredCatalogNode } from '@/features/admin/lib/system-store/types';

import type { CatalogSection } from '@/types/catalog/catalog';

interface Props {
    section: CatalogSection;
    nodesByCategory: Record<string, StoredCatalogNode[]>;
    visiblePartsCount: number;

    hasActiveFilters: boolean;
    matchingModCount: number;

    modelPath: string;
    currentQuery: string;
}

export function ModelCatalogNodes({
                                      section,
                                      nodesByCategory,
                                      visiblePartsCount,
                                      hasActiveFilters,
                                      matchingModCount,
                                      modelPath,
                                      currentQuery
                                  }: Props) {
    const isFluids = section === 'fluids';
    const { catalogCategoryLabels: labels, catalogCategoryOrder } = storage.getState();
    const categories = sortCatalogCategoryKeys(Object.keys(nodesByCategory), catalogCategoryOrder, labels)
        .map(category => [category, nodesByCategory[category]] as const);

    function rename(section: Parameters<typeof renameCatalogSection>[0], currentName: string) {
        const value = window.prompt(
            'category' in section ? 'Новое название категории для всех моделей' : 'Новое название подкатегории',
            currentName
        );
        if (value === null) return;
        try {
            renameCatalogSection(section, value);
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Не удалось переименовать раздел.');
        }
    }

    const nodesCount = categories.reduce(
        (total, [, nodes]) => total + nodes.length,
        0
    );

    const emptyMessage =
        hasActiveFilters && matchingModCount === 0
            ? 'Нет модификаций с таким сочетанием параметров.'
            : hasActiveFilters
                ? isFluids
                    ? 'Для выбранных модификаций пока нет подтверждённых жидкостей.'
                    : 'Для выбранных модификаций пока нет подтверждённых деталей.'
                : isFluids
                    ? 'В каталоге этой модели пока нет масел и жидкостей.'
                    : 'В каталоге этой модели пока нет узлов.';

    return (
        <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-[var(--text-muted)]" />

                    <h2 className="text-lg font-bold text-[var(--text)]">
                        {isFluids ? 'Масла и жидкости' : 'Каталог запчастей'}
                    </h2>
                </div>

                <span className="text-xs text-[var(--text-dim)]">
                    Узлов: {nodesCount}
                    {' · '}
                    {isFluids ? 'Жидкостей' : 'Деталей'}: {visiblePartsCount}
                </span>
            </div>

            {nodesCount === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border)]/60 bg-[var(--bg-elevated)]/20 px-4 py-12 text-center">
                    <Settings2 className="mb-3 h-8 w-8 text-[var(--text-dim)]" />

                    <h3 className="text-sm font-bold text-[var(--text-muted)]">
                        Ничего не найдено
                    </h3>

                    <p className="mt-1 text-xs text-[var(--text-dim)]">
                        {emptyMessage}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                    {categories.map(([category, nodes]) => (
                        <div
                            key={category}
                            className="space-y-3 rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 p-5"
                        >
                            <div className="flex items-center gap-2">
                                <h3 className="min-w-0 break-words text-sm font-bold text-[var(--text-muted)]">
                                    {getCatalogCategoryLabel(category, labels)}
                                </h3>
                                <button
                                    type="button"
                                    title="Переименовать категорию"
                                    aria-label={`Переименовать категорию ${getCatalogCategoryLabel(category, labels)}`}
                                    onClick={() => rename({ category }, getCatalogCategoryLabel(category, labels))}
                                    className="shrink-0 rounded-lg p-2 text-[var(--link)] hover:bg-[var(--bg-elevated)]"
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <DeleteCatalogCategoryDialog
                                    category={category}
                                    categoryLabel={getCatalogCategoryLabel(category, labels)}
                                />
                            </div>

                            <div className="space-y-2">
                                {nodes.map(node => {
                                    const nodePath =
                                        `${modelPath}/` +
                                        encodeURIComponent(node.id);

                                    const href = currentQuery
                                        ? `${nodePath}?${currentQuery}`
                                        : nodePath;

                                    return (
                                        <div
                                            key={node.id}
                                            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-2xs transition hover:border-[var(--link)]/40"
                                        >
                                            <div className="min-w-0">
                                                <p className="break-words text-sm font-bold text-[var(--text)]">
                                                    {node.title}
                                                </p>

                                                <p className="text-xs text-[var(--text-dim)]">
                                                    {hasActiveFilters
                                                        ? isFluids ? 'Подходит жидкостей' : 'Подходит деталей'
                                                        : isFluids ? 'Жидкостей в базе' : 'Деталей в базе'}
                                                    :{' '}
                                                    {node.items.length}
                                                </p>
                                            </div>

                                            <div className="flex shrink-0 items-center gap-1">
                                            <button
                                                type="button"
                                                title="Переименовать подкатегорию"
                                                aria-label={`Переименовать подкатегорию ${node.title}`}
                                                onClick={() => rename({ nodeId: node.id }, node.title)}
                                                className="rounded-lg p-2 text-[var(--link)] hover:bg-[var(--bg-elevated)]"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <Link
                                                href={href}
                                                className="shrink-0 rounded-lg bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] transition hover:bg-[var(--link)] hover:text-[var(--btn-primary-text)]"
                                            >
                                                Открыть
                                            </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
