'use client';

import {useEffect, useRef, useState} from 'react';

import type { PartCategory } from '@/types';
import type { CatalogArticle } from '@/types/catalog/catalog';

import {
    detectCategory,
    saveArticleToPersonalCatalog,
} from '../lib/saveToPersonalCatalog';

import { getGarageCars } from '@/features/garage/add/lib/storage';

import {
    getCategoriesFor,
    getCategoryLabel,
} from '@/features/garage/lib/getCategories';

import {
    getSubcategoriesFor,
    getSubcategoryLabel,
} from '@/features/garage/lib/getSubcategories';

import { addUserCategory } from '@/features/garage/lib/userCategories';
import { addUserSubcategory } from '@/features/garage/lib/userSubcategories';

import {
    enablePartSubcategory,
    useEnabledPartSubcategories,
    useHiddenPartSubcategories,
} from '@/features/garage/parts/hooks/useEnabledPartSubcategories';
import {suggestPartSubcategory} from "@/features/catalog/lib/suggestPartSubcategory";
import {expandInstallations, installationKey} from "@/features/catalog/lib/partInstallations";
import {PartInstallation} from "@/types/partInstallation";
import {toast} from "sonner";
import {systemStore} from "@/features/admin/lib/systemStore";

export type SavedPartDestination = {
    category: PartCategory;
    subcategory: string;
    path: string;
};

type Props = {
    carId: string;
    article: CatalogArticle;
    nodeName?: string;
    onSaved: (destination: SavedPartDestination) => void;
};

const NEW_CATEGORY = '__new_category__';
const NEW_SUBCATEGORY = '__new_subcategory__';

const normalize = (value: string) =>
    value.trim().replace(/\s+/g, ' ').toLowerCase();

function readIds(key: string): string[] {
    try {
        const value: unknown = JSON.parse(
            localStorage.getItem(key) ?? '[]'
        );

        return Array.isArray(value)
            ? value.filter(
                (item): item is string => typeof item === 'string'
            )
            : [];
    } catch {
        return [];
    }
}

