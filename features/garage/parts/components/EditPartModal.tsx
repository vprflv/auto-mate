'use client';

import { useEffect, useState } from 'react';
import { CarPartItem, PartCategory } from '@/types';
import {
    PART_CATEGORY_LABELS,
    PART_CATEGORY_ORDER,
} from '@/features/garage/lib/config/partCategories';
import {
    PART_SUBCATEGORY_LABELS,
    PART_SUBCATEGORY_ORDER,
} from '@/features/garage/lib/config/partSubcategories';
import {Package} from "lucide-react";

type Props = {
    item: CarPartItem | null;
    open: boolean;
    onClose: () => void;
    onSave: (item: CarPartItem) => void;
    onDelete?: (id: string) => void;
};

export default function EditPartModal({
                                          item,
                                          open,
                                          onClose,
                                          onSave,
                                          onDelete,
                                      }: Props) {
    const [form, setForm] = useState<CarPartItem | null>(null);

    useEffect(() => {
        if (item) setForm(structuredClone(item));
    }, [item]);

    if (!open || !form) return null;

    const subs = PART_SUBCATEGORY_ORDER[form.category] ?? ['other'];

    const set = (patch: Partial<CarPartItem>) =>
        setForm((prev) => (prev ? { ...prev, ...patch } : prev));

    const handleSave = () => {
        if (!form.name.trim()) return;
        onSave({
            ...form,
            name: form.name.trim(),
            brand: form.brand?.trim() || undefined,
            oemNumber: form.oemNumber?.trim() || undefined,
            analogNumber: form.analogNumber?.trim() || undefined,
            notes: form.notes?.trim() || undefined,
            quantity: form.quantity && form.quantity > 0 ? form.quantity : 1,
            subcategory: form.subcategory || 'other',
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />

            <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Редактировать</h3>
                    <button type="button" onClick={onClose} className="text-zinc-400 text-sm">
                        Закрыть
                    </button>
                </div>

                {/* Фото */}
                <div>
                    <label className="block text-xs text-zinc-400 mb-2">Фото</label>

                    <div className="flex items-center gap-4">
                        {/* Превью */}
                        <div className="w-20 h-20 rounded-xl bg-zinc-950 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                            {form.photo ? (
                                <img
                                    src={form.photo}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Package className="w-8 h-8 text-zinc-600" strokeWidth={1.5} />
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="cursor-pointer text-sm text-blue-400 hover:text-blue-300">
                                {form.photo ? 'Заменить фото' : 'Добавить фото'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        const reader = new FileReader();
                                        reader.onload = () => {
                                            set({ photo: reader.result as string });
                                        };
                                        reader.readAsDataURL(file);
                                    }}
                                />
                            </label>

                            {form.photo && (
                                <button
                                    type="button"
                                    onClick={() => set({ photo: undefined })}
                                    className="text-sm text-red-400 hover:text-red-300 text-left"
                                >
                                    Удалить фото
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Перенос */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-zinc-400 mb-1">Категория</label>
                        <select
                            value={form.category}
                            onChange={(e) => {
                                const category = e.target.value as PartCategory;
                                const firstSub = PART_SUBCATEGORY_ORDER[category]?.[0] || 'other';
                                set({ category, subcategory: firstSub });
                            }}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm"
                        >
                            {PART_CATEGORY_ORDER.map((c) => (
                                <option key={c} value={c}>
                                    {PART_CATEGORY_LABELS[c]}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-zinc-400 mb-1">Подраздел</label>
                        <select
                            value={form.subcategory || 'other'}
                            onChange={(e) => set({ subcategory: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm"
                        >
                            {subs.map((s) => (
                                <option key={s} value={s}>
                                    {PART_SUBCATEGORY_LABELS[s] || s}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>



                <div>
                    <label className="block text-xs text-zinc-400 mb-1">Название *</label>
                    <input
                        value={form.name}
                        onChange={(e) => set({ name: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-zinc-400 mb-1">Бренд</label>
                        <input
                            value={form.brand || ''}
                            onChange={(e) => set({ brand: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-zinc-400 mb-1">Кол-во</label>
                        <input
                            type="number"
                            min={1}
                            value={form.quantity ?? 1}
                            onChange={(e) => set({ quantity: Number(e.target.value) || 1 })}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-zinc-400 mb-1">Ориг. номер</label>
                        <input
                            value={form.oemNumber || ''}
                            onChange={(e) => set({ oemNumber: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-zinc-400 mb-1">Аналог</label>
                        <input
                            value={form.analogNumber || ''}
                            onChange={(e) => set({ analogNumber: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-zinc-400 mb-1">Заметка</label>
                    <input
                        value={form.notes || ''}
                        onChange={(e) => set({ notes: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm"
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    {onDelete && (
                        <button
                            type="button"
                            onClick={() => {
                                onDelete(form.id);
                                onClose();
                            }}
                            className="px-4 py-3 rounded-2xl text-red-400 text-sm border border-red-900/50"
                        >
                            Удалить
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 rounded-2xl bg-zinc-800 text-sm"
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="flex-1 py-3 rounded-2xl bg-blue-600 text-white text-sm"
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
}