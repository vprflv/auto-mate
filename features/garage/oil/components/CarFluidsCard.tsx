'use client';

import { useState } from 'react';
import { Package, Plus } from 'lucide-react';

import { FLUID_CATEGORY_OPTIONS } from '@/features/garage/lib/config/serviceItemCategories';
import EditFluidModal from './EditFluidModal';
import { CarFluidItem, CarFluids, FluidCategory } from '@/types/oil';

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
        <section className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3 min-w-0">
                    {category && (
                        <button
                            type="button"
                            onClick={() => setCategory(null)}
                            className="text-sm text-[#A3A3A3] hover:text-[#39FF14] shrink-0 transition"
                        >
                            ← Назад
                        </button>
                    )}
                    <h2 className="text-lg font-semibold truncate text-[#F5F5F5]">{title}</h2>
                </div>

                {!category && (
                    <button
                        type="button"
                        onClick={() => openCreate()}
                        className="text-sm text-[#39FF14] hover:text-[#57FF3A] shrink-0 transition"
                    >
                        + Добавить
                    </button>
                )}
            </div>

            {!category && (
                <>
                    {items.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-[#666666] text-sm mb-3">Пока не указано</p>
                            <button
                                type="button"
                                onClick={() => openCreate()}
                                className="text-sm text-[#39FF14] hover:text-[#57FF3A] transition"
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
                                    className="bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#39FF14]/40 rounded-2xl px-4 py-4 text-left transition"
                                >
                                    <p className="text-sm font-medium text-[#F5F5F5]">{LABELS[c]}</p>
                                    <p className="text-xs text-[#666666] mt-1">
                                        {items.filter((i) => i.category === c).length} поз.
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}

            {category && (
                <div className="space-y-3">
                    {inCategory.length === 0 ? (
                        <p className="text-center text-[#666666] text-sm py-6">Пока нет записей</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {inCategory.map((item) => (
                                <div
                                    key={item.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => {
                                        setEditItem(item);
                                        setIsCreating(false);
                                    }}
                                    className="bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#39FF14]/40 rounded-2xl overflow-hidden cursor-pointer transition"
                                >
                                    <div className="aspect-[4/3] bg-[#161616] flex items-center justify-center">
                                        {item.photo ? (
                                            <img
                                                src={item.photo}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Package className="w-10 h-10 text-[#3A3A3A]" strokeWidth={1.5} />
                                        )}
                                    </div>

                                    <div className="p-3">
                                        {item.brand && (
                                            <p className="text-xs text-[#666666] mb-0.5 truncate">{item.brand}</p>
                                        )}
                                        <p className="text-sm text-[#F5F5F5] font-medium leading-snug line-clamp-2">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-[#A3A3A3] mt-1 truncate">
                                            {formatFluid(item)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => openCreate(category)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-[#2A2A2A] text-[#A3A3A3] hover:border-[#39FF14] hover:text-[#39FF14] transition"
                    >
                        <Plus size={18} />
                        Добавить в этот раздел
                    </button>
                </div>
            )}

            <p className="text-xs text-[#666666] mt-5 leading-relaxed">
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