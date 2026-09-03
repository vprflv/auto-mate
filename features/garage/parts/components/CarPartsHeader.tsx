'use client';

import { PartCategory } from '@/types';
import { getSubcategoryLabel } from '@/features/garage/lib/getSubcategories';
import { getCategoryLabel } from '@/features/garage/lib/getCategories';

type Props = {
    category: string | null;
    sub: string | null;
    onBack: () => void;
};

export default function CarPartsHeader({ category, sub, onBack }: Props) {
    const title =
        sub && category
            ? getSubcategoryLabel(category as PartCategory, sub)
            : category
                ? getCategoryLabel(category)
                : 'Запчасти и расходники';

    return (
        <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3 min-w-0">
                {category && (
                    <button
                        type="button"
                        onClick={onBack}
                        className="text-sm text-[#A3A3A3] hover:text-[#39FF14] shrink-0 transition"
                    >
                        ← Назад
                    </button>
                )}
                <h2 className="text-lg font-semibold truncate text-[#F5F5F5]">{title}</h2>
            </div>
        </div>
    );
}