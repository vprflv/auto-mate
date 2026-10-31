'use client';

import type { PartCategory } from '@/types';
import type { useCarPartsCard } from '@/features/garage/parts/hooks/useCarPartsCard';

import { getCategoriesFor } from '@/features/garage/lib/getCategories';
import { getSubcategoriesFor } from '@/features/garage/lib/getSubcategories';
import { getPartSubcategorySuggestions } from '@/features/garage/lib/config/partSubcategorySuggestions';

import {
    enablePartSubcategory, useEnabledPartSubcategories,
    useHiddenPartSubcategories
} from '@/features/garage/parts/hooks/useEnabledPartSubcategories';

import EditPartModal from '@/features/garage/parts/components/EditPartModal';
import CategoryCreateModal from '@/features/garage/parts/components/CategoryCreateModal';
import SubcategoryCreateModal from '@/features/garage/parts/components/SubcategoryCreateModal';
import ConfirmDeleteCategoryModal from '@/features/garage/components/ConfirmDeleteCategoryModal';

type CardState = ReturnType<typeof useCarPartsCard>;

type Props = Pick<
    CardState,
    | 'items'
    | 'category'
    | 'categories'
    | 'subs'
    | 'editItem'
    | 'setEditItem'
    | 'saveItem'
    | 'deleteItem'
    | 'createCategory'
    | 'createSubcategory'
    | 'deleteCategory'
    | 'openCategory'
    | 'openSubcategory'
> & {
    carId: string;
    categoryModalOpen: boolean;
    onCloseCategoryModal: () => void;
    subcategoryModalOpen: boolean;
    onCloseSubcategoryModal: () => void;
    deleteCategoryId: string | null;
    onCloseDeleteModal: () => void;
};

const normalize = (value: string): string =>
    value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ru');

export default function CarPartsDialogs({
                                            carId,
                                            items,
                                            category,
                                            categories,
                                            subs,
                                            editItem,
                                            setEditItem,
                                            saveItem,
                                            deleteItem,
                                            createCategory,
                                            createSubcategory,
                                            deleteCategory,
                                            openCategory,
                                            openSubcategory,
                                            categoryModalOpen,
                                            onCloseCategoryModal,
                                            subcategoryModalOpen,
                                            onCloseSubcategoryModal,
                                            deleteCategoryId,
                                            onCloseDeleteModal,
                                        }: Props) {
    const selectedCategory = categories.find(
        (item) => item.id === category
    );

    const categoryToDelete = categories.find(
        (item) => item.id === deleteCategoryId
    );

    const deleteCategoryItemsCount = deleteCategoryId
        ? items.filter(
            (item) => item.category === deleteCategoryId
        ).length
        : 0;

    const deleteCategorySubcategoryCount = deleteCategoryId
        ? getSubcategoriesFor(
            deleteCategoryId as PartCategory
        ).filter((item) => item.isCustom).length
        : 0;

    const suggestions = category
        ? getPartSubcategorySuggestions(
            category,
            selectedCategory?.label ?? ''
        )
        : [];

    const handleSelectExistingCategory = (name: string) => {
        const existing = getCategoriesFor().find(
            (item) =>
                normalize(item.label) === normalize(name)
        );

        if (existing) {
            openCategory(existing.id);
        }
    };

    const handleSubmitSubcategory = (name: string) => {
        if (!category) return;

        const existing = subs.find(
            (item) =>
                normalize(item.label) === normalize(name)
        );

        if (existing) {
            enablePartSubcategory(
                carId,
                category,
                existing.id
            );

            openSubcategory(existing.id);
            return;
        }

        createSubcategory(name);
    };

    const handleDeleteCategory = () => {
        if (!deleteCategoryId) return;

        deleteCategory(deleteCategoryId);
        onCloseDeleteModal();
    };

    const enabledSubcategoryIds =
        useEnabledPartSubcategories(carId, category);

    const hiddenSubcategoryIds =
        useHiddenPartSubcategories(carId, category);

    const existingSubcategoryNames = subs
        .filter((sub) => {
            const hasItems = items.some(
                (item) =>
                    item.category === category &&
                    (item.subcategory || 'other') === sub.id
            );

            return (
                hasItems ||
                (!hiddenSubcategoryIds.includes(sub.id) &&
                    (sub.isCustom ||
                        enabledSubcategoryIds.includes(sub.id)))
            );
        })
        .map((sub) => sub.label);

    return (
        <>
            <EditPartModal
                open={!!editItem}
                item={editItem}
                onClose={() => setEditItem(null)}
                onSave={saveItem}
                onDelete={deleteItem}
            />

            <CategoryCreateModal
                open={categoryModalOpen}
                existingCategories={categories.map(
                    (item) => item.label
                )}
                onClose={onCloseCategoryModal}
                onCreate={createCategory}
                onSelectExisting={
                    handleSelectExistingCategory
                }
            />

            <SubcategoryCreateModal
                open={subcategoryModalOpen && !!category}
                categoryName={selectedCategory?.label ?? ''}
                suggestions={suggestions}
                existingNames={existingSubcategoryNames}
                onClose={onCloseSubcategoryModal}
                onSubmit={handleSubmitSubcategory}
            />

            <ConfirmDeleteCategoryModal
                open={!!deleteCategoryId}
                categoryName={categoryToDelete?.label ?? ''}
                itemCount={deleteCategoryItemsCount}
                subcategoryCount={
                    deleteCategorySubcategoryCount
                }
                onClose={onCloseDeleteModal}
                onConfirm={handleDeleteCategory}
            />
        </>
    );
}