'use client';

import { useState } from 'react';
import Link from 'next/link';
import {CarPartItem, CarParts, PartCategory} from '@/types';
import {
    PART_CATEGORY_LABELS,
    PART_CATEGORY_ORDER,
} from '@/features/garage/lib/config/partCategories';
import {
    PART_SUBCATEGORY_LABELS,
    PART_SUBCATEGORY_ORDER,
} from '@/features/garage/lib/config/partSubcategories';
import EditPartModal from "@/features/garage/parts/components/EditPartModal";

type Props = {
    parts?: CarParts;
    onEdit?: () => void;
    carId?: string;
    onUpdateParts?: (parts: CarParts) => void;
};

export default function CarPartsCard({ parts, onEdit, carId, onUpdateParts }: Props) {
    const items = parts?.items ?? [];
    const [category, setCategory] = useState<PartCategory | null>(null);
    const [sub, setSub] = useState<string | null>(null);
    const [editItem, setEditItem] = useState<CarPartItem | null>(null);
    const categories = PART_CATEGORY_ORDER.filter((c) =>
        items.some((i) => i.category === c)
    );

    const inCategory = category
        ? items.filter((i) => i.category === category)
        : [];

    const subs = category ? PART_SUBCATEGORY_ORDER[category] ?? ['other'] : [];

    const inSub = sub
        ? inCategory.filter((i) => (i.subcategory || 'other') === sub)
        : [];

    const title = sub
        ? PART_SUBCATEGORY_LABELS[sub] || sub
        : category
            ? PART_CATEGORY_LABELS[category]
            : 'Запчасти и расходники';

    const back = () => (sub ? setSub(null) : setCategory(null));

    const saveItem = (updated: CarPartItem) => {
        const next = items.map((i) => (i.id === updated.id ? updated : i));
        onUpdateParts?.({ items: next });
    };

    const deleteItem = (id: string) => {
        onUpdateParts?.({ items: items.filter((i) => i.id !== id) });
    };

    return (
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3 min-w-0">
                    {category && (
                        <button
                            type="button"
                            onClick={back}
                            className="text-sm text-zinc-400 hover:text-white shrink-0"
                        >
                            ← Назад
                        </button>
                    )}
                    <h2 className="text-lg font-semibold truncate">{title}</h2>
                </div>
                {onEdit && (
                    <button
                        type="button"
                        onClick={onEdit}
                        className="text-sm text-blue-400 hover:text-blue-300 shrink-0"
                    >
                        Изменить
                    </button>
                )}
            </div>

            {items.length === 0 && (
                <p className="text-center text-zinc-500 text-sm py-6">Пока не указано</p>
            )}

            {/* 1. Разделы */}
            {items.length > 0 && !category && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => {
                                setCategory(c);
                                setSub(null);
                            }}
                            className="bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-2xl px-4 py-4 text-left"
                        >
                            <p className="text-sm font-medium">{PART_CATEGORY_LABELS[c]}</p>
                            <p className="text-xs text-zinc-500 mt-1">
                                {items.filter((i) => i.category === c).length} поз.
                            </p>
                        </button>
                    ))}
                </div>
            )}

            {/* 2. Колодки / Диски — всегда из конфига */}
            {category && !sub && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {subs.map((id) => {
                        const count = inCategory.filter(
                            (i) => (i.subcategory || 'other') === id
                        ).length;
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setSub(id)}
                                className="bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-2xl px-4 py-4 text-left"
                            >
                                <p className="text-sm font-medium">
                                    {PART_SUBCATEGORY_LABELS[id] || id}
                                </p>
                                <p className="text-xs text-zinc-500 mt-1">
                                    {count > 0 ? `${count} поз.` : 'пусто'}
                                </p>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* 3. Список */}
            {category && sub && (
                <div className="space-y-3">
                    {inSub.length === 0 ? (
                        <p className="text-center text-zinc-500 text-sm py-6">Пока нет записей</p>
                    ) : (
                        inSub.map((item) => (
                            <div
                                key={item.id}
                                className="bg-zinc-950/50 border border-zinc-800 rounded-2xl px-4 py-3"
                            >
                                <p className="text-sm text-white">
                                    {item.quantity && item.quantity > 1 ? `${item.quantity}× ` : ''}
                                    {item.name}
                                </p>
                                {item.brand && (
                                    <p className="text-xs text-zinc-500 mt-0.5">{item.brand}</p>
                                )}
                                {item.oemNumber && (
                                    <p className="text-xs font-mono text-zinc-400 mt-1">{item.oemNumber}</p>
                                )}
                            </div>
                        ))
                    )}
                    {carId && (
                        <Link
                            href={`/garage/${carId}/parts/edit`}
                            className="inline-block text-sm text-blue-400 hover:text-blue-300"
                        >
                            Редактировать каталог
                        </Link>
                    )}
                </div>
            )}

            <EditPartModal
                open={!!editItem}
                item={editItem}
                onClose={() => setEditItem(null)}
                onSave={saveItem}
                onDelete={deleteItem}
            />



        </section>
    );
}