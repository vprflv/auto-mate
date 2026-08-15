'use client';

import { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { CarPartItem, CarParts, PartCategory } from '@/types';
import {
    PART_CATEGORY_LABELS,
    PART_CATEGORY_ORDER,
} from '@/features/garage/lib/config/partCategories';
import EditPartModal from '@/features/garage/parts/components/EditPartModal';
import {
    getSubcategoriesFor,
    getSubcategoryLabel,
} from '@/features/garage/lib/getSubcategories';
import {addUserSubcategory} from "@/features/garage/lib/userSubcategories";

type Props = {
    parts?: CarParts;
    onUpdateParts?: (parts: CarParts) => void;
};

export default function CarPartsCard({ parts, onUpdateParts }: Props) {
    const items = parts?.items ?? [];
    const [category, setCategory] = useState<PartCategory | null>(null);
    const [sub, setSub] = useState<string | null>(null);
    const [editItem, setEditItem] = useState<CarPartItem | null>(null);

    const title =
        sub && category
            ? getSubcategoryLabel(category, sub)
            : category
                ? PART_CATEGORY_LABELS[category]
                : 'Запчасти и расходники';

    const categories = PART_CATEGORY_ORDER.filter((c) =>
        items.some((i) => i.category === c)
    );

    const inCategory = category
        ? items.filter((i) => i.category === category)
        : [];

    // системные + пользовательские подкатегории
    const subs = category ? getSubcategoriesFor(category) : [];

    const inSub = sub
        ? inCategory.filter((i) => (i.subcategory || 'other') === sub)
        : [];

    const back = () => (sub ? setSub(null) : setCategory(null));

    const saveItem = (updated: CarPartItem) => {
        const exists = items.some((i) => i.id === updated.id);
        const next = exists
            ? items.map((i) => (i.id === updated.id ? updated : i))
            : [...items, updated];

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


            {/* 2. Подразделы (системные + свои) */}
            {category && !sub && (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {subs.map((s) => {
                            const count = inCategory.filter(
                                (i) => (i.subcategory || 'other') === s.id
                            ).length;

                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setSub(s.id)}
                                    className="bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-2xl px-4 py-4 text-left"
                                >
                                    <p className="text-sm font-medium">
                                        {s.label}
                                        {s.isCustom ? ' ★' : ''}
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        {count > 0 ? `${count} поз.` : 'пусто'}
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    {/* Кнопка создания своей подкатегории */}
                    <button
                        type="button"
                        onClick={() => {
                            const name = prompt('Название новой подкатегории:');
                            if (!name?.trim() || !category) return;

                            const created = addUserSubcategory(category, name.trim());
                            // сразу открываем созданную
                            setSub(created.key);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition"
                    >
                        <Plus size={18} />
                        Добавить категорию
                    </button>
                </div>
            )}

            {/* 3. Список позиций */}
            {category && sub && (
                <div className="space-y-3">
                    {inSub.length === 0 ? (
                        <p className="text-center text-zinc-500 text-sm py-6">Пока нет записей</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {inSub.map((item) => (
                                <div
                                    key={item.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setEditItem(item)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setEditItem(item);
                                        }
                                    }}
                                    className="bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-2xl overflow-hidden cursor-pointer transition"
                                >
                                    <div className="aspect-[4/3] bg-zinc-900 flex items-center justify-center">
                                        {item.photo ? (
                                            <img
                                                src={item.photo}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Package className="w-10 h-10 text-zinc-700" strokeWidth={1.5} />
                                        )}
                                    </div>

                                    <div className="p-3">
                                        {item.brand && (
                                            <p className="text-xs text-zinc-500 mb-0.5 truncate">{item.brand}</p>
                                        )}
                                        <p className="text-sm text-white font-medium leading-snug line-clamp-2">
                                            {item.quantity && item.quantity > 1 ? `${item.quantity}× ` : ''}
                                            {item.name}
                                        </p>
                                        {item.oemNumber && (
                                            <p className="text-xs font-mono text-zinc-400 mt-1 truncate">
                                                {item.oemNumber}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => {
                            setEditItem({
                                id: crypto.randomUUID(),
                                category: category!,
                                subcategory: sub || 'other',
                                name: '',
                                quantity: 1,
                            });
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition"
                    >
                        <Plus size={18} />
                        Добавить в этот раздел
                    </button>
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