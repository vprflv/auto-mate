'use client';

import CarPartsCategoryView from '@/features/garage/parts/components/CarPartsCategoryView';

type CategoryOption = {
    id: string;
    label: string;
    isCustom?: boolean;
};

type Props = {
    variant: 'mobile' | 'desktop';
    categories: CategoryOption[];
    activeCategory: string | null;
    onOpenCategory: (id: string) => void;
    onCreateCategory: () => void;
    onDeleteCategory: (id: string) => void;
};

const normalizeName = (value: string): string =>
    value
        .trim()
        .replace(/\s+/g, ' ')
        .toLocaleLowerCase('ru');

const PRESET_CATEGORY_NAMES = new Set(
    [
        'Двигатель',
        'Трансмиссия',
        'Электрика',
        'Топливная система',
        'Ходовая часть',
        'Кузов',
        'Салон',
    ].map(normalizeName)
);

export default function CarPartsNavigation({
                                               variant,
                                               categories,
                                               activeCategory,
                                               onOpenCategory,
                                               onCreateCategory,
                                               onDeleteCategory,
                                           }: Props) {
    // Меняем признак только для отображения в навигации.
    // Исходные категории и данные хука остаются прежними.
    const displayCategories = categories.map((item) => ({
        ...item,
        isCustom:
            Boolean(item.isCustom) &&
            !PRESET_CATEGORY_NAMES.has(
                normalizeName(item.label)
            ),
    }));

    if (variant === 'desktop') {
        return (
            <div className="hidden w-48 shrink-0 border-r border-[var(--border)] bg-[var(--bg-elevated)]/30 md:block">
                <CarPartsCategoryView
                    categories={displayCategories}
                    activeCategory={activeCategory}
                    onOpenCategory={onOpenCategory}
                    onCreateCategory={onCreateCategory}
                    onDeleteCategory={onDeleteCategory}
                />
            </div>
        );
    }

    return (
        <div className="border-b border-[var(--border)] px-4 py-3 md:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
                {displayCategories.map((item) => {
                    const isActive =
                        activeCategory === item.id;

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                                onOpenCategory(item.id)
                            }
                            className={[
                                'shrink-0 rounded-xl px-3 py-2 text-sm font-medium transition',
                                isActive
                                    ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)]'
                                    : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text)]',
                            ].join(' ')}
                        >
                            {item.isCustom && '★ '}
                            {item.label}
                        </button>
                    );
                })}

                <button
                    type="button"
                    onClick={onCreateCategory}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-dashed border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition hover:border-[var(--btn-primary)] hover:text-[var(--text)]"
                >
                    <span>＋</span>
                    Категория
                </button>
            </div>
        </div>
    );
}