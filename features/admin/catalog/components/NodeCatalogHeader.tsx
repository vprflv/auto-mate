import Link from 'next/link';
import { ChevronLeft, Wrench, Filter } from 'lucide-react';

import type { StoredCatalogNode } from '@/features/admin/lib/system-store/types';

interface Props {
    node: StoredCatalogNode;
    visiblePartsCount: number;

    hasActiveFilters: boolean;
    activeFilterLabels: string[];
    matchingModCount: number;

    modelHref: string;
    nodePath: string;
}

export function NodeCatalogHeader({
                                      node,
                                      visiblePartsCount,
                                      hasActiveFilters,
                                      activeFilterLabels,
                                      matchingModCount,
                                      modelHref,
                                      nodePath
                                  }: Props) {
    return (
        <div className="space-y-4">
            <Link
                href={modelHref}
                className="inline-flex items-center gap-1 text-sm font-medium text-[var(--text-muted)] transition hover:text-[var(--link)]"
            >
                <ChevronLeft className="h-4 w-4" />
                Назад к автомобилю
            </Link>

            <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[var(--border)]/40 bg-[var(--card)] p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
                <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--link)]/10 text-[var(--link)]">
                            <Wrench className="h-5 w-5" />
                        </div>

                        <h1 className="break-words text-2xl font-bold text-[var(--text)]">
                            {node.title}
                        </h1>
                    </div>

                    <p className="text-sm uppercase tracking-wider text-[var(--text-muted)]">
                        Категория: {node.category}
                    </p>
                </div>

                <div className="shrink-0 sm:text-right">
                    <p className="text-3xl font-black text-[var(--text)]">
                        {visiblePartsCount}
                    </p>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">
                        {hasActiveFilters
                            ? 'подходит деталей'
                            : 'деталей в базе'}
                    </p>

                    {hasActiveFilters && (
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                            Всего в узле: {node.items.length}
                        </p>
                    )}
                </div>
            </div>

            {hasActiveFilters && (
                <div className="space-y-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-blue-500" />

                            <p className="text-xs font-bold text-[var(--text)]">
                                Выбранные параметры
                            </p>
                        </div>

                        <span className="text-xs text-[var(--text-muted)]">
                            Модификаций: {matchingModCount}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {activeFilterLabels.map(label => (
                            <span
                                key={label}
                                className="rounded-lg border border-blue-500/20 bg-[var(--card)] px-2 py-1 text-xs text-[var(--text)]"
                            >
                                {label}
                            </span>
                        ))}
                    </div>

                    <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                        Показаны только детали с подтверждённой
                        применимостью к выбранным модификациям.
                    </p>

                    <Link
                        href={nodePath}
                        className="inline-flex text-xs font-bold text-blue-500 transition hover:underline"
                    >
                        Сбросить фильтры и показать все детали узла
                    </Link>
                </div>
            )}
        </div>
    );
}