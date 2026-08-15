'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import { PartCategory } from '@/types';
import {
    PART_CATEGORY_LABELS,
    PART_CATEGORY_ORDER,
} from '@/features/garage/lib/config/partCategories';
import {
    PART_SUBCATEGORY_LABELS,
    PART_SUBCATEGORY_ORDER,
} from '@/features/garage/lib/config/partSubcategories';
import {CatalogArticle} from "@/types/catalog/catalog";
import {detectCategory} from "@/features/catalog/lib/saveToPersonalCatalog";


type Props = {
    open: boolean;
    article: CatalogArticle | null;
    nodeName?: string;
    onClose: () => void;
    onConfirm: (data: {
        category: PartCategory;
        subcategory: string;
    }) => void;
};

export default function SaveToCatalogModal({
                                               open,
                                               article,
                                               nodeName,
                                               onClose,
                                               onConfirm,
                                           }: Props) {
    const [category, setCategory] = useState<PartCategory>('other');
    const [subcategory, setSubcategory] = useState('other');

    // При открытии подставляем авто-определённую категорию
    useEffect(() => {
        if (open && article) {
            const detected = detectCategory(article, nodeName);
            setCategory(detected);
            const subs = PART_SUBCATEGORY_ORDER[detected] || ['other'];
            setSubcategory(subs[0] || 'other');
        }
    }, [open, article, nodeName]);

    // Когда меняем категорию — сбрасываем подкатегорию на первую
    useEffect(() => {
        const subs = PART_SUBCATEGORY_ORDER[category] || ['other'];
        if (!subs.includes(subcategory)) {
            setSubcategory(subs[0] || 'other');
        }
    }, [category]);

    if (!open || !article) return null;

    const subOptions = PART_SUBCATEGORY_ORDER[category] || ['other'];

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold">Добавить в мой каталог</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Информация о детали */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 mb-5">
                    <p className="text-xs font-mono text-zinc-400 mb-1">{article.oem}</p>
                    <p className="font-medium leading-snug">{article.name}</p>
                    {article.brand && (
                        <p className="text-sm text-zinc-500 mt-1">{article.brand}</p>
                    )}
                    {article.note && (
                        <p className="text-xs text-zinc-500 mt-1">{article.note}</p>
                    )}
                </div>

                {/* Выбор категории */}
                <div className="mb-4">
                    <label className="block text-sm text-zinc-400 mb-1.5">
                        Категория
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as PartCategory)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600"
                    >
                        {PART_CATEGORY_ORDER.map((cat) => (
                            <option key={cat} value={cat}>
                                {PART_CATEGORY_LABELS[cat]}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Выбор подкатегории */}
                <div className="mb-6">
                    <label className="block text-sm text-zinc-400 mb-1.5">
                        Подкатегория
                    </label>
                    <select
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600"
                    >
                        {subOptions.map((sub) => (
                            <option key={sub} value={sub}>
                                {PART_SUBCATEGORY_LABELS[sub] || sub}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Кнопки */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition text-sm font-medium"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={() => onConfirm({ category, subcategory })}
                        className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition text-sm font-medium"
                    >
                        Добавить
                    </button>
                </div>
            </div>
        </div>
    );
}