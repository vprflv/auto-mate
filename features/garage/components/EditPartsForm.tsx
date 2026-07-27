'use client';

import { useState } from 'react';
import { CarParts, CarPartItem, PartCategory } from '@/types';
import {
    PART_CATEGORY_LABELS,
    PART_CATEGORY_ORDER,
} from '@/features/garage/lib/config/partCategories'; // поправь путь
import { Plus, Trash2 } from 'lucide-react';

type Props = {
    initialParts?: CarParts;
    onSave: (parts: CarParts) => void;
    onCancel: () => void;
};

function createEmptyItem(category: PartCategory = 'filters'): CarPartItem {
    return {
        id: crypto.randomUUID(),
        name: '',
        category,
        quantity: 1,
    };
}

export default function EditPartsForm({
                                          initialParts,
                                          onSave,
                                          onCancel,
                                      }: Props) {
    const [items, setItems] = useState<CarPartItem[]>(
        initialParts?.items?.length
            ? structuredClone(initialParts.items)
            : [createEmptyItem()]
    );
    const [saving, setSaving] = useState(false);

    const updateItem = (id: string, patch: Partial<CarPartItem>) => {
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
        );
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const addItem = () => {
        setItems((prev) => [...prev, createEmptyItem()]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const cleaned = items
            .map((item) => ({
                ...item,
                name: item.name.trim(),
                brand: item.brand?.trim() || undefined,
                oemNumber: item.oemNumber?.trim() || undefined,
                analogNumber: item.analogNumber?.trim() || undefined,
                notes: item.notes?.trim() || undefined,
                quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
            }))
            .filter((item) => item.name.length > 0);

        setSaving(true);
        onSave({ items: cleaned });
        setSaving(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Запчасти и расходники</h1>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-sm text-zinc-400 hover:text-zinc-200"
                >
                    Отмена
                </button>
            </div>

            <div className="space-y-4">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-500">#{index + 1}</span>
                            <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="text-zinc-500 hover:text-red-400 transition"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        {/* Категория */}
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Категория</label>
                            <select
                                value={item.category}
                                onChange={(e) =>
                                    updateItem(item.id, {
                                        category: e.target.value as PartCategory,
                                    })
                                }
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            >
                                {PART_CATEGORY_ORDER.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {PART_CATEGORY_LABELS[cat]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Название */}
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">
                                Название *
                            </label>
                            <input
                                required
                                value={item.name}
                                onChange={(e) => updateItem(item.id, { name: e.target.value })}
                                placeholder="Масляный фильтр, передние колодки…"
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Бренд</label>
                                <input
                                    value={item.brand || ''}
                                    onChange={(e) =>
                                        updateItem(item.id, { brand: e.target.value })
                                    }
                                    placeholder="Mann, Bosch…"
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Кол-во</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={item.quantity ?? 1}
                                    onChange={(e) =>
                                        updateItem(item.id, {
                                            quantity: Number(e.target.value) || 1,
                                        })
                                    }
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">
                                    Ориг. номер
                                </label>
                                <input
                                    value={item.oemNumber || ''}
                                    onChange={(e) =>
                                        updateItem(item.id, { oemNumber: e.target.value })
                                    }
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Аналог</label>
                                <input
                                    value={item.analogNumber || ''}
                                    onChange={(e) =>
                                        updateItem(item.id, { analogNumber: e.target.value })
                                    }
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Заметка</label>
                            <input
                                value={item.notes || ''}
                                onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                                placeholder="необязательно"
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addItem}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition"
            >
                <Plus size={18} />
                Добавить позицию
            </button>

            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3 rounded-2xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
                >
                    Отмена
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition"
                >
                    {saving ? 'Сохраняю…' : 'Сохранить'}
                </button>
            </div>
        </form>
    );
}