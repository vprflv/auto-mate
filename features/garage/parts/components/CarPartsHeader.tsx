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
        <div className="flex items-center justify-between mb-5 bg-transparent">
            <div className="flex items-center gap-3 min-w-0">
                {category && (
                    /*
                      Кнопка "Назад" переведена на адаптивные переменные.
                      Ховер автоматически подстроится под оранжевый или неоново-зелёный.
                    */
                    <button
                        type="button"
                        onClick={onBack}
                        className="text-sm text-[var(--text-muted)] hover:text-[var(--link)] shrink-0 transition-colors duration-200 cursor-pointer font-medium active:scale-95"
                    >
                        ← Назад
                    </button>
                )}
                {/* Заголовок теперь использует основной цвет текста активной темы */}
                <h2 className="text-lg font-bold truncate text-[var(--text)]">{title}</h2>
            </div>
        </div>
    );
}