export function useSaveToCatalogModal({
                                          carId,
                                          article,
                                          nodeName,
                                          onSaved,
                                      }: Props) {
    const car = getGarageCars().find(item => item.id === carId);
    const items = car?.partsCatalog?.items ?? [];

    const enabledCategoryIds = readIds(
        `automate-enabled-part-categories:${carId}`
    );

    // Используем те же правила видимости, что и личный каталог.
    const categories = getCategoriesFor().filter(category =>
        category.isCustom ||
        enabledCategoryIds.includes(category.id) ||
        items.some(item => item.category === category.id)
    );

    const [initialDestination] = useState(() => {
        // Ищем среди доступных подкатегорий всех категорий,
        // а не только внутри предварительно угаданной.
        const candidates = categories.flatMap(category => {
            const preferenceKey =
                `automate-enabled-part-subcategories:${
                    encodeURIComponent(carId)
                }:${
                    encodeURIComponent(category.id)
                }`;

            const enabledIds = readIds(preferenceKey);
            const hiddenIds = readIds(`${preferenceKey}:hidden`);

            return getSubcategoriesFor(
                category.id as PartCategory
            )
                .filter(subcategory => {
                    if (subcategory.id === 'other') return false;

                    const hasItems = items.some(item =>
                        item.category === category.id &&
                        (item.subcategory || 'other') ===
                        subcategory.id
                    );

                    return (
                        hasItems ||
                        (
                            !hiddenIds.includes(subcategory.id) &&
                            (
                                subcategory.isCustom ||
                                enabledIds.includes(subcategory.id)
                            )
                        )
                    );
                })
                .map(subcategory => ({
                    id: JSON.stringify([
                        category.id,
                        subcategory.id,
                    ]),
                    label: subcategory.label,
                }));
        });

        const suggested = suggestPartSubcategory(
            article.name,
            candidates
        );

        if (suggested) {
            const [categoryId, subcategoryId] =
                JSON.parse(suggested) as [string, string];

            return {
                category: categoryId,
                subcategory: subcategoryId,
            };
        }

        const detected = detectCategory(article, nodeName);

        return {
            category: categories.some(
                item => item.id === detected
            )
                ? detected
                : '',
            subcategory: '',
        };
    });

    const [category, setCategoryValue] = useState(
        initialDestination.category
    );



    // Подкатегорию пользователь выбирает явно.
    const [subcategory, setSubcategory] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newSubcategoryName, setNewSubcategoryName] = useState('');
    const installationOptions = expandInstallations(
        article.installationOptions ?? []
    );

    const [installation, setInstallation] =
        useState<PartInstallation>(() =>
            installationOptions.length === 1
                ? { ...installationOptions[0] }
                : {}
        );

    const [error, setError] = useState('');

    const subcategoryChosenManually = useRef(false);

    const creatingCategory = category === NEW_CATEGORY;
    const creatingSubcategory = subcategory === NEW_SUBCATEGORY;

    const existingCategoryId =
        category && !creatingCategory ? category : null;

    const enabledSubcategoryIds = useEnabledPartSubcategories(
        carId,
        existingCategoryId
    );

    const hiddenSubcategoryIds = useHiddenPartSubcategories(
        carId,
        existingCategoryId
    );

    const subcategories = existingCategoryId
        ? getSubcategoriesFor(
            existingCategoryId as PartCategory
        ).filter(sub => {
            const hasItems = items.some(item =>
                item.category === existingCategoryId &&
                (item.subcategory || 'other') === sub.id
            );

            return (
                hasItems ||
                (
                    !hiddenSubcategoryIds.includes(sub.id) &&
                    (
                        sub.isCustom ||
                        enabledSubcategoryIds.includes(sub.id)
                    )
                ) ||
                sub.id === 'other'
            );
        })
        : [{ id: 'other', label: 'Прочее', isCustom: false }];

    const suggestedSubcategory = existingCategoryId
        ? suggestPartSubcategory(
            article.name,
            subcategories
        )
        : '';

    useEffect(() => {
        if (
            !existingCategoryId ||
            subcategoryChosenManually.current
        ) {
            return;
        }

        setSubcategory(suggestedSubcategory);
    }, [existingCategoryId, suggestedSubcategory]);



    const categoryLabel = creatingCategory
        ? newCategoryName.trim()
        : categories.find(item => item.id === category)?.label ?? '';

    const subcategoryLabel = creatingSubcategory
        ? newSubcategoryName.trim()
        : subcategories.find(item => item.id === subcategory)?.label ?? '';

    const path = [
        'Запчасти',
        categoryLabel || 'Выберите категорию',
        subcategoryLabel || 'Выберите подкатегорию',
    ].join(' → ');

    const changeCategory = (value: string) => {
        subcategoryChosenManually.current = false;

        setCategoryValue(value);

        setSubcategory(
            value === NEW_CATEGORY ? 'other' : ''
        );

        setNewSubcategoryName('');
        setError('');
    };

    const changeSubcategory = (value: string) => {
        subcategoryChosenManually.current = true;
        setSubcategory(value);
        setError('');
    };

    const save = () => {
        setError('');

        if (!category || !subcategory) {
            setError('Выберите категорию и подкатегорию.');
            return;
        }

        if (creatingCategory && !newCategoryName.trim()) {
            setError('Введите название категории.');
            return;
        }

        if (creatingSubcategory && !newSubcategoryName.trim()) {
            setError('Введите название подкатегории.');
            return;
        }

        try {
            let categoryId = category;

            if (creatingCategory) {
                const name = newCategoryName.trim();

                const existing = getCategoriesFor().find(
                    item => normalize(item.label) === normalize(name)
                );

                categoryId = existing?.id ?? addUserCategory(name).key;
            } else if (
                !getCategoriesFor().some(item => item.id === categoryId)
            ) {
                throw new Error(
                    'Категория больше недоступна. Выберите другую.'
                );
            }

            const typedCategory = categoryId as PartCategory;
            let subcategoryId = subcategory;

            if (creatingSubcategory) {
                const name = newSubcategoryName.trim();

                const existing = getSubcategoriesFor(
                    typedCategory
                ).find(
                    item => normalize(item.label) === normalize(name)
                );

                subcategoryId = existing?.id ??
                    addUserSubcategory(typedCategory, name).key;
            } else if (
                !getSubcategoriesFor(typedCategory).some(
                    item => item.id === subcategoryId
                )
            ) {
                throw new Error(
                    'Подкатегория больше недоступна. Выберите другую.'
                );
            }

            // Явно подключаем выбранное место к этой машине.
            const categoryKey =
                `automate-enabled-part-categories:${carId}`;

            localStorage.setItem(
                categoryKey,
                JSON.stringify([
                    ...new Set([
                        ...readIds(categoryKey),
                        categoryId,
                    ]),
                ])
            );

            enablePartSubcategory(
                carId,
                categoryId,
                subcategoryId
            );

            const result = saveArticleToPersonalCatalog(
                carId,
                article,
                {
                    category: typedCategory,
                    subcategory: subcategoryId,
                    nodeName,
                    installation,
                }
            );

            if (!result.success) {
                setError(result.message);
                return;
            }

            const hasInstallation = Boolean(
                installation.axle || installation.side
            );

            const alreadyConfirmed =
                installationOptions.some(
                    option =>
                        installationKey(option) ===
                        installationKey(installation)
                );

            if (
                car &&
                hasInstallation &&
                !alreadyConfirmed
            ) {
                try {
                    systemStore.addUserPart({
                        carId,
                        carBrand: car.make,
                        carModel: car.model,
                        carYear: car.year,
                        carVin: car.vin,

                        engine: car.engine,
                        transmission: car.transmission,
                        drivetrain: car.driveType,

                        carSpecs: {
                            bodyClass: car.bodyClass,
                            displacementL: car.displacementL,
                            fuel: car.fuel,
                            trim: car.trim,
                            transmission: car.transmission,
                            driveType: car.driveType,
                        },

                        partName: article.name,
                        partBrand: article.brand,
                        partArticle: article.oem,
                        isOem: article.isOem,

                        category: typedCategory,
                        subcategory: subcategoryId,

                        axle: installation.axle,
                        side: installation.side,

                        source: 'user_manual',

                        note: 'Предложено расположение при сохранении из ИИ-каталога.',
                    });
                } catch {
                    toast.error(
                        'Деталь сохранена, но отправить расположение на проверку не удалось.'
                    );
                }
            }

            onSaved({
                category: typedCategory,
                subcategory: subcategoryId,
                path: [
                    'Запчасти',
                    getCategoryLabel(categoryId),
                    getSubcategoryLabel(
                        typedCategory,
                        subcategoryId
                    ),
                ].join(' → '),
            });
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Не удалось сохранить запчасть.'
            );
        }
    };

    return {
        categories,
        subcategories,
        category,
        subcategory,
        creatingCategory,
        creatingSubcategory,
        newCategoryName,
        newSubcategoryName,
        path,
        error,
        installation,
        installationOptions,
        setInstallation,

        newCategoryValue: NEW_CATEGORY,
        newSubcategoryValue: NEW_SUBCATEGORY,

        changeCategory,
        setSubcategory: changeSubcategory,
        setNewCategoryName,
        setNewSubcategoryName,
        save,
    };
}