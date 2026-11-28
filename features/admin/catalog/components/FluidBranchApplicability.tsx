'use client';

import { sortCatalogModifications } from '@/features/catalog/lib/sortCatalogModifications';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import type { StoredCatalogNode, StoredMasterModel } from '@/features/admin/lib/system-store/types';
import { setFluidBranchApplicability } from '@/features/admin/lib/system-store/actions/setFluidBranchApplicability';

export function FluidBranchApplicability({ node, model }: { node: StoredCatalogNode; model: StoredMasterModel }) {
    const [all, setAll] = useState(node.allowedModificationIds === undefined);
    const [selected, setSelected] = useState(() => new Set(node.allowedModificationIds));
    const modifications = sortCatalogModifications(model.modifications ?? []);
    const original = node.allowedModificationIds;
    const dirty = all ? original !== undefined :
        original === undefined || original.length !== selected.size || original.some(id => !selected.has(id));

    function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        try {
            setFluidBranchApplicability(node.id, all ? undefined : [...selected]);
            toast.success('Применимость ветки сохранена');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Не удалось сохранить применимость ветки.');
        }
    }

    return (
        <form onSubmit={save} className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <h2 className="font-semibold">Применимость ветки</h2>
            <p className="text-sm text-[var(--text-muted)]">
                Выберите, для каких модификаций показывать эту ветку, её жидкости и справочные объёмы.
            </p>
            <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={all} onChange={event => setAll(event.target.checked)} />
                Все модификации
            </label>
            {!all && (
                <div className="grid gap-2 sm:grid-cols-2">
                    {modifications.map(({ id, name, attributes }) => (
                        <label key={id} className="flex items-start gap-2 rounded-xl border border-[var(--border)] p-2 text-sm">
                            <input type="checkbox" className="mt-1" checked={selected.has(id)}
                                onChange={event => {
                                    const next = new Set(selected);
                                    if (event.target.checked) next.add(id);
                                    else next.delete(id);
                                    setSelected(next);
                                }} />
                            <span>
                                {name}
                                {attributes.transmission && (
                                    <span className="block text-xs text-[var(--text-muted)]">{attributes.transmission}</span>
                                )}
                            </span>
                        </label>
                    ))}
                    {!selected.size && <p className="text-xs text-[var(--text-muted)]">Ветка будет скрыта для всех модификаций.</p>}
                </div>
            )}
            <button type="submit" disabled={!dirty}
                className="rounded-xl bg-[var(--btn-primary)] px-3 py-2 text-sm font-medium text-[var(--btn-primary-text)] disabled:opacity-50">
                Сохранить применимость
            </button>
        </form>
    );
}
