'use client';

import { useEffect, useState } from 'react';

import { FLUID_CATEGORY_OPTIONS } from '@/features/garage/lib/config/serviceItemCategories';
import { CarFluidItem, FluidCategory } from '@/types/oil';
import { Package } from 'lucide-react';

type Props = {
    item: CarFluidItem | null;
    open: boolean;
    onClose: () => void;
    onSave: (item: CarFluidItem) => void;
    onDelete?: (id: string) => void;
};

export default function EditFluidModal({
                                           item,
                                           open,
                                           onClose,
                                           onSave,
                                           onDelete,
                                       }: Props) {
    const [form, setForm] = useState<CarFluidItem | null>(null);

    useEffect(() => {
        if (item) {
            setForm(structuredClone(item));
        } else if (open) {
            setForm({
                id: crypto.randomUUID(),
                category: 'engineOil',
                name: '',
            });
        }
    }, [item, open]);

    if (!open || !form) return null;

    const set = (patch: Partial<CarFluidItem>) =>
        setForm((prev) => (prev ? { ...prev, ...patch } : prev));

    const handleSave = () => {
        if (!form.name.trim()) return;

        onSave({
            ...form,
            name: form.name.trim(),
            brand: form.brand?.trim() || undefined,
            spec: form.spec?.trim() || undefined,
            volume: form.volume?.trim() || undefined,
            notes: form.notes?.trim() || undefined,
        });
        onClose();
    };

    const fieldClass =
        'w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] placeholder:text-[#666666] outline-none focus:border-[#39FF14] transition';

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />

            <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#161616] border border-[#2A2A2A] rounded-t-3xl sm:rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#F5F5F5]">
                        {item ? 'Редактировать жидкость' : 'Добавить жидкость'}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm text-[#A3A3A3] hover:text-[#39FF14] transition"
                    >
                        Закрыть
                    </button>
                </div>

                <div>
                    <label className="block text-xs text-[#39FF14] mb-2">Фото</label>

                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] overflow-hidden flex items-center justify-center shrink-0">
                            {form.photo ? (
                                <img src={form.photo} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <Package className="w-8 h-8 text-[#3A3A3A]" strokeWidth={1.5} />
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="cursor-pointer text-sm text-[#39FF14] hover:text-[#57FF3A] transition">
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
                                    className="text-sm text-red-400 hover:text-red-300 text-left transition"
                                >
                                    Удалить фото
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/*<div>*/}
                {/*    <label className="block text-xs text-[#39FF14] mb-1">Тип жидкости</label>*/}
                {/*    <select*/}
                {/*        value={form.category}*/}
                {/*        onChange={(e) => set({ category: e.target.value as FluidCategory })}*/}
                {/*        className={fieldClass}*/}
                {/*    >*/}
                {/*        {FLUID_CATEGORY_OPTIONS.map((opt) => (*/}
                {/*            <option key={opt.value} value={opt.value}>*/}
                {/*                {opt.label}*/}
                {/*            </option>*/}
                {/*        ))}*/}
                {/*    </select>*/}
                {/*</div>*/}

                <div>
                    <label className="block text-xs text-[#39FF14] mb-1">Название *</label>
                    <input
                        value={form.name}
                        onChange={(e) => set({ name: e.target.value })}
                        placeholder="5W-30, G12++, DOT-4…"
                        className={fieldClass}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-[#39FF14] mb-1">Бренд</label>
                        <input
                            value={form.brand || ''}
                            onChange={(e) => set({ brand: e.target.value })}
                            className={fieldClass}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-[#39FF14] mb-1">Объём</label>
                        <input
                            value={form.volume || ''}
                            onChange={(e) => set({ volume: e.target.value })}
                            placeholder="4.5 л"
                            className={fieldClass}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-[#39FF14] mb-1">Спецификация</label>
                    <input
                        value={form.spec || ''}
                        onChange={(e) => set({ spec: e.target.value })}
                        placeholder="API SN, ACEA C3…"
                        className={fieldClass}
                    />
                </div>

                <div>
                    <label className="block text-xs text-[#39FF14] mb-1">Заметка</label>
                    <input
                        value={form.notes || ''}
                        onChange={(e) => set({ notes: e.target.value })}
                        className={fieldClass}
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    {item && onDelete && (
                        <button
                            type="button"
                            onClick={() => {
                                onDelete(form.id);
                                onClose();
                            }}
                            className="px-4 py-3 rounded-2xl text-red-400 text-sm border border-red-900/50 hover:bg-red-950/40 transition"
                        >
                            Удалить
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 rounded-2xl bg-[#1F1F1F] hover:bg-[#2A2A2A] text-sm text-[#F5F5F5] transition"
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="flex-1 py-3 rounded-2xl bg-[#39FF14] hover:bg-[#57FF3A] text-sm font-medium text-black transition"
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
}