'use client';

import { Filter, RotateCcw } from 'lucide-react';

import {
    catalogFilterFields,
    type CatalogFilters,
    type CatalogFilterKey
} from '../lib/catalogFilters';

interface Props {
    filters: CatalogFilters;
    filterOptions: Record<CatalogFilterKey, string[]>;
    hasActiveFilters: boolean;
    matchingModCount: number;
    isPending: boolean;

    onChange: (
        key: CatalogFilterKey,
        value: string
    ) => void;

    onReset: () => void;
}

export function ModelCatalogFilters({
                                        filters,
                                        filterOptions,
                                        hasActiveFilters,
                                        matchingModCount,
                                        isPending,
                                        onChange,
                                        onReset
                                    }: Props) {
    return (
        <section
            aria-busy={isPending}
            className="rounded-3xl border border-[var(--border)]/60 bg-[var(--card)] p-5 shadow-sm sm:p-6"
        >
            <div className="mb-5 flex flex-col justify-between gap-4 border-b border-[var(--border)]/30 pb-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-[var(--link)]" />

                    <h2 className="text-lg font-bold text-[var(--text)]">
                        Параметры автомобиля
                    </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <span
                        aria-live="polite"
                        className="text-xs text-[var(--text-muted)]"
                    >
                        {isPending ? (
                            'Обновляем…'
                        ) : (
                            <>
                                Модификаций:{' '}
                                <span className="font-bold text-[var(--text)]">
                                    {matchingModCount}
                                </span>
                            </>
                        )}
                    </span>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            disabled={isPending}
                            onClick={onReset}
                            className="flex items-center gap-1.5 rounded-lg bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] transition hover:text-[var(--text)] disabled:cursor-wait disabled:opacity-50"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Сбросить
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {catalogFilterFields.map(field => (
                    <div
                        key={field.key}
                        className="space-y-1.5"
                    >
                        <label
                            htmlFor={`catalog-${field.key}`}
                            className="ml-1 text-xs font-bold uppercase text-[var(--text-dim)]"
                        >
                            {field.label}
                        </label>

                        <select
                            id={`catalog-${field.key}`}
                            value={filters[field.key]}
                            disabled={isPending}
                            onChange={event =>
                                onChange(
                                    field.key,
                                    event.target.value
                                )
                            }
                            className="w-full cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--link)] disabled:cursor-wait disabled:opacity-50"
                        >
                            <option value="all">
                                {field.allLabel}
                            </option>

                            {filterOptions[field.key].map(value => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>

            {hasActiveFilters && (
                <p className="mt-4 text-xs leading-relaxed text-[var(--text-muted)]">
                    Показаны детали с подтверждённой
                    применимостью к найденным модификациям.
                    Детали с неуточнённой применимостью
                    доступны после сброса фильтров.
                </p>
            )}
        </section>
    );
}