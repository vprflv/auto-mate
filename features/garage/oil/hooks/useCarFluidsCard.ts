'use client';

import { useState, useEffect } from 'react';
import { CarFluidItem, CarFluids, FluidCategory } from '@/types/oil';
import { FLUID_CATEGORY_OPTIONS } from '@/features/garage/lib/config/serviceItemCategories';
import {getUserFluidCategories, saveUserFluidCategories} from "@/features/garage/lib/userFluidCategories";

type UseCarFluidsCardProps = {
    fluids?: CarFluids;
    onUpdateFluids?: (fluids: CarFluids) => void;
};

const SYSTEM_ORDER: FluidCategory[] = FLUID_CATEGORY_OPTIONS.map((o) => o.value);

const SYSTEM_LABELS = Object.fromEntries(
    FLUID_CATEGORY_OPTIONS.map((o) => [o.value, o.label])
) as Record<FluidCategory, string>;

export function useCarFluidsCard({
                                     fluids,
                                     onUpdateFluids,
                                 }: UseCarFluidsCardProps) {
    const items = fluids?.items ?? [];

    const [category, setCategory] = useState<string | null>(null);
    const [editItem, setEditItem] = useState<CarFluidItem | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const [customCategories, setCustomCategories] = useState<
        { id: string; label: string }[]
    >([]);

    useEffect(() => {
        const existingCustomIds = Array.from(
            new Set(
                items
                    .map((item) => item.category)
                    .filter(
                        (cat) =>
                            !SYSTEM_ORDER.includes(cat as FluidCategory)
                    )
            )
        );

        const customCats = existingCustomIds.map((id) => {
            const foundItem = items.find((item) => item.category === id);

            return {
                id,
                label: foundItem?.categoryLabel || id,
            };
        });

        setCustomCategories(customCats);
    }, [items]);

    const getCategoryLabel = (catId: string) => {
        if (SYSTEM_LABELS[catId as FluidCategory]) {
            return SYSTEM_LABELS[catId as FluidCategory];
        }

        const custom = customCategories.find((item) => item.id === catId);

        return custom ? custom.label : catId;
    };

    const activeCategories = [
        ...SYSTEM_ORDER.filter((cat) =>
            items.some((item) => item.category === cat)
        ),
        ...customCategories.map((cat) => cat.id),
    ];

    const inCategory = category
        ? items.filter((item) => item.category === category)
        : [];

    const displayItems = inCategory.filter(
        (item) => item.name !== 'Маркер категории'
    );

    const title = category
        ? getCategoryLabel(category)
        : 'Масла и техжидкости';

    const saveItem = (updated: CarFluidItem) => {
        const exists = items.some((item) => item.id === updated.id);

        if (!SYSTEM_LABELS[updated.category as FluidCategory]) {
            updated.categoryLabel = getCategoryLabel(updated.category);
        }

        const next = exists
            ? items.map((item) =>
                item.id === updated.id ? updated : item
            )
            : [...items, updated];

        onUpdateFluids?.({ items: next });
    };

    const deleteItem = (id: string) => {
        onUpdateFluids?.({
            items: items.filter((item) => item.id !== id),
        });
    };

    const deleteCategory = (categoryId: string) => {
        onUpdateFluids?.({
            items: items.filter(
                (item) => item.category !== categoryId
            ),
        });

        const userCategories =
            getUserFluidCategories();

        saveUserFluidCategories(
            userCategories.filter(
                (item) => item.key !== categoryId
            )
        );

        if (category === categoryId) {
            setCategory(null);
            setEditItem(null);
            setIsCreating(false);
        }
    };

    const openCreate = (cat?: string) => {
        setEditItem({
            id: crypto.randomUUID(),
            category: cat ?? 'engineOil',
            name: '',
        });

        setIsCreating(true);
    };

    /**
     * Создаёт новую пользовательскую категорию и
     * возвращает её ID, чтобы dropdown мог сразу
     * выбрать её в текущей форме.
     */
    const handleCreateCategory = (name: string): string | null => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            return null;
        }

        const newId = `custom_${crypto.randomUUID()}`;

        const placeholderItem: CarFluidItem = {
            id: crypto.randomUUID(),
            category: newId,
            categoryLabel: trimmedName,
            name: 'Маркер категории',
            spec: 'Служебная запись',
        };

        onUpdateFluids?.({
            items: [...items, placeholderItem],
        });

        setCategory(newId);

        return newId;
    };

    return {
        items,
        category,
        setCategory,
        editItem,
        setEditItem,
        isCreating,
        setIsCreating,

        customCategories,

        activeCategories,
        displayItems,
        deleteCategory,
        title,

        getCategoryLabel,
        saveItem,
        deleteItem,
        openCreate,
        handleCreateCategory,
    };
}