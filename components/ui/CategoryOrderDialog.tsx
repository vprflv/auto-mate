'use client';

import { useState } from 'react';
import { Dialog } from 'radix-ui';
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react';
type Category = { id: string; label: string };

type Props = {
    getCategories: () => Category[];
    onSave: (ids: string[]) => void;
};

export function CategoryOrderDialog({ getCategories, onSave }: Props) {
    const [open, setOpen] = useState(false);
    const [order, setOrder] = useState<string[]>([]);
    const [labels, setLabels] = useState(new Map<string, string>());
    const [dragged, setDragged] = useState<string | null>(null);
    const [error, setError] = useState('');

    function changeOpen(value: boolean) {
        if (value) {
            const categories = getCategories();
            setOrder(categories.map(category => category.id));
            setLabels(new Map(categories.map(category => [category.id, category.label])));
            setError('');
        }
        setDragged(null);
        setOpen(value);
    }

    function move(key: string, targetIndex: number) {
        setOrder(current => {
            const from = current.indexOf(key);
            if (from < 0 || from === targetIndex || targetIndex < 0 || targetIndex >= current.length) return current;
            const next = current.filter(category => category !== key);
            next.splice(targetIndex, 0, key);
            return next;
        });
    }

    function save() {
        try {
            const keys = getCategories().map(category => category.id);
            const savedOrder = [...order.filter(key => keys.includes(key)), ...keys.filter(key => !order.includes(key))];
            onSave(savedOrder);
            changeOpen(false);
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'Не удалось сохранить порядок.');
        }
    }

    return (
        <Dialog.Root open={open} onOpenChange={changeOpen}>
            <Dialog.Trigger asChild>
                <button type="button" className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium hover:bg-[var(--bg-elevated)]">
                    Порядок категорий
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[300] bg-black/60" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-[301] flex max-h-[85vh] w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-[var(--text)]">
                    <Dialog.Title className="text-lg font-bold">Порядок категорий</Dialog.Title>
                    <Dialog.Description className="text-sm text-[var(--text-muted)]">
                        Перетащите категорию или переместите её стрелками.
                    </Dialog.Description>
                    <ul className="min-h-0 space-y-1 overflow-y-auto">
                        {order.map((key, index) => {
                            const label = labels.get(key) ?? key;
                            return (
                                <li key={key}
                                    className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
                                    onDragOver={event => {
                                        if (dragged && dragged !== key) event.preventDefault();
                                    }}
                                    onDrop={event => {
                                        event.preventDefault();
                                        if (dragged) move(dragged, index);
                                        setDragged(null);
                                    }}
                                >
                                    <span draggable aria-hidden="true" className="cursor-grab p-1.5"
                                        onDragStart={event => {
                                            event.dataTransfer.effectAllowed = 'move';
                                            event.dataTransfer.setData('text/plain', key);
                                            setDragged(key);
                                        }}
                                        onDragEnd={() => setDragged(null)}
                                    >
                                        <GripVertical size={16} />
                                    </span>
                                    <span className="min-w-0 flex-1 break-words">{label}</span>
                                    <button type="button" aria-label={`Выше: ${label}`} disabled={index === 0}
                                        onClick={() => move(key, index - 1)} className="rounded p-2 hover:bg-[var(--bg-elevated)] disabled:opacity-30">
                                        <ArrowUp size={16} aria-hidden="true" />
                                    </button>
                                    <button type="button" aria-label={`Ниже: ${label}`} disabled={index === order.length - 1}
                                        onClick={() => move(key, index + 1)} className="rounded p-2 hover:bg-[var(--bg-elevated)] disabled:opacity-30">
                                        <ArrowDown size={16} aria-hidden="true" />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    {error && <p role="alert" className="text-sm text-[var(--danger)]">{error}</p>}
                    <div className="flex justify-end gap-2">
                        <Dialog.Close asChild>
                            <button type="button" className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm">Отмена</button>
                        </Dialog.Close>
                        <button type="button" onClick={save} className="rounded-xl bg-[var(--btn-primary)] px-4 py-2 text-sm font-semibold text-[var(--btn-primary-text)]">Сохранить</button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
