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
        <section className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6">
            <CarPartsHeader category={category} sub={sub} onBack={back} />

            {!category && (
                <CarPartsCategoryView
                    categories={categories}
                    items={items}
                    onOpenCategory={openCategory}
                    onCreateCategory={() => setNamePrompt('category')}
                />
            )}

            {category && !sub && (
                <CarPartsSubcategoryView
                    subs={subs}
                    inCategory={inCategory}
                    onOpenSub={setSub}
                    onCreateSub={() => setNamePrompt('subcategory')}
                />
            )}

            {category && sub && (
                <CarPartsItemsView
                    carId={carId}
                    items={inSub}
                    onEdit={setEditItem}
                    onAdd={addItemToSection}
                />
            )}

            <EditPartModal
                open={!!editItem}
                item={editItem}
                onClose={() => setEditItem(null)}
                onSave={saveItem}
                onDelete={deleteItem}
            />

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