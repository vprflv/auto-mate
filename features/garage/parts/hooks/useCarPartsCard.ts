'use client';

import { useState } from 'react';
import { CarPartItem, CarParts, PartCategory } from '@/types';
import { getSubcategoriesFor } from '@/features/garage/lib/getSubcategories';
import { addUserSubcategory, getUserSubcategories, saveUserSubcategories } from '@/features/garage/lib/userSubcategories';
import { addUserCategory, getUserCategories, saveUserCategories } from '@/features/garage/lib/userCategories';
import { getCategoriesFor } from '@/features/garage/lib/getCategories';
import { systemStore } from '@/features/admin/lib/systemStore';
import { CarSummaryInfo } from '@/features/garage/components/CarPartsCard';

type Params = {
    carId?: string;
    carInfo?: CarSummaryInfo;
    parts?: CarParts;
    onUpdateParts?: (parts: CarParts) => void;
};

export function useCarPartsCard({
                                    carId,
                                    carInfo,
                                    parts,
                                    onUpdateParts,
                                }: Params) {
    const items = parts?.items ?? [];

    const [category, setCategory] = useState<string | null>(null);
    const [sub, setSub] = useState<string | null>(null);
    const [editItem, setEditItem] = useState<CarPartItem | null>(null);

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

        const targetCarId = carId || carInfo?.id;
        if (targetCarId && updated.name.trim()) {
            const article = (updated as any).oemNumber || (updated as any).article || '—';
            const brand = (updated as any).brand || ((updated as any).isOem ? 'Оригинал' : 'Не указан');

            systemStore.addUserPart({
                carId: targetCarId,
                carBrand: carInfo?.brand,
                carModel: carInfo?.model,
                carYear: carInfo?.year,
                carVin: carInfo?.vin,
                engine: carInfo?.engine,
                partName: updated.name.trim(),
                partBrand: brand,
                partArticle: article,
                isOem: Boolean((updated as any).isOem || ((updated as any).oemNumber && !(updated as any).brand)),
                itemType: 'Запчасть / Расходник',
                category: updated.category,
                subcategory: updated.subcategory,
                quantity: updated.quantity || 1,
                price: (updated as any).price,
                source: 'user_manual',
                note: 'Добавлено пользователем вручную в каталог автомобиля',
            });
        }
    };

    const deleteItem = (id: string) => {
        onUpdateParts?.({
            items: items.filter((item) => item.id !== id),
        });
    };

    const createCategory = (name: string) => {
        const trimmedName = name.trim();
        if (!trimmedName) return;

        const created = addUserCategory(trimmedName);
        setCategory(created.key);
        setSub(null);
    };

    const createSubcategory = (name: string) => {
        if (!category) return;

        const trimmedName = name.trim();
        if (!trimmedName) return;

        const created = addUserSubcategory(
            category as PartCategory,
            trimmedName
        );
        setSub(created.key);
    };

    const deleteCategory = (categoryId: string) => {
        const nextItems = items.filter(
            (item) => item.category !== categoryId
        );

        onUpdateParts?.({
            items: nextItems,
        });

        const userCategories = getUserCategories();
        saveUserCategories(
            userCategories.filter(
                (item) => item.key !== categoryId
            )
        );

        const userSubcategories = getUserSubcategories();
        saveUserSubcategories(
            userSubcategories.filter(
                (item) => item.category !== categoryId
            )
        );

        if (category === categoryId) {
            setCategory(null);
            setSub(null);
            setEditItem(null);
        }
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
        openSubcategory,
        saveItem,
        deleteItem,
        deleteCategory,
        createCategory,
        createSubcategory,
        addItemToSection,
    };
}