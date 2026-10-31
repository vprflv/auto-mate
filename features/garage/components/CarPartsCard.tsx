'use client';

import { useState } from 'react';

import type { CarParts } from '@/types';

import { useCarPartsCard } from '@/features/garage/parts/hooks/useCarPartsCard';

import CarPartsNavigation from '@/features/garage/parts/components/CarPartsNavigation';
import CarPartsContent from '@/features/garage/parts/components/CarPartsContent';
import CarPartsDialogs from '@/features/garage/parts/components/CarPartsDialogs';

// Оставляем экспорт здесь, чтобы существующие импорты работали.
export type CarSummaryInfo = {
    id: string;
    brand: string;
    model: string;
    year?: number;
    vin?: string;
    engine?: string;
    engineCode?: string;
    drivetrain?: string;
    transmission?: string;
    carSpecs?: Record<string, any>;
};

type Props = {
    carId: string;
    carInfo?: CarSummaryInfo;
    parts?: CarParts;
    onUpdateParts?: (parts: CarParts) => void;
};

export default function CarPartsCard({
                                         carId,
                                         carInfo,
                                         parts,
                                         onUpdateParts,
                                     }: Props) {
    const card = useCarPartsCard({
        carId,
        carInfo,
        parts,
        onUpdateParts,
    });

    const [categoryModalOpen, setCategoryModalOpen] =
        useState(false);

    const [subcategoryModalOpen, setSubcategoryModalOpen] =
        useState(false);

    const [deleteCategoryId, setDeleteCategoryId] =
        useState<string | null>(null);

    const openCategoryModal = () => {
        setCategoryModalOpen(true);
    };

    return (
        <section className="overflow-hidden rounded-3xl border border-[var(--border)]/20 bg-[var(--card)] transition-colors duration-200">
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--text-accent)]">
                    <span className="text-lg">🔧</span>
                </div>

                <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-[var(--text)]">
                        Запчасти
                    </h2>

                    <p className="text-sm text-[var(--text-muted)]">
                        Каталог деталей автомобиля
                    </p>
                </div>
            </div>

            <CarPartsNavigation
                variant="mobile"
                categories={card.categories}
                activeCategory={card.category}
                onOpenCategory={card.openCategory}
                onCreateCategory={openCategoryModal}
                onDeleteCategory={setDeleteCategoryId}
            />

            <div className="flex min-h-[360px]">
                <CarPartsNavigation
                    variant="desktop"
                    categories={card.categories}
                    activeCategory={card.category}
                    onOpenCategory={card.openCategory}
                    onCreateCategory={openCategoryModal}
                    onDeleteCategory={setDeleteCategoryId}
                />

                <CarPartsContent
                    carId={carId}
                    category={card.category}
                    sub={card.sub}
                    categories={card.categories}
                    subs={card.subs}
                    inCategory={card.inCategory}
                    inSub={card.inSub}
                    openSubcategory={card.openSubcategory}
                    setEditItem={card.setEditItem}
                    addItemToSection={card.addItemToSection}
                    back={card.back}
                    onCreateSubcategory={() =>
                        setSubcategoryModalOpen(true)
                    }
                />
            </div>

            <CarPartsDialogs
                carId={carId}
                category={card.category}
                subs={card.subs}
                openSubcategory={card.openSubcategory}
                items={card.items}
                categories={card.categories}
                editItem={card.editItem}
                setEditItem={card.setEditItem}
                saveItem={card.saveItem}
                deleteItem={card.deleteItem}
                createCategory={card.createCategory}
                createSubcategory={card.createSubcategory}
                deleteCategory={card.deleteCategory}
                openCategory={card.openCategory}
                categoryModalOpen={categoryModalOpen}
                onCloseCategoryModal={() =>
                    setCategoryModalOpen(false)
                }
                subcategoryModalOpen={subcategoryModalOpen}
                onCloseSubcategoryModal={() =>
                    setSubcategoryModalOpen(false)
                }
                deleteCategoryId={deleteCategoryId}
                onCloseDeleteModal={() =>
                    setDeleteCategoryId(null)
                }
            />
        </section>
    );
}