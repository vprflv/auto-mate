'use client';

import { useState } from 'react';
import { CarParts, PartCategory } from '@/types';
import { PART_CATEGORY_LABELS } from '@/features/garage/lib/config/partCategories';
import {
    PART_SUBCATEGORY_LABELS,
    PART_SUBCATEGORY_ORDER,
} from '@/features/garage/lib/config/partSubcategories';
import PartsEmpty from "@/features/garage/parts/components/PartsEmpty";
import PartsCategoryGrid from "@/features/garage/parts/components/PartsCategoryGrid";
import PartsSubcategoryGrid from "@/features/garage/parts/components/PartsSubcategoryGrid";
import PartsItemList from "@/features/garage/parts/components/PartsItemList";


type Props = {
    parts?: CarParts;
    onEdit?: () => void;
    carId?: string;
};

export default function CarPartsCard({ parts, onEdit, carId }: Props) {
    const items = parts?.items || [];
    const [category, setCategory] = useState<PartCategory | null>(null);
    const [subcategory, setSubcategory] = useState<string | null>(null);

    const hasData = items.length > 0;

    const categoryItems = category
        ? items.filter((i) => i.category === category)
        : [];

    // Есть конфиг подразделов → всегда показываем меню (Колодки, Диски...)
    const hasSubcategories =
        !!category && (PART_SUBCATEGORY_ORDER[category]?.length ?? 0) > 0;

    const showingSubMenu = hasSubcategories && subcategory === null;
    const showingList = !!category && (!hasSubcategories || subcategory !== null);

    const goBack = () => {
        if (subcategory !== null) {
            setSubcategory(null);
            return;
        }
        setCategory(null);
    };

    const title = subcategory
        ? PART_SUBCATEGORY_LABELS[subcategory] || subcategory
        : category
            ? PART_CATEGORY_LABELS[category]
            : 'Запчасти и расходники';

    return (
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3 min-w-0">
                    {category && (
                        <button
                            type="button"
                            onClick={goBack}
                            className="text-sm text-zinc-400 hover:text-white transition shrink-0"
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
                        className="text-sm text-blue-400 hover:text-blue-300 transition shrink-0"
                    >
                        Изменить
                    </button>
                )}
            </div>

            {!hasData ? (
                <PartsEmpty onEdit={onEdit} />
            ) : !category ? (
                <PartsCategoryGrid
                    items={items}
                    onSelect={(cat) => {
                        setCategory(cat);
                        setSubcategory(null);
                    }}
                />
            ) : showingSubMenu ? (
                <PartsSubcategoryGrid
                    category={category}
                    items={categoryItems}
                    onSelect={setSubcategory}
                />
            ) : showingList ? (
                <PartsItemList
                    items={categoryItems}
                    subcategory={subcategory}
                    carId={carId}
                />
            ) : null}

            <p className="text-xs text-zinc-600 mt-5 leading-relaxed">
                Справочная информация по вашей машине. Перед покупкой сверяйте
                применимость по VIN и каталогам.
            </p>
        </section>
    );
}