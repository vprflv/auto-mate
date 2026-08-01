'use client';

import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';

import { FLUID_CATEGORY_OPTIONS } from '@/features/garage/lib/config/serviceItemCategories';
import EditFluidModal from './EditFluidModal';
import {CarFluidItem, CarFluids, FluidCategory} from "@/types/oil";

type Props = {
    fluids?: CarFluids;
    onUpdateFluids?: (fluids: CarFluids) => void;
};

const CATEGORY_ORDER: FluidCategory[] = FLUID_CATEGORY_OPTIONS.map((o) => o.value);
const LABELS = Object.fromEntries(
    FLUID_CATEGORY_OPTIONS.map((o) => [o.value, o.label])
) as Record<FluidCategory, string>;

function formatFluid(item: CarFluidItem) {
    const parts = [item.spec, item.brand, item.volume].filter(Boolean);
    return parts.join(' • ') || item.name;
}

export default function CarFluidsCard({ fluids, onUpdateFluids }: Props) {
    const items = fluids?.items ?? [];
    const [category, setCategory] = useState<FluidCategory | null>(null);
    const [editItem, setEditItem] = useState<CarFluidItem | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const categoriesWithData = CATEGORY_ORDER.filter((c) =>
        items.some((i) => i.category === c)
    );

    const inCategory = category
        ? items.filter((i) => i.category === category)
        : [];

    const title = category ? LABELS[category] : 'Масла и техжидкости';

    const saveItem = (updated: CarFluidItem) => {
        const exists = items.some((i) => i.id === updated.id);
        const next = exists
            ? items.map((i) => (i.id === updated.id ? updated : i))
            : [...items, updated];

        onUpdateFluids?.({ items: next });
    };

    const deleteItem = (id: string) => {
        onUpdateFluids?.({ items: items.filter((i) => i.id !== id) });
    };

    const openCreate = (cat?: FluidCategory) => {
        setEditItem({
            id: crypto.randomUUID(),
            category: cat || 'engineOil',
            name: '',
        });
        setIsCreating(true);
    };

    return (
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3 min-w-0">
                    {category && (
                        <button
                            type="button"
                            onClick={() => setCategory(null)}
                            className="text-sm text-zinc-400 hover:text-white shrink-0"
                        >
                            ← Назад
                        </button>
                    )}
                    <h2 className="text-lg font-semibold truncate">{title}</h2>
                </div>

                {!category && (
                    <button
                        type="button"
                        onClick={() => openCreate()}
                        className="text-sm text-blue-400 hover:text-blue-300 shrink-0"
                    >
                        + Добавить
                    </button>
                )}
            </div>

            {/* 1. Разделы */}
            {!category && (
                <>
                    {items.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-zinc-500 text-sm mb-3">Пока не указано</p>
                            <button
                                type="button"
                                onClick={() => openCreate()}
                                className="text-sm text-blue-400 hover:text-blue-300"
                            >
                                Добавить первую жидкость
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {categoriesWithData.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setCategory(c)}
                                    className="bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-2xl px-4 py-4 text-left"
                                >
                                    <p className="text-sm font-medium">{LABELS[c]}</p>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        {items.filter((i) => i.category === c).length} поз.
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* 2. Список внутри раздела */}
            {category && (
                <div className="space-y-3">
                    {inCategory.length === 0 ? (
                        <p className="text-center text-zinc-500 text-sm py-6">Пока нет записей</p>
                    ) : (
                        inCategory.map((item) => (
                            <div
                                key={item.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                    setEditItem(item);
                                    setIsCreating(false);
                                }}
                                className="bg-zinc-950/50 border border-zinc-800 hover:border-zinc-600 rounded-2xl px-4 py-3 cursor-pointer transition flex items-start justify-between gap-3"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm text-white">{item.name}</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        {formatFluid(item)}
                                    </p>
                                </div>
                                <Pencil className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                            </div>
                        ))
                    )}

                    <button
                        type="button"
                        onClick={() => openCreate(category)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition"
                    >
                        <Plus size={18} />
                        Добавить в этот раздел
                    </button>
                </div>
            )}

            <p className="text-xs text-zinc-600 mt-5 leading-relaxed">
                Справочная информация. Перед заменой сверьте данные с сервисной книгой
                или уточните у дилера.
            </p>

            <EditFluidModal
                open={!!editItem}
                item={isCreating ? null : editItem}
                onClose={() => {
                    setEditItem(null);
                    setIsCreating(false);
                }}
                onSave={saveItem}
                onDelete={deleteItem}
            />
        </section>
    );
}