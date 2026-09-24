'use client';

import { useState } from 'react';
import { CarPartItem, CarParts, PartCategory } from '@/types';
import { getSubcategoriesFor } from '@/features/garage/lib/getSubcategories';
import { addUserSubcategory } from '@/features/garage/lib/userSubcategories';
import { addUserCategory } from '@/features/garage/lib/userCategories';
import { getCategoriesFor } from '@/features/garage/lib/getCategories';

type Params = {
    parts?: CarParts;
    onUpdateParts?: (parts: CarParts) => void;
};

export function useCarPartsCard({
                                    parts,
                                    onUpdateParts,
                                }: Params) {
    const items = parts?.items ?? [];

    const [category, setCategory] = useState<string | null>(null);
    const [sub, setSub] = useState<string | null>(null);
    const [editItem, setEditItem] = useState<CarPartItem | null>(null);

    /*
     * Системные категории показываем только если в них
     * действительно есть хотя бы одна запчасть.
     *
     * Кастомные категории сохраняем даже пустыми —
     * иначе только что созданная пользователем категория
     * сразу исчезнет из интерфейса.
     */
    const categories = getCategoriesFor().filter(
        (c) =>
            c.isCustom ||
            items.some((item) => item.category === c.id)
    );

    const inCategory = category
        ? items.filter((item) => item.category === category)
        : [];

    const subs = category
        ? getSubcategoriesFor(category as PartCategory)
        : [];

    const inSub = sub
        ? inCategory.filter(
            (item) => (item.subcategory || 'other') === sub
        )
        : [];

    const back = () => {
        if (sub) {
            setSub(null);
        } else {
            setCategory(null);
        }
    };

    const openCategory = (id: string) => {
        setCategory(id);
        setSub(null);
    };

    const openSubcategory = (id: string) => {
        setSub(id);
    };

    const saveItem = (updated: CarPartItem) => {
        const exists = items.some((item) => item.id === updated.id);

        const next = exists
            ? items.map((item) =>
                item.id === updated.id ? updated : item
            )
            : [...items, updated];

        onUpdateParts?.({ items: next });
    };

    const deleteItem = (id: string) => {
        onUpdateParts?.({
            items: items.filter((item) => item.id !== id),
        });
    };

    const createCategory = (name: string) => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            return;
        }

        const created = addUserCategory(trimmedName);

        setCategory(created.key);
        setSub(null);
    };

    const createSubcategory = (name: string) => {
        if (!category) {
            return;
        }

        const trimmedName = name.trim();

        if (!trimmedName) {
            return;
        }

        const created = addUserSubcategory(
            category as PartCategory,
            trimmedName
        );

        setSub(created.key);
    };

    const addItemToSection = () => {
        if (!category) {
            return;
        }

        setEditItem({
            id: crypto.randomUUID(),
            category: category as PartCategory,
            subcategory: sub || 'other',
            name: '',
            quantity: 1,
        });
    };

    return {
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
        openSubcategory,

        saveItem,
        deleteItem,

        createCategory,
        createSubcategory,
        addItemToSection,
    };
}