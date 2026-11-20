'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { addPartsToModification } from '@/features/admin/lib/system-store/actions/updatePartCompatibility';
import { getCatalogCategoryLabel, sortCatalogCategoryKeys } from '@/features/admin/lib/system-store/categoryLabels';
import { normalizeArticle } from '@/features/admin/lib/system-store/normalizeArticle';
import { getOemCrosses } from '@/features/admin/lib/system-store/oemCrosses';
import { storage } from '@/features/admin/lib/system-store/storage';
import { STORAGE_KEY } from '@/features/admin/lib/system-store/defaults';
import type { StoredMasterModel, StoredCatalogNode } from '@/features/admin/lib/system-store/types';

type PartRef = { nodeId: string; partId: string };

export function ModificationPartsPicker({ model, modificationId, modelPath }: {
    model: StoredMasterModel;
    modificationId: string;
    modelPath: string;
}) {
    const router = useRouter();
    const [state, setState] = useState(() => storage.getState());
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState(new Map<string, PartRef>());
    const [error, setError] = useState('');

    useEffect(() => {
        const refresh = () => setState(storage.getState());
        const onStorage = (event: StorageEvent) => {
            if (event.key === STORAGE_KEY || event.key === null) refresh();
        };
        window.addEventListener('system-store-updated', refresh);
        window.addEventListener('storage', onStorage);
        refresh();
        return () => {
            window.removeEventListener('system-store-updated', refresh);
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    const currentModel = state.masterModels.find(item =>
        item.brandSlug === model.brandSlug && item.modelSlug === model.modelSlug
    );
    const modifications = currentModel?.modifications ?? [];
    const modification = modifications.find(item => item.id === modificationId);
    const names = new Map(modifications.map(item => [item.id, item.name]));
    const number = normalizeArticle(query);
    const categories = new Map<string, StoredCatalogNode[]>();
    for (const node of state.catalogNodes) {
        if (node.brandSlug !== model.brandSlug || node.modelSlug !== model.modelSlug) continue;
        const items = node.items.filter(part =>
            !part.compatibleModifications?.includes('all') &&
            (!number || [part.article, ...getOemCrosses(part)].some(value => normalizeArticle(value).includes(number)))
        );
        if (!items.length) continue;
        const nodes = categories.get(node.category) ?? [];
        nodes.push({ ...node, items });
        categories.set(node.category, nodes);
    }

    function save() {
        if (selected.size === 0) return;
        try {
            addPartsToModification({
                brandSlug: model.brandSlug,
                modelSlug: model.modelSlug,
                modificationId,
                parts: [...selected.values()],
            });
            router.replace(modelPath);
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'Не удалось привязать запчасти.');
        }
    }

    if (!modification) return (
        <div className="space-y-3">
            <p>Модификация больше не найдена.</p>
            <Link href={modelPath} replace className="text-[var(--link)]">Вернуться к модели</Link>
        </div>
    );

    return (
        <section className="mx-auto max-w-5xl space-y-5">
            <header className="space-y-2">
                <h1 className="text-xl font-bold">Подобрать запчасти</h1>
                <p className="text-sm text-[var(--text-muted)]">
                    {model.brandName} {model.modelName} · {modification.name}
                </p>
            </header>

            <label className="block space-y-1 text-sm font-medium">
                <span>Поиск по OEM или артикулу</span>
                <input
                    type="search"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    className="block w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2"
                />
            </label>

            {categories.size === 0 && (
                <p role="status" className="text-sm text-[var(--text-muted)]">
                    {number ? 'По этому номеру ничего не найдено.' : 'Нет запчастей для подбора.'}
                </p>
            )}

            {sortCatalogCategoryKeys([...categories.keys()], state.catalogCategoryOrder, state.catalogCategoryLabels).map(category => (
                <section key={category} className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                    <h2 className="font-bold">{getCatalogCategoryLabel(category, state.catalogCategoryLabels)}</h2>
                    {(categories.get(category) ?? []).map(node => (
                        <section key={node.id} className="space-y-2">
                            <h3 className="text-sm font-semibold text-[var(--text-muted)]">{node.title}</h3>
                            <ul className="divide-y divide-[var(--border)]">
                                {node.items.map(part => {
                                    const key = JSON.stringify([node.id, part.id]);
                                    const ids = part.compatibleModifications ?? [];
                                    const linked = ids.includes(modificationId);
                                    return (
                                        <li key={key}>
                                            <label className="flex items-start gap-3 py-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={linked || selected.has(key)}
                                                    disabled={linked}
                                                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--link)]"
                                                    onChange={event => {
                                                        const checked = event.target.checked;
                                                        setError('');
                                                        setSelected(current => {
                                                            const next = new Map(current);
                                                            if (checked) next.set(key, { nodeId: node.id, partId: part.id });
                                                            else next.delete(key);
                                                            return next;
                                                        });
                                                    }}
                                                />
                                                <span className="min-w-0 break-words">
                                                    <strong>{part.name}</strong>
                                                    <span className="block">{part.brand} · {part.article}</span>
                                                    <span className="block text-xs text-[var(--text-muted)]">
                                                        {ids.map(id => names.get(id)).filter(Boolean).join(', ') || 'Применимость не указана'}
                                                        {linked && ' · Уже привязана'}
                                                    </span>
                                                </span>
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    ))}
                </section>
            ))}

            <div className="sticky bottom-0 space-y-2 border-t border-[var(--border)] bg-[var(--bg)] py-3">
                {error && <p role="alert" className="text-sm text-[var(--danger)]">{error}</p>}
                <div className="flex flex-wrap justify-end gap-3">
                    <Link href={modelPath} replace className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm">Пропустить</Link>
                    <button
                        type="button"
                        onClick={save}
                        disabled={selected.size === 0}
                        className="rounded-xl bg-[var(--btn-primary)] px-4 py-2 text-sm font-semibold text-[var(--btn-primary-text)] disabled:opacity-50"
                    >
                        Привязать выбранные ({selected.size})
                    </button>
                </div>
            </div>
        </section>
    );
}
