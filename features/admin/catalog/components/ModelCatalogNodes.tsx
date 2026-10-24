import Link from 'next/link';
import { Wrench, Settings2 } from 'lucide-react';

import type { StoredCatalogNode } from '@/features/admin/lib/system-store/types';

interface Props {
    nodesByCategory: Record<string, StoredCatalogNode[]>;
    visiblePartsCount: number;

    hasActiveFilters: boolean;
    matchingModCount: number;

    modelPath: string;
    currentQuery: string;
}

const categoryLabels: Record<string, string> = {
    service: 'Расходники ТО',
    brakes: 'Тормозная система',
    suspension: 'Подвеска и рулевое',
    ignition: 'Зажигание и электрика',
    fluids: 'Масла и жидкости'
};

export function ModelCatalogNodes({
                                      nodesByCategory,
                                      visiblePartsCount,
                                      hasActiveFilters,
                                      matchingModCount,
                                      modelPath,
                                      currentQuery
                                  }: Props) {
    const categories = Object.entries(nodesByCategory);

    const nodesCount = categories.reduce(
        (total, [, nodes]) => total + nodes.length,
        0
    );

    const emptyMessage =
        hasActiveFilters && matchingModCount === 0
            ? 'Нет модификаций с таким сочетанием параметров.'
            : hasActiveFilters
                ? 'Для выбранных модификаций пока нет подтверждённых деталей.'
                : 'В каталоге этой модели пока нет узлов.';

    return (
        <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-[var(--text-muted)]" />

                    <h2 className="text-lg font-bold text-[var(--text)]">
                        Каталог запчастей
                    </h2>
                </div>

                <span className="text-xs text-[var(--text-dim)]">
                    Узлов: {nodesCount}
                    {' · '}
                    Деталей: {visiblePartsCount}
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
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                {categoryLabels[category] || category}
                            </h3>

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
                                                        ? 'Подходит деталей'
                                                        : 'Деталей в базе'}
                                                    :{' '}
                                                    {node.items.length}
                                                </p>
                                            </div>

                                            <Link
                                                href={href}
                                                className="shrink-0 rounded-lg bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] transition hover:bg-[var(--link)] hover:text-[var(--btn-primary-text)]"
                                            >
                                                Открыть
                                            </Link>
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