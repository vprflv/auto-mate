'use client';

import type { useCarPartsCard } from '@/features/garage/parts/hooks/useCarPartsCard';

import { useEnabledPartSubcategories } from '@/features/garage/parts/hooks/useEnabledPartSubcategories';
import { getPartSubcategorySuggestions } from '@/features/garage/lib/config/partSubcategorySuggestions';

import CarPartsSubcategoryView from '@/features/garage/parts/components/CarPartsSubcategoryView';
import CarPartsItemsView from '@/features/garage/parts/components/CarPartsItemsView';

type CardState = ReturnType<typeof useCarPartsCard>;

type Props = Pick<
    CardState,
    | 'category'
    | 'sub'
    | 'categories'
    | 'subs'
    | 'inCategory'
    | 'inSub'
    | 'openSubcategory'
    | 'setEditItem'
    | 'addItemToSection'
    | 'back'
> & {
    carId: string;
    onCreateSubcategory: () => void;
};

export default function CarPartsContent({
                                            carId,
                                            category,
                                            sub,
                                            categories,
                                            subs,
                                            inCategory,
                                            inSub,
                                            openSubcategory,
                                            setEditItem,
                                            addItemToSection,
                                            back,
                                            onCreateSubcategory,
                                        }: Props) {
    const selectedCategory = categories.find(
        (item) => item.id === category
    );

    const selectedSubcategory = subs.find(
        (item) => item.id === sub
    );

    const enabledSubcategoryIds =
        useEnabledPartSubcategories(carId, category);

    const suggestedSubcategoryNames = category
        ? getPartSubcategorySuggestions(
            category,
            selectedCategory?.label ?? ''
        )
        : [];

    return (
        <div className="min-w-0 flex-1 p-4 md:p-5">
            {!category ? (
                <div className="flex min-h-[300px] items-center justify-center">
                    <div className="max-w-sm text-center">
                        <p className="text-sm font-medium text-[var(--text)]">
                            Выберите категорию
                        </p>

                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            Выберите категорию слева, чтобы
                            увидеть подкатегории и запчасти.
                        </p>
                    </div>
                </div>
            ) : !sub ? (
                <div>
                    <div className="mb-5">
                        <h3 className="text-base font-semibold text-[var(--text)]">
                            {selectedCategory?.label}
                        </h3>

                        <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                            Выберите подкатегорию
                        </p>
                    </div>

                    <CarPartsSubcategoryView
                        key={`${carId}:${category}`}
                        carId={carId}
                        categoryId={category}
                        subs={subs}
                        inCategory={inCategory}
                        enabledSubcategoryIds={enabledSubcategoryIds}
                        suggestedNames={suggestedSubcategoryNames}
                        onOpenSub={openSubcategory}
                        onCreateSub={onCreateSubcategory}
                    />
                </div>
            ) : (
                <CarPartsItemsView
                    carId={carId}
                    items={inSub}
                    onEdit={setEditItem}
                    onAdd={addItemToSection}
                    onBack={back}
                    title={
                        selectedSubcategory?.label ??
                        'Запчасти'
                    }
                />
            )}
        </div>
    );
}