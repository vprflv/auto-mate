'use client';

import { catalogBranchLabel } from '@/features/admin/lib/system-store/catalogBranches';

import { useEffect, useState, type FormEvent } from 'react';

import { STORAGE_KEY } from '@/features/admin/lib/system-store/defaults';
import { storage } from '@/features/admin/lib/system-store/storage';
import { getOemCrosses } from '@/features/admin/lib/system-store/oemCrosses';
import { searchCatalogParts } from '../lib/searchCatalogParts';
import { PartDetailsModal } from './part-details/PartDetailsModal';

type SearchRow = {
    key: string;
    nodeId: string;
    partId: string;
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
    const [submittedQuery, setSubmittedQuery] = useState('');
    const [snapshot, setSnapshot] = useState<ReturnType<typeof storage.getState> | null>(null);
    const [selection, setSelection] = useState<{ nodeId: string; partId: string } | null>(null);

    useEffect(() => {
        const refresh = () => setSnapshot(storage.getState());
        const onStorage = (event: StorageEvent) => {
            if (event.key === STORAGE_KEY || event.key === null) refresh();
        };

        window.addEventListener('system-store-updated', refresh);
        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener('system-store-updated', refresh);
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!query.trim()) return;

        setSnapshot(storage.getState());
        setSubmittedQuery(query.trim());
    }

    const results: SearchRow[] | null = submittedQuery && snapshot
        ? searchCatalogParts(snapshot.catalogNodes, submittedQuery).map(({ node, part }) => {
            const model = snapshot.masterModels.find(item =>
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
                nodeId: node.id,
                partId: part.id,
                name: part.name,
                brand: part.brand,
                article: part.article,
                isOem: part.isOem,
                oemCrosses: getOemCrosses(part),
                modelName: model
                    ? `${model.brandName} ${model.modelName}`
                    : `${node.brandSlug} ${node.modelSlug}`,
                nodeTitle: catalogBranchLabel(node),
                applicability: modificationIds.includes('all')
                    ? 'Все модификации'
                    : modificationNames.join(', ') || 'Применимость не уточнена',
            };
        })
        : null;

    const selectedNode = selection
        ? snapshot?.catalogNodes.find(node => node.id === selection.nodeId)
        : undefined;
    const selectedPart = selectedNode?.items.find(part => part.id === selection?.partId);

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
                            setSubmittedQuery('');
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
                            <button
                                type="button"
                                onClick={() => {
                                    setSnapshot(storage.getState());
                                    setSelection({ nodeId: row.nodeId, partId: row.partId });
                                }}
                                className="block w-full space-y-1 rounded-xl border border-[var(--border)] p-3 text-left hover:border-[var(--link)]"
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
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {selectedNode && selectedPart && (
                <PartDetailsModal
                    key={`${selectedNode.id}:${selectedPart.id}`}
                    isOpen
                    onClose={() => setSelection(null)}
                    node={selectedNode}
                    part={selectedPart}
                />
            )}
        </section>
    );
}
