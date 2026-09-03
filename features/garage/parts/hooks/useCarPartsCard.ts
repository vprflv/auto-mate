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

export function useCarPartsCard({ parts, onUpdateParts }: Params) {
    const items = parts?.items ?? [];
    const [category, setCategory] = useState<string | null>(null);
    const [sub, setSub] = useState<string | null>(null);
    const [editItem, setEditItem] = useState<CarPartItem | null>(null);

    const categories = getCategoriesFor().filter((c) =>
        c.isCustom || items.some((i) => i.category === c.id)
    );

    const inCategory = category
        ? items.filter((i) => i.category === category)
        : [];

    const subs = category ? getSubcategoriesFor(category as PartCategory) : [];

    const inSub = sub
        ? inCategory.filter((i) => (i.subcategory || 'other') === sub)
        : [];

    const back = () => (sub ? setSub(null) : setCategory(null));

    const openCategory = (id: string) => {
        setCategory(id);
        setSub(null);
    };

    const saveItem = (updated: CarPartItem) => {
        const exists = items.some((i) => i.id === updated.id);
        const next = exists
            ? items.map((i) => (i.id === updated.id ? updated : i))
            : [...items, updated];

        onUpdateParts?.({ items: next });
    };

    const deleteItem = (id: string) => {
        onUpdateParts?.({ items: items.filter((i) => i.id !== id) });
    };

    const createCategory = (name: string) => {
        const created = addUserCategory(name);
        setCategory(created.key);
        setSub(null);
    };

    const createSubcategory = (name: string) => {
        if (!category) return;
        const created = addUserSubcategory(category as PartCategory, name.trim());
        setSub(created.key);
    };

    const addItemToSection = () => {
        if (!category) return;
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
        saveItem,
        deleteItem,
        createCategory,
        createSubcategory,
        addItemToSection,
    };
}