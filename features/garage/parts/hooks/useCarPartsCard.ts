
'use client';

import { useEffect, useState } from 'react';

import {
    CarPartItem,
    CarParts,
    PartCategory,
} from '@/types';

import { getSubcategoriesFor } from '@/features/garage/lib/getSubcategories';

import {
    addUserSubcategory,
    getUserSubcategories,
    saveUserSubcategories,
} from '@/features/garage/lib/userSubcategories';

import {
    addUserCategory,
    getUserCategories,
    saveUserCategories,
} from '@/features/garage/lib/userCategories';

import { getCategoriesFor, getCategoryLabel } from '@/features/garage/lib/getCategories';
import { systemStore } from '@/features/admin/lib/systemStore';

import type { CarSummaryInfo } from '@/features/garage/components/CarPartsCard';

type Params = {
    carId?: string;
    carInfo?: CarSummaryInfo;
    parts?: CarParts;
    onUpdateParts?: (parts: CarParts) => void;
};

const normalizeCategoryName = (value: string): string =>
    value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ru');

const getEnabledCategoriesKey = (carId: string): string =>
    `automate-enabled-part-categories:${carId}`;
const getCategoryOrderKey = (carId: string): string =>
    `automate-part-category-order:${carId}`;
const hiddenCategory = (id: string) => `hidden:${id}`;

function readEnabledCategories(carId: string): string[] {
    return readCategoryIds(getEnabledCategoriesKey(carId));
}

function readCategoryIds(key: string): string[] {
    if (typeof window === 'undefined') return [];

    try {
        const raw = localStorage.getItem(
            key
        );

        if (!raw) return [];

        const parsed: unknown = JSON.parse(raw);

        if (!Array.isArray(parsed)) return [];

        return parsed.filter(
            (value): value is string =>
                typeof value === 'string'
        );
    } catch {
        return [];
    }
}

function writeEnabledCategories(
    carId: string,
    categories: string[]
): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(
        getEnabledCategoriesKey(carId),
        JSON.stringify(categories)
    );
}

