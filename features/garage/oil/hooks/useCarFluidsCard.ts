'use client';

import { useState, useEffect } from 'react';
import { CarFluidItem, CarFluids, FluidCategory } from '@/types/oil';
import { FLUID_CATEGORY_OPTIONS } from '@/features/garage/lib/config/serviceItemCategories';

type UseCarFluidsCardProps = {
    fluids?: CarFluids;
    onUpdateFluids?: (fluids: CarFluids) => void;
};

const SYSTEM_ORDER: FluidCategory[] = FLUID_CATEGORY_OPTIONS.map((o) => o.value);
const SYSTEM_LABELS = Object.fromEntries(
    FLUID_CATEGORY_OPTIONS.map((o) => [o.value, o.label])
) as Record<FluidCategory, string>;

export function useCarFluidsCard({ fluids, onUpdateFluids }: UseCarFluidsCardProps) {
    const items = fluids?.items ?? [];
    const [category, setCategory] = useState<string | null>(null);
    const [editItem, setEditItem] = useState<CarFluidItem | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const [customCategories, setCustomCategories] = useState<{ id: string; label: string }[]>([]);
    const [showNamePrompt, setShowNamePrompt] = useState(false);

    // Собираем все доступные категории (системные + кастомные)
    useEffect(() => {
        const existingCustomIds = Array.from(
            new Set(items.map((i) => i.category).filter((cat) => !SYSTEM_ORDER.includes(cat as FluidCategory)))
        );

        const customCats = existingCustomIds.map((id) => {
            const foundItem = items.find((i) => i.category === id);
            return {
                id,
                label: foundItem?.categoryLabel || id,
            };
        });

        setCustomCategories(customCats);
    }, [items]);

    // Получение человеческого названия категории
    const getCategoryLabel = (catId: string) => {
        if (SYSTEM_LABELS[catId as FluidCategory]) {
            return SYSTEM_LABELS[catId as FluidCategory];
        }
        const custom = customCategories.find((c) => c.id === catId);
        return custom ? custom.label : catId;
    };

    // Список активных категорий
    const activeCategories = [
        ...SYSTEM_ORDER.filter((c) => items.some((i) => i.category === c)),
        ...customCategories.map((c) => c.id)
    ];

    const inCategory = category ? items.filter((i) => i.category === category) : [];
    const displayItems = inCategory.filter(i => i.name !== 'Маркер категории');
    const title = category ? getCategoryLabel(category) : 'Масла и техжидкости';

    const saveItem = (updated: CarFluidItem) => {
        const exists = items.some((i) => i.id === updated.id);

        if (!SYSTEM_LABELS[updated.category as FluidCategory]) {
            updated.categoryLabel = getCategoryLabel(updated.category);
        }

        const next = exists
            ? items.map((i) => (i.id === updated.id ? updated : i))
            : [...items, updated];

        onUpdateFluids?.({ items: next });
    };

    const deleteItem = (id: string) => {
        onUpdateFluids?.({ items: items.filter((i) => i.id !== id) });
    };

    const openCreate = (cat?: string) => {
        setEditItem({
            id: crypto.randomUUID(),
            category: (cat || 'engineOil') as any,
            name: '',
        });
        setIsCreating(true);
    };

    const handleCreateCategory = (name: string) => {
        if (!name.trim()) return;
        const newId = `custom_${crypto.randomUUID()}`;

        const placeholderItem: CarFluidItem = {
            id: crypto.randomUUID(),
            category: newId, // Идеально совпадает по типам!
            categoryLabel: name.trim(),
            name: 'Маркер категории',
            spec: 'Служебная запись'
        };

        onUpdateFluids?.({ items: [...items, placeholderItem] });
        setCategory(newId);
        setShowNamePrompt(false);
    };

    return {
        items,
        category,
        setCategory,
        editItem,
        setEditItem,
        isCreating,
        setIsCreating,
        showNamePrompt,
        setShowNamePrompt,
        activeCategories,
        displayItems,
        title,
        getCategoryLabel,
        saveItem,
        deleteItem,
        openCreate,
        handleCreateCategory,
    };
}
