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
        <div className="space-y-3 bg-transparent">
            {categories.length === 0 && (
                <p className="text-center text-[var(--text-dim)] text-sm py-6">
                    Пока не указано
                </p>
            )}

            {categories.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map((c) => (
                        /*
                          Заменили фоны на bg-[var(--bg-elevated)] (пастельно-бежевый в светлой теме).
                          Ховер-рамка теперь мягко подсвечивается в цвет активной ссылки темы.
                        */
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => onOpenCategory(c.id)}
                            className="bg-[var(--bg-elevated)] border border-[var(--border)]/20 hover:border-[var(--link)]/50 rounded-2xl px-4 py-4 text-left transition-all duration-200 cursor-pointer active:scale-[0.98]"
                        >
                            {/* Текст категории использует основной цвет текста активной темы */}
                            <p className="text-sm font-bold text-[var(--text)]">
                                {c.label}
                                {c.isCustom ? ' ★' : ''}
                            </p>
                            {/* Текст количества позиций переведён на var(--text-dim) */}
                            <p className="text-xs text-[var(--text-dim)] mt-1.5 font-medium">
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
