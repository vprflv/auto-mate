'use client';

import { CarPartItem } from '@/types';
import CarPartsDashedButton from './CarPartsDashedButton';

type CategoryOption = {
    id: string;
    label: string;
    isCustom?: boolean;
};

type Props = {
    categories: CategoryOption[];
    items: CarPartItem[];
    onOpenCategory: (id: string) => void;
    onCreateCategory: () => void;
};

export default function CarPartsCategoryView({
                                                 categories,
                                                 items,
                                                 onOpenCategory,
                                                 onCreateCategory,
                                             }: Props) {
    return (
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
                            onClick={() => onOpenCategory(c.id)}
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

            <CarPartsDashedButton
                label="Добавить категорию"
                onClick={onCreateCategory}
            />
        </div>
    );
}