'use client';

import { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { CarPartItem, CarParts, PartCategory } from '@/types';
import EditPartModal from '@/features/garage/parts/components/EditPartModal';
import {
    getSubcategoriesFor,
    getSubcategoryLabel,
} from '@/features/garage/lib/getSubcategories';
import { addUserSubcategory } from '@/features/garage/lib/userSubcategories';
import { addUserCategory } from '@/features/garage/lib/userCategories';
import { getCategoriesFor, getCategoryLabel } from '@/features/garage/lib/getCategories';
import Link from 'next/link';

type Props = {
    carId: string;
    parts?: CarParts;
    onUpdateParts?: (parts: CarParts) => void;
};

export default function CarPartsCard({ parts, onUpdateParts, carId }: Props) {
    const items = parts?.items ?? [];
    const [category, setCategory] = useState<string | null>(null);
    const [sub, setSub] = useState<string | null>(null);
    const [editItem, setEditItem] = useState<CarPartItem | null>(null);

    const title =
        sub && category
            ? getSubcategoryLabel(category as PartCategory, sub)
            : category
                ? getCategoryLabel(category)
                : 'Запчасти и расходники';

    const categories = getCategoriesFor().filter((c) =>
        items.some((i) => i.category === c.id)
    );

    const inCategory = category
        ? items.filter((i) => i.category === category)
        : [];

    const subs = category ? getSubcategoriesFor(category as PartCategory) : [];

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

    const createCategory = () => {
        const name = prompt('Название новой категории:');
        if (!name?.trim()) return;
        const created = addUserCategory(name);
        setCategory(created.key);
        setSub(null);
    };

    return (
        <section className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3 min-w-0">
                    {category && (
                        <button
                            type="button"
                            onClick={back}
                            className="text-sm text-[#A3A3A3] hover:text-[#39FF14] shrink-0 transition"
                        >
                            ← Назад
                        </button>
                    )}
                    <h2 className="text-lg font-semibold truncate text-[#F5F5F5]">{title}</h2>
                </div>
            </div>

            {!category && (
                <div className="space-y-3">
                    {categories.length === 0 && (
                        <p className="text-center text-[#666666] text-sm py-6">
                            Пока не указано
                        </p>
                    )}

                    {categories.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {categories.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => {
                                        setCategory(c.id);
                                        setSub(null);
                                    }}
                                    className="bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#39FF14]/40 rounded-2xl px-4 py-4 text-left transition"
                                >
                                    <p className="text-sm font-medium text-[#F5F5F5]">
                                        {c.label}
                                        {c.isCustom ? ' ★' : ''}
                                    </p>
                                    <p className="text-xs text-[#666666] mt-1">
                                        {items.filter((i) => i.category === c.id).length} поз.
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={createCategory}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-[#2A2A2A] text-[#A3A3A3] hover:border-[#39FF14] hover:text-[#39FF14] transition"
                    >
                        <Plus size={18} />
                        Добавить категорию
                    </button>
                </div>
            )}

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
                                    className="bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#39FF14]/40 rounded-2xl px-4 py-4 text-left transition"
                                >
                                    <p className="text-sm font-medium text-[#F5F5F5]">
                                        {s.label}
                                        {s.isCustom ? ' ★' : ''}
                                    </p>
                                    <p className="text-xs text-[#666666] mt-1">
                                        {count > 0 ? `${count} поз.` : 'пусто'}
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            const name = prompt('Название новой подкатегории:');
                            if (!name?.trim() || !category) return;
                            const created = addUserSubcategory(
                                category as PartCategory,
                                name.trim()
                            );
                            setSub(created.key);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-[#2A2A2A] text-[#A3A3A3] hover:border-[#39FF14] hover:text-[#39FF14] transition"
                    >
                        <Plus size={18} />
                        Добавить подкатегорию
                    </button>
                </div>
            )}

            {category && sub && (
                <div className="space-y-3">
                    {inSub.length === 0 ? (
                        <p className="text-center text-[#666666] text-sm py-6">
                            Пока нет записей
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {inSub.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#39FF14]/40 rounded-2xl overflow-hidden transition"
                                >
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setEditItem(item)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setEditItem(item);
                                            }
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <div className="aspect-[4/3] bg-[#161616] flex items-center justify-center">
                                            {item.photo ? (
                                                <img
                                                    src={item.photo}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Package
                                                    className="w-10 h-10 text-[#3A3A3A]"
                                                    strokeWidth={1.5}
                                                />
                                            )}
                                        </div>

                                        <div className="p-3 pb-2">
                                            {item.brand && (
                                                <p className="text-xs text-[#666666] mb-0.5 truncate">
                                                    {item.brand}
                                                </p>
                                            )}
                                            <p className="text-sm text-[#F5F5F5] font-medium leading-snug line-clamp-2">
                                                {item.quantity && item.quantity > 1
                                                    ? `${item.quantity}× `
                                                    : ''}
                                                {item.name}
                                            </p>
                                            {item.oemNumber && (
                                                <p className="text-xs font-mono text-[#A3A3A3] mt-1 truncate">
                                                    {item.oemNumber}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="px-3 pb-3 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setEditItem(item)}
                                            className="flex-1 py-2 rounded-xl bg-[#1F1F1F] hover:bg-[#2A2A2A] text-xs font-medium text-[#F5F5F5] transition"
                                        >
                                            Изменить
                                        </button>

                                        <Link
                                            href={`/garage/${carId}/buy?name=${encodeURIComponent(item.name)}&oem=${encodeURIComponent(item.oemNumber || '')}&brand=${encodeURIComponent(item.brand || '')}&analog=${encodeURIComponent(item.analogNumber || '')}`}
                                            className="flex-1 py-2 rounded-xl bg-[#39FF14] hover:bg-[#57FF3A] text-black text-xs font-medium transition text-center"
                                        >
                                            Где купить
                                        </Link>
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
                                category: category as PartCategory,
                                subcategory: sub || 'other',
                                name: '',
                                quantity: 1,
                            });
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-[#2A2A2A] text-[#A3A3A3] hover:border-[#39FF14] hover:text-[#39FF14] transition"
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