export function useCarPartsCard({
                                    carId,
                                    carInfo,
                                    parts,
                                    onUpdateParts,
                                }: Params) {
    const items = parts?.items ?? [];

    const targetCarId = carId || carInfo?.id || '';

    // Навигация по каталогу
    const [category, setCategory] =
        useState<string | null>(null);

    const [sub, setSub] =
        useState<string | null>(null);

    const [editItem, setEditItem] =
        useState<CarPartItem | null>(null);

    // Категории, которые пользователь явно добавил
    const [enabledSystemCategories, setEnabledSystemCategories] =
        useState<string[]>([]);
    const [categoryOrder, setCategoryOrder] = useState<string[]>([]);

    // Ключ автомобиля, для которого загружены категории
    const [loadedCarId, setLoadedCarId] =
        useState<string | null>(null);

    // Принудительное обновление после изменения
    // пользовательских категорий и подкатегорий
    const [, setRevision] = useState(0);

    const refresh = () => {
        setRevision((value) => value + 1);
    };

    // Загружаем выбранные категории при смене автомобиля
    useEffect(() => {
        setEnabledSystemCategories(
            readEnabledCategories(targetCarId)
        );

        setLoadedCarId(targetCarId);
        setCategoryOrder(readCategoryIds(getCategoryOrderKey(targetCarId)));

        const query = new URLSearchParams(
            window.location.search
        );

        const requestedCategory =
            query.get('section') === 'catalog'
                ? query.get('partCategory')
                : null;

        const validCategory =
            requestedCategory &&
            getCategoriesFor(targetCarId).some(
                item => item.id === requestedCategory
            )
                ? requestedCategory
                : null;

        const requestedSubcategory =
            query.get('partSubcategory');

        const validSubcategory =
            validCategory &&
            requestedSubcategory &&
            getSubcategoriesFor(
                validCategory as PartCategory
            ).some(
                item => item.id === requestedSubcategory
            )
                ? requestedSubcategory
                : null;

        setCategory(validCategory);
        setSub(validSubcategory);
        setEditItem(null);
    }, [targetCarId]);

    const activeEnabledCategories =
        loadedCarId === targetCarId
            ? enabledSystemCategories
            : [];

    // Сохраняем выбор системной категории
    const enableSystemCategory = (id: string) => {
        if (!targetCarId) return;

        const current = readEnabledCategories(targetCarId);

        if (current.includes(id) && !current.includes(hiddenCategory(id))) return;

        const next = [...new Set([...current.filter(key => key !== hiddenCategory(id)), id])];

        writeEnabledCategories(targetCarId, next);
        setEnabledSystemCategories(next);
        setLoadedCarId(targetCarId);
    };

    // Убираем системную категорию из выбранных
    const disableSystemCategory = (id: string) => {
        if (!targetCarId) return;

        const current = readEnabledCategories(targetCarId);

        const next = [...new Set([...current.filter(categoryId => categoryId !== id), hiddenCategory(id)])];

        writeEnabledCategories(targetCarId, next);
        setEnabledSystemCategories(next);
        setLoadedCarId(targetCarId);
    };

    // Все существующие категории
    const allCategories = getCategoriesFor(targetCarId);
    for (const part of items) {
        if (!allCategories.some(item => item.id === part.category)) {
            allCategories.push({ id: part.category, label: getCategoryLabel(part.category, targetCarId), isCustom: false });
        }
    }

    // Показываем:
    // 1. Пользовательские категории
    // 2. Явно добавленные системные категории
    // 3. Системные категории с запчастями
    const categoryRanks = new Map(
        (loadedCarId === targetCarId ? categoryOrder : []).map((id, index) => [id, index])
    );
    const categories = allCategories.filter(
        (item) =>
            item.isCustom ||
            (item.isDefault && !activeEnabledCategories.includes(hiddenCategory(item.id))) ||
            activeEnabledCategories.includes(item.id) ||
            items.some(
                (part) => part.category === item.id
            )
    ).sort((a, b) =>
        (categoryRanks.get(a.id) ?? categoryRanks.size) - (categoryRanks.get(b.id) ?? categoryRanks.size)
    );

    function saveCategoryOrder(ids: string[]) {
        if (!targetCarId) return;
        localStorage.setItem(getCategoryOrderKey(targetCarId), JSON.stringify(ids));
        setCategoryOrder(ids);
    }

    const inCategory = category
        ? items.filter(
            (item) => item.category === category
        )
        : [];

    const subs = category
        ? getSubcategoriesFor(
            category as PartCategory
        )
        : [];

    const inSub = sub
        ? inCategory.filter(
            (item) =>
                (item.subcategory || 'other') === sub
        )
        : [];

    // Навигация назад
    const back = () => {
        if (sub) {
            setSub(null);
        } else {
            setCategory(null);
        }
    };

    // Открытие категории
    const openCategory = (id: string) => {
        const existing = getCategoriesFor(targetCarId).find(
            (item) => item.id === id
        );

        if (existing && !existing.isCustom) {
            enableSystemCategory(existing.id);
        }

        setCategory(id);
        setSub(null);
    };

    const openSubcategory = (id: string) => {
        setSub(id);
    };

    // Добавление и редактирование запчасти
    const saveItem = (updated: CarPartItem) => {
        const exists = items.some(
            (item) => item.id === updated.id
        );

        const next = exists
            ? items.map((item) =>
                item.id === updated.id
                    ? updated
                    : item
            )
            : [...items, updated];

        onUpdateParts?.({ items: next });

        const currentCarId = carId || carInfo?.id;

        if (currentCarId && updated.name.trim()) {
            const article =
                (updated as any).oemNumber ||
                (updated as any).article ||
                '—';

            const brand =
                (updated as any).brand ||
                ((updated as any).isOem
                    ? 'Оригинал'
                    : 'Не указан');

            systemStore.addUserPart({
                carId: currentCarId,
                carBrand: carInfo?.brand,
                carModel: carInfo?.model,
                carYear: carInfo?.year,
                axle: updated.axle,
                side: updated.side,
                carSpecs: carInfo?.carSpecs,
                carVin: carInfo?.vin,
                engine: carInfo?.engine,
                engineCode: carInfo?.engineCode,
                drivetrain: carInfo?.drivetrain,
                transmission: carInfo?.transmission,
                partName: updated.name.trim(),
                partBrand: brand,
                partArticle: article,
                isOem: Boolean(
                    (updated as any).isOem ||
                    (
                        (updated as any).oemNumber &&
                        !(updated as any).brand
                    )
                ),
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

    // Удаление запчасти
    const deleteItem = (id: string) => {
        onUpdateParts?.({
            items: items.filter(
                (item) => item.id !== id
            ),
        });
    };

    // Создание или подключение категории
    const createCategory = (name: string) => {
        const trimmedName = name.trim();
        if (!trimmedName) return;

        const normalizedName =
            normalizeCategoryName(trimmedName);

        const existing = getCategoriesFor(targetCarId).find(
            (item) =>
                normalizeCategoryName(item.label) ===
                normalizedName
        );

        // Если категория существует, не создаём дубль
        if (existing) {
            openCategory(existing.id);
            return;
        }

        // Создаём пользовательскую категорию
        const created = addUserCategory(trimmedName);

        refresh();

        setCategory(created.key);
        setSub(null);
    };

    // Создание подкатегории
    const createSubcategory = (name: string) => {
        if (!category) return;

        const trimmedName = name.trim();
        if (!trimmedName) return;

        const created = addUserSubcategory(
            category as PartCategory,
            trimmedName
        );

        refresh();

        setSub(created.key);
    };

    // Удаление категории
    const deleteCategory = (categoryId: string) => {
        const categoryInfo = getCategoriesFor(targetCarId).find(
            (item) => item.id === categoryId
        );

        // Удаляем детали категории, как и раньше.
        // Вызывается после подтверждения в интерфейсе.
        const nextItems = items.filter(
            (item) => item.category !== categoryId
        );

        onUpdateParts?.({
            items: nextItems,
        });

        // Удаляем пользовательскую категорию
        // только если она действительно пользовательская
        if (categoryInfo?.isCustom) {
            const userCategories = getUserCategories();

            saveUserCategories(
                userCategories.filter(
                    (item) => item.key !== categoryId
                )
            );
        }

        // Удаляем пользовательские подкатегории
        const userSubcategories = getUserSubcategories();

        saveUserSubcategories(
            userSubcategories.filter(
                (item) => item.category !== categoryId
            )
        );

        // Системную категорию не удаляем из справочника,
        // а только отключаем для этого автомобиля
        if (categoryInfo && !categoryInfo.isCustom) {
            disableSystemCategory(categoryId);
        }

        refresh();

        if (category === categoryId) {
            setCategory(null);
            setSub(null);
            setEditItem(null);
        }
    };

    // Открытие формы добавления запчасти
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
        saveCategoryOrder,
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
