'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import type {
    CarFluidItem,
    CarFluids,
} from '@/types/oil';

import type { CarSummaryInfo } from '@/features/garage/components/CarPartsCard';

import { FLUID_CATEGORY_OPTIONS } from '@/features/garage/lib/config/serviceItemCategories';
import { getFluidCategoriesFor } from '@/features/garage/lib/getFluidCategories';
import { addUserFluidCategory } from '@/features/garage/lib/userFluidCategories';
import { systemStore } from '@/features/admin/lib/systemStore';

import { useFluidCategoryPreferences } from './useFluidCategoryPreferences';

type Params = {
    carId?: string;
    carInfo?: CarSummaryInfo;
    fluids?: CarFluids;
    onUpdateFluids?: (fluids: CarFluids) => void;
};

export type FluidCategoryOption = {
    id: string;
    label: string;
    isCustom: boolean;
    count: number;
};

type Navigation = {
    carId: string;
    category: string | null;
    editItem: CarFluidItem | null;
    isCreating: boolean;
};

const normalize = (name: string) =>
    name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ru');

const isMarker = (item: CarFluidItem) =>
    item.name === 'Маркер категории';

export function useCarFluidsCard({
                                     carId,
                                     carInfo,
                                     fluids,
                                     onUpdateFluids,
                                 }: Params) {
    const targetCarId = carId || carInfo?.id || '';

    const storedItems = fluids?.items ?? [];

    // Старые маркеры сохраняем, но не показываем как жидкости.
    const items = storedItems.filter(
        (item) => !isMarker(item)
    );

    const preferences =
        useFluidCategoryPreferences(targetCarId);

    const [, refresh] = useState(0);

    const emptyNavigation: Navigation = {
        carId: targetCarId,
        category: null,
        editItem: null,
        isCreating: false,
    };

    const [navigation, setNavigation] =
        useState<Navigation>(emptyNavigation);

    const current =
        navigation.carId === targetCarId
            ? navigation
            : emptyNavigation;

    const updateNavigation = (
        patch: Partial<Omit<Navigation, 'carId'>>
    ) => {
        setNavigation((previous) => ({
            ...(previous.carId === targetCarId
                ? previous
                : emptyNavigation),
            ...patch,
        }));
    };

    const counts = new Map<string, number>();

    items.forEach((item) => {
        counts.set(
            item.category,
            (counts.get(item.category) ?? 0) + 1
        );
    });

    const systemIds = new Set<string>(
        FLUID_CATEGORY_OPTIONS.map(
            (option) => option.value
        )
    );

    const presetNames = new Set(
        FLUID_CATEGORY_OPTIONS.map(
            (option) => normalize(option.label)
        )
    );

    const definitions = new Map<
        string,
        {
            id: string;
            label: string;
            isCustom: boolean;
        }
    >();

    getFluidCategoriesFor().forEach((option) => {
        definitions.set(option.id, option);
    });

    // Поддерживаем старые категории, названия которых
    // хранятся непосредственно в жидкостях или маркерах.
    storedItems.forEach((item) => {
        if (!definitions.has(item.category)) {
            definitions.set(item.category, {
                id: item.category,
                label:
                    item.categoryLabel ||
                    item.category,
                isCustom: !systemIds.has(item.category),
            });
        }
    });

    const availableCategories: FluidCategoryOption[] =
        [...definitions.values()].map((option) => ({
            ...option,
            isCustom:
                option.isCustom &&
                !presetNames.has(normalize(option.label)),
            count: counts.get(option.id) ?? 0,
        }));

    const suggestedCategories = availableCategories.filter(
        (option) => systemIds.has(option.id)
    );



    const legacyIds = new Set(
        storedItems
            .filter(isMarker)
            .map((item) => item.category)
    );

    const categories = availableCategories.filter(
        (option) =>
            option.count > 0 ||
            (!preferences.hidden.includes(option.id) &&
                (preferences.enabled.includes(option.id) ||
                    legacyIds.has(option.id)))
    );

    const getCategoryLabel = (id: string) =>
        availableCategories.find(
            (option) => option.id === id
        )?.label || id;

    const customCategories =
        availableCategories.filter(
            (option) => !systemIds.has(option.id)
        );

    const commit = (next: CarFluidItem[]): boolean => {
        if (!onUpdateFluids) {
            toast.error(
                'Сохранение жидкостей недоступно'
            );
            return false;
        }

        try {
            onUpdateFluids({
                ...fluids,
                items: next,
            });

            return true;
        } catch {
            toast.error(
                'Не удалось сохранить жидкости'
            );
            return false;
        }
    };

    const openCategory = (id: string): boolean => {
        if (
            !availableCategories.some(
                (option) => option.id === id
            )
        ) {
            return false;
        }

        try {
            preferences.enable([id]);

            updateNavigation({
                category: id,
            });

            return true;
        } catch {
            toast.error(
                'Не удалось сохранить выбранную категорию'
            );
            return false;
        }
    };

    const handleCreateCategory = (
        name: string
    ): string | null => {
        const label = name.trim().replace(/\s+/g, ' ');

        if (!label) return null;

        const existing = availableCategories.find(
            (option) =>
                normalize(option.label) === normalize(label)
        );

        if (existing) {
            return openCategory(existing.id)
                ? existing.id
                : null;
        }

        try {
            const created = addUserFluidCategory(label);

            preferences.enable([created.key]);

            refresh((value) => value + 1);

            updateNavigation({
                category: created.key,
            });

            return created.key;
        } catch {
            toast.error(
                'Не удалось создать категорию'
            );
            return null;
        }
    };

    const openCreate = (
        id = current.category || 'engineOil'
    ) => {
        if (!openCategory(id)) return;

        updateNavigation({
            isCreating: true,
            editItem: {
                id: crypto.randomUUID(),
                category: id,
                categoryLabel: getCategoryLabel(id),
                name: '',
            },
        });
    };

    const closeEdit = () => {
        updateNavigation({
            editItem: null,
            isCreating: false,
        });
    };

    const openEdit = (item: CarFluidItem) => {
        updateNavigation({
            editItem: item,
            isCreating: false,
        });
    };

    const saveItem = (
        updated: CarFluidItem
    ): boolean => {
        const previous = storedItems.find(
            (item) => item.id === updated.id
        );

        const saved: CarFluidItem & {
            photo?: string;
        } = {
            ...previous,
            ...updated,
            categoryLabel: getCategoryLabel(
                updated.category
            ),
        };

        // После изменения галереи старое поле photo
        // не должно возвращать удалённую фотографию.
        if ('photos' in updated) {
            delete saved.photo;
        }

        try {
            preferences.enable([
                saved.category,
                ...(previous
                    ? [previous.category]
                    : []),
            ]);
        } catch {
            toast.error(
                'Не удалось сохранить категорию'
            );
            return false;
        }

        const next = previous
            ? storedItems.map((item) =>
                item.id === saved.id ? saved : item
            )
            : [...storedItems, saved];

        if (!commit(next)) return false;

        updateNavigation({
            category: saved.category,
        });

        // Сохраняем существующую связь с общим каталогом.
        if (
            targetCarId &&
            saved.name.trim() &&
            !isMarker(saved)
        ) {
            const extra = saved as CarFluidItem & {
                manufacturer?: string;
                article?: string;
                oemNumber?: string;
                isOem?: boolean;
                quantity?: number;
                price?: number;
            };

            try {
                systemStore.addUserPart({
                    carId: targetCarId,
                    carBrand: carInfo?.brand,
                    carModel: carInfo?.model,
                    carYear: carInfo?.year,
                    carVin: carInfo?.vin,
                    carSpecs: carInfo?.carSpecs,
                    engine: carInfo?.engine,
                    engineCode: carInfo?.engineCode,
                    drivetrain: carInfo?.drivetrain,
                    transmission: carInfo?.transmission,

                    partName: saved.name.trim(),
                    partBrand:
                        extra.brand ||
                        extra.manufacturer ||
                        'Не указан',

                    partArticle:
                        extra.article ||
                        extra.oemNumber ||
                        extra.spec ||
                        '—',

                    isOem: Boolean(extra.isOem),
                    itemType: 'Техническая жидкость',
                    category: getCategoryLabel(saved.category),
                    quantity: extra.quantity || 1,
                    price: extra.price,
                    source: 'user_manual',

                    note: `Добавлено вручную в раздел «${getCategoryLabel(saved.category)}». Допуск: ${saved.spec || '—'}. Объём: ${saved.volume || '—'}`,
                });
            } catch {
                toast.warning(
                    'Жидкость сохранена, но отправить её в общий каталог не удалось'
                );
            }
        }

        return true;
    };

    const deleteItem = (id: string): boolean => {
        const previous = items.find(
            (item) => item.id === id
        );

        if (!previous) return false;

        try {
            // Категория останется после удаления
            // последней жидкости.
            preferences.enable([previous.category]);
        } catch {
            toast.error(
                'Не удалось сохранить пустую категорию'
            );
            return false;
        }

        return commit(
            storedItems.filter((item) => item.id !== id)
        );
    };

    const deleteCategory = (id: string): boolean => {
        if (
            items.some(
                (item) => item.category === id
            )
        ) {
            toast.error(
                'Сначала перенесите или удалите жидкости из этой категории'
            );
            return false;
        }

        try {
            preferences.hide(id);

            if (current.category === id) {
                updateNavigation({
                    category: null,
                    editItem: null,
                    isCreating: false,
                });
            }

            return true;
        } catch {
            toast.error(
                'Не удалось удалить категорию'
            );
            return false;
        }
    };

    return {
        ...current,
        items,
        categories,
        availableCategories,
        customCategories,

        displayItems: items.filter(
            (item) =>
                item.category === current.category
        ),

        title: current.category
            ? getCategoryLabel(current.category)
            : 'Масла и техжидкости',

        openCategory,
        suggestedCategories,
        openCreate,
        openEdit,
        closeEdit,
        saveItem,
        deleteItem,
        deleteCategory,
        handleCreateCategory,
    };
}