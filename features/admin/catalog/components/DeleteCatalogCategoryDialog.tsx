'use client';

import { useId, useState } from 'react';
import { Dialog } from 'radix-ui';
import { Trash2 } from 'lucide-react';
import { getCatalogCategoryKeys, getCatalogCategoryLabel, getCatalogSectionOptions, sortCatalogCategoryKeys } from '@/features/admin/lib/system-store/categoryLabels';
import { deleteEmptyCatalogCategory, moveCatalogCategoryParts } from '@/features/admin/lib/system-store/actions/moveCatalogPart';
import { storage } from '@/features/admin/lib/system-store/storage';
import type { SystemState } from '@/features/admin/lib/system-store/types';

const NEW_CATEGORY = '__NEW_CATEGORY__';
const fieldClass = 'w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2';
const buttonClass = 'rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--bg-elevated)] disabled:opacity-50';

interface Props {
    category: string;
    categoryLabel: string;
}

export function DeleteCatalogCategoryDialog({ category: source, categoryLabel }: Props) {
    const [state, setState] = useState<SystemState | null>(null);
    const [destination, setDestination] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [title, setTitle] = useState('');
    const [selected, setSelected] = useState<Set<string>>(() => new Set());
    const [error, setError] = useState('');
    const optionsId = useId();

    const nodes = state?.catalogNodes ?? [];
    const labels = state?.catalogCategoryLabels;
    const categories = sortCatalogCategoryKeys(
        getCatalogCategoryKeys(nodes.map(node => node.category).filter(Boolean), state?.hiddenCatalogCategories),
        state?.catalogCategoryOrder,
        labels
    );
    const models = new Map(state?.masterModels.map(model => [
        JSON.stringify([model.brandSlug, model.modelSlug]),
        model.brandName + ' ' + model.modelName,
    ] as const));
    const rows = nodes.filter(node => source && node.category === source).flatMap(node =>
        node.items.map(part => ({
            key: JSON.stringify([node.id, part.id]),
            nodeId: node.id,
            part,
            section: node.title,
            model: models.get(JSON.stringify([node.brandSlug, node.modelSlug])) ??
                node.brandSlug + ' ' + node.modelSlug,
        }))
    );
    const selectedRows = rows.filter(row => selected.has(row.key));
    const category = destination === NEW_CATEGORY ? newCategory : destination;
    const options = getCatalogSectionOptions(nodes, destination).existingNodes;

    function selectDestination(value: string) {
        setDestination(value);
        setNewCategory('');
        setTitle('');
        setError('');
    }

    function changeOpen(open: boolean) {
        setState(open ? storage.getState() : null);
        setSelected(new Set());
        selectDestination('');
    }

    function save() {
        setError('');
        try {
            if (!rows.length) {
                deleteEmptyCatalogCategory(source);
                changeOpen(false);
                return;
            }
            moveCatalogCategoryParts(source, selectedRows.map(row => ({
                nodeId: row.nodeId,
                partId: row.part.id,
            })), { category, title });
            setSelected(new Set());
            setState(storage.getState());
        } catch (failure: unknown) {
            setError(failure instanceof Error ? failure.message : 'Не удалось сохранить изменения.');
            setState(storage.getState());
        }
    }

    return (
        <Dialog.Root open={state !== null} onOpenChange={changeOpen}>
            <Dialog.Trigger asChild>
                <button
                    type="button"
                    title="Удалить категорию"
                    aria-label={`Удалить категорию «${categoryLabel}»`}
                    className="shrink-0 rounded-lg p-2 text-red-500 hover:bg-red-500/10"
                >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[300] bg-black/60" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-[301] flex max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--text)]">
                    <header className="space-y-1 px-5 pb-3 pt-5">
                        <Dialog.Title className="text-lg font-bold">Удаление категории «{categoryLabel}»</Dialog.Title>
                        <Dialog.Description className="text-sm text-[var(--text-muted)]">
                            Категория общая для всех моделей. Перед удалением перенесите из неё все запчасти.
                        </Dialog.Description>
                    </header>
                    <div className="min-h-0 space-y-4 overflow-y-auto px-5 pb-4 text-sm">
                        {!rows.length && <p>Категория пуста. Её можно удалить.</p>}
                        {rows.length > 0 && (
                            <>
                                <fieldset className="space-y-2">
                                    <legend className="mb-2 font-medium">Запчасти для переноса</legend>
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" checked={selectedRows.length === rows.length}
                                            onChange={event => setSelected(event.target.checked ? new Set(rows.map(row => row.key)) : new Set())}
                                        />
                                        Выбрать все ({selectedRows.length} из {rows.length})
                                    </label>
                                    <ul className="max-h-56 overflow-y-auto divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
                                        {rows.map(row => (
                                            <li key={row.key}>
                                                <label className="flex cursor-pointer items-start gap-3 px-3 py-2">
                                                    <input type="checkbox" className="mt-1" checked={selected.has(row.key)}
                                                        onChange={event => {
                                                            const next = new Set(selected);
                                                            if (event.target.checked) next.add(row.key);
                                                            else next.delete(row.key);
                                                            setSelected(next);
                                                            setError('');
                                                        }}
                                                    />
                                                    <span className="min-w-0 break-words">
                                                        <span className="block font-medium">{row.part.name}</span>
                                                        <span className="block text-xs text-[var(--text-muted)]">
                                                            {row.part.brand} {row.part.article} · {row.model} · {row.section}
                                                        </span>
                                                    </span>
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                </fieldset>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <label className="space-y-1">
                                        <span>Категория назначения</span>
                                        <select className={fieldClass} value={destination} onChange={event => selectDestination(event.target.value)}>
                                            <option value="">Выберите категорию</option>
                                            {categories.filter(key => key !== source).map(key => (
                                                <option key={key} value={key}>{getCatalogCategoryLabel(key, labels)}</option>
                                            ))}
                                            <option value={NEW_CATEGORY}>Создать категорию</option>
                                        </select>
                                    </label>
                                    {destination === NEW_CATEGORY && (
                                        <label className="space-y-1">
                                            <span>Название новой категории</span>
                                            <input className={fieldClass} value={newCategory} onChange={event => setNewCategory(event.target.value)} />
                                        </label>
                                    )}
                                    {destination && (
                                        <label className="space-y-1">
                                            <span>Подкатегория назначения</span>
                                            <input className={fieldClass} list={optionsId} value={title}
                                                onChange={event => setTitle(event.target.value)}
                                                placeholder="Выберите или введите название"
                                            />
                                            <datalist id={optionsId}>
                                                {options.map(option => <option key={option} value={option} />)}
                                            </datalist>
                                        </label>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    <footer className="space-y-2 border-t border-[var(--border)] p-4">
                        {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
                        <div className="flex flex-wrap justify-end gap-2">
                            <Dialog.Close asChild>
                                <button type="button" className={buttonClass}>Закрыть</button>
                            </Dialog.Close>
                            <button type="button" onClick={save}
                                disabled={rows.length > 0 && (!selectedRows.length || !category.trim() || !title.trim())}
                                className={buttonClass + (rows.length ? '' : ' text-red-500')}
                            >
                                {rows.length ? 'Перенести выбранные' : 'Удалить категорию'}
                            </button>
                        </div>
                    </footer>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
