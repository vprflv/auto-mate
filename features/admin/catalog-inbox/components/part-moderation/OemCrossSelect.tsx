'use client';

import * as React from 'react';
import { Link2, Search } from 'lucide-react';

import { normalizeArticle } from '@/features/admin/lib/system-store/normalizeArticle';

export interface OemSuggestion {
    id: string;
    article: string;
    brand: string;
    name: string;
    nodeTitle: string;
    sameNode: boolean;
    source: 'catalog' | 'cross';
}

interface Props {
    value: string;
    onChange: (value: string) => void;
    suggestions: OemSuggestion[];
    label?: string;
    compact?: boolean;
}

export function OemCrossSelect({
                                   value,
                                   onChange,
                                   suggestions,
                                   label = 'Привязка к оригиналу (OEM Кросс)',
                                   compact = false
                               }: Props) {
    const [isOpen, setIsOpen] = React.useState(false);

    const inputId = React.useId();
    const resultsId = `${inputId}-results`;

    const query = normalizeArticle(value);
    const showResults = isOpen && query.length > 0;

    const filteredSuggestions = React.useMemo(() => {
        if (!query) return [];

        const unique = new Map<string, OemSuggestion>();

        for (const item of suggestions) {
            const key = normalizeArticle(item.article);

            if (!key || !key.includes(query)) continue;

            const existing = unique.get(key);

            if (
                !existing ||
                (existing.source === 'cross' &&
                    item.source === 'catalog')
            ) {
                unique.set(key, item);
            }
        }

        return Array.from(unique.values())
            .sort((a, b) => {
                const aArticle = normalizeArticle(a.article);
                const bArticle = normalizeArticle(b.article);

                // Точное совпадение, затем совпадение с начала номера.
                return (
                    Number(bArticle === query) -
                    Number(aArticle === query) ||
                    Number(bArticle.startsWith(query)) -
                    Number(aArticle.startsWith(query)) ||
                    Number(b.sameNode) - Number(a.sameNode) ||
                    Number(b.source === 'catalog') -
                    Number(a.source === 'catalog') ||
                    a.article.localeCompare(b.article)
                );
            })
            .slice(0, 5);
    }, [suggestions, query]);

    const selectArticle = (article: string) => {
        onChange(article);
        setIsOpen(false);
    };

    return (
        <div
            className={
                compact
                    ? 'min-w-0 flex-1'
                    : 'col-span-2 mt-1 rounded-xl border border-blue-500/10 bg-blue-500/5 p-3'
            }
        >
            <label
                htmlFor={inputId}
                className={
                    compact
                        ? 'sr-only'
                        : 'mb-1.5 flex items-center gap-1.5 text-xs font-bold text-blue-500/80'
                }
            >
                {!compact && <Link2 className="h-3.5 w-3.5" />}
                {label}
            </label>

            <div
                className="relative"
                onBlur={event => {
                    if (
                        !event.currentTarget.contains(
                            event.relatedTarget
                        )
                    ) {
                        setIsOpen(false);
                    }
                }}
            >
                <div className="relative">
                    <input
                        id={inputId}
                        type="text"
                        value={value}
                        autoComplete="off"
                        onFocus={() => setIsOpen(true)}
                        onChange={event => {
                            onChange(event.target.value);
                            setIsOpen(true);
                        }}
                        onKeyDown={event => {
                            if (event.key === 'Escape') {
                                setIsOpen(false);
                                event.stopPropagation();
                            }
                        }}
                        placeholder="Введите или выберите OEM-номер"
                        aria-expanded={showResults}
                        aria-controls={
                            showResults ? resultsId : undefined
                        }
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] py-2 pl-3 pr-9 font-mono text-sm text-[var(--text)] outline-none focus:border-blue-500/50"
                    />

                    <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                </div>

                {showResults && (
                    <div
                        id={resultsId}
                        className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 shadow-xl"
                    >
                        {filteredSuggestions.map(item => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() =>
                                    selectArticle(item.article)
                                }
                                className="flex w-full items-start justify-between gap-2 rounded-lg px-3 py-2 text-left transition hover:bg-[var(--bg-elevated)] focus:bg-[var(--bg-elevated)] focus:outline-none"
                            >
                                <div className="min-w-0">
                                    <div className="break-all font-mono text-xs font-bold text-[var(--text)]">
                                        {item.article}
                                    </div>

                                    {(item.brand || item.name) && (
                                        <div className="truncate text-xs text-[var(--text-muted)]">
                                            {[item.brand, item.name]
                                                .filter(Boolean)
                                                .join(' · ')}
                                        </div>
                                    )}

                                    <div className="truncate text-[10px] text-[var(--text-muted)]">
                                        {item.nodeTitle}
                                    </div>
                                </div>

                                <span
                                    className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-medium ${
                                        item.source === 'catalog'
                                            ? 'bg-emerald-500/10 text-emerald-500'
                                            : 'bg-amber-500/10 text-amber-500'
                                    }`}
                                >
                                    {item.source === 'catalog'
                                        ? 'В каталоге'
                                        : 'Из кроссов'}
                                </span>
                            </button>
                        ))}

                        {filteredSuggestions.length === 0 && (
                            <div className="px-3 py-4 text-center text-xs text-[var(--text-muted)]">
                                Совпадений нет. Можно ввести номер вручную.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {!compact && (
                <p className="mt-2 text-[10px] text-[var(--text-muted)]">
                    «Из кроссов» — номер уже использовался,
                    но оригинальная деталь ещё не создана.
                </p>
            )}
        </div>
    );
}