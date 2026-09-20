'use client';

import { useState } from 'react';
import { CarParts } from '@/types';
import EditPartModal from '@/features/garage/parts/components/EditPartModal';
import NamePromptModal from '@/features/garage/parts/components/NamePromptModal';
import { useCarPartsCard } from '@/features/garage/parts/hooks/useCarPartsCard';
import CarPartsHeader from '@/features/garage/parts/components/CarPartsHeader';
import CarPartsCategoryView from '@/features/garage/parts/components/CarPartsCategoryView';
import CarPartsSubcategoryView from '@/features/garage/parts/components/CarPartsSubcategoryView';
import CarPartsItemsView from '@/features/garage/parts/components/CarPartsItemsView';

type Props = {
    carId: string;
    parts?: CarParts;
    onUpdateParts?: (parts: CarParts) => void;
};

export default function CarPartsCard({ parts, onUpdateParts, carId }: Props) {
    const [namePrompt, setNamePrompt] = useState<'category' | 'subcategory' | null>(null);

    const {
        items,
        category,
        sub,
        editItem,
        setEditItem,
        setSub,
        categories,
        inCategory,
        subs,
        inSub,
        back,
        openCategory,
        saveItem,
        deleteItem,
        createCategory,
        createSubcategory,
        addItemToSection,
    } = useCarPartsCard({ parts, onUpdateParts });

    return (
        /*
          Заменили bg-[#161616] на var(--card) (песочный цвет в светлой теме).
          Сделали деликатную полупрозрачную рамку border-[var(--border)]/20,
          чтобы карточка идеально мэтчилась с соседними блоками характеристик.
        */
        <section className="bg-[var(--card)] border border-[var(--border)]/20 rounded-3xl p-6 transition-colors duration-200">

            {/* Шапка каталога с кнопкой "Назад" */}
            <CarPartsHeader category={category} sub={sub} onBack={back} />

            {/* ВЬЮШКА 1: Список главных категорий (Электрика, Двигатель...) */}
            {!category && (
                <CarPartsCategoryView
                    categories={categories}
                    items={items}
                    onOpenCategory={openCategory}
                    onCreateCategory={() => setNamePrompt('category')}
                />
            )}

            {/* ВЬЮШКА 2: Список подкатегорий (Фильтры, Ремни...) */}
            {category && !sub && (
                <CarPartsSubcategoryView
                    subs={subs}
                    inCategory={inCategory}
                    onOpenSub={setSub}
                    onCreateSub={() => setNamePrompt('subcategory')}
                />
            )}

            {/* ВЬЮШКА 3: Конечный список запчастей с артикулами */}
            {category && sub && (
                <CarPartsItemsView
                    carId={carId}
                    items={inSub}
                    onEdit={setEditItem}
                    onAdd={addItemToSection}
                />
            )}

            {/* Модальное окно редактирования/добавления конкретной детали */}
            <EditPartModal
                open={!!editItem}
                item={editItem}
                onClose={() => setEditItem(null)}
                onSave={saveItem}
                onDelete={deleteItem}
            />

            {/* Модальное окно ввода названия для новой категории/подкатегории */}
            <NamePromptModal
                open={!!namePrompt}
                title={
                    namePrompt === 'subcategory'
                        ? 'Новая подкатегория'
                        : 'Новая категория'
                }
                placeholder={
                    namePrompt === 'subcategory'
                        ? 'Колодки, диски…'
                        : 'Электрика, салон…'
                }
                onClose={() => setNamePrompt(null)}
                onSubmit={(name) => {
                    if (namePrompt === 'category') createCategory(name);
                    if (namePrompt === 'subcategory') createSubcategory(name);
                }}
            />
        </section>
    );
}
