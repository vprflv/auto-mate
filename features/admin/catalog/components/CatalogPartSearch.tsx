'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';

import { storage } from '@/features/admin/lib/system-store/storage';
import { getOemCrosses } from '@/features/admin/lib/system-store/oemCrosses';
import { searchCatalogParts } from '../lib/searchCatalogParts';

type SearchRow = {
    key: string;
    href: string;
    name: string;
    brand: string;
    article: string;
    isOem: boolean;
    oemCrosses: string[];
    modelName: string;
    nodeTitle: string;
    applicability: string;
};

export function CatalogPartSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchRow[] | null>(null);

    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!query.trim()) return;

        const { catalogNodes, masterModels } = storage.getState();

        const rows = searchCatalogParts(catalogNodes, query).map(({ node, part }) => {
            const model = masterModels.find(item =>
                item.brandSlug === node.brandSlug &&
                item.modelSlug === node.modelSlug
            );



            const modificationIds = part.compatibleModifications ?? [];
            const modifications = model?.modifications;
            const namesById = new Map<string, string>();

            if (Array.isArray(modifications)) {
                for (const modification of modifications) {
                    namesById.set(modification.id, modification.name);
                }
            }

            const modificationNames = modificationIds.map(
                id => namesById.get(id) ?? id
            );

            return {
                key: `${node.id}:${part.id}`,
                href: `/admin/catalog/${encodeURIComponent(node.brandSlug)}/${encodeURIComponent(node.modelSlug)}/${encodeURIComponent(node.id)}`,
                name: part.name,
                brand: part.brand,
                article: part.article,
                isOem: part.isOem,
                oemCrosses: getOemCrosses(part),
                modelName: model
                    ? `${model.brandName} ${model.modelName}`
                    : `${node.brandSlug} ${node.modelSlug}`,
                nodeTitle: node.title,
                applicability: modificationIds.includes('all')
                    ? 'Все модификации'
                    : modificationNames.join(', ') || 'Применимость не уточнена',
            };
        });

        setResults(rows);
    }

    return (
        <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <form onSubmit={handleSearch} className="space-y-2">
                <label className="block text-sm font-semibold">
                    Поиск запчастей по OEM или артикулу
                    <input
                        type="search"
                        value={query}
                        onChange={event => {
                            setQuery(event.target.value);
                            setResults(null);
                        }}
                        placeholder="Введите полный номер"
                        className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm font-normal"
                    />
                </label>

                <button
                    type="submit"
                    disabled={!query.trim()}
                    className="rounded-xl bg-[var(--btn-primary)] px-4 py-2 text-sm font-semibold text-[var(--btn-primary-text)] disabled:opacity-50"
                >
                    Найти
                </button>
            </form>

            {results?.length === 0 && (
                <p role="status" className="text-sm text-[var(--text-muted)]">
                    По этому номеру запчастей не найдено.
                </p>
            )}

            {results && results.length > 0 && (
                <ul className="space-y-2">
                    {results.map(row => (
                        <li key={row.key}>
                            <Link
                                href={row.href}
                                className="block space-y-1 rounded-xl border border-[var(--border)] p-3 hover:border-[var(--link)]"
                            >
                                <p className="font-semibold">{row.name}</p>
                                <p className="text-sm">
                                    {row.brand} · {row.isOem ? 'OEM' : 'Артикул'} {row.article}
                                </p>
                                {row.oemCrosses.length > 0 ? (
                                    <p className="text-sm">
                                        Связанные OEM · {row.oemCrosses.join(', ')}
                                    </p>
                                ) : null}
                                <p className="text-sm text-[var(--text-muted)]">
                                    {row.modelName} · {row.nodeTitle}
                                </p>
                                <p className="text-sm text-[var(--text-muted)]">
                                    {row.applicability}
                                </p>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}