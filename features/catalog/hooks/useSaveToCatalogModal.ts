'use client';

import {useEffect, useRef, useState} from 'react';

import type { PartCategory } from '@/types';
import type { CatalogArticle } from '@/types/catalog/catalog';

import {
    detectCategory,
    matchesPersonalPart,
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

export type SavedPartDestination = {
    category: PartCategory;
    subcategory: string;
    path: string;
};

type Props = {
    carId: string;
    article: CatalogArticle;
    catalogPath: string[];
    onSaved: (destination: SavedPartDestination) => void;
};

const NEW_CATEGORY = '__new_category__';
const CATALOG_CATEGORY = '__catalog_category__';
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
                                          catalogPath,
                                          onSaved,
                                      }: Props) {
    const car = getGarageCars().find(item => item.id === carId);
    const items = car?.partsCatalog?.items ?? [];

    const enabledCategoryIds = readIds(
        `automate-enabled-part-categories:${carId}`
    );

    // Используем те же правила видимости, что и личный каталог.
    const categories = getCategoriesFor(carId).filter(category =>
        category.isCustom ||
        (category.isDefault && !enabledCategoryIds.includes(`hidden:${category.id}`)) ||
        enabledCategoryIds.includes(category.id) ||
        items.some(item => item.category === category.id)
    );

    const nodeName = catalogPath[catalogPath.length - 1];
    const catalogCategory = catalogPath[0]?.trim();
    const catalogSubcategory = catalogPath.length > 1 ? nodeName?.trim() : undefined;

    function getCatalogDestination() {
        if (!catalogCategory) return null;

        const existingCategory = categories.find(item =>
            normalize(item.label) === normalize(catalogCategory)
        );
        let subcategory: string = catalogSubcategory ? NEW_SUBCATEGORY : 'other';

        if (existingCategory && catalogSubcategory) {
            const key = `automate-enabled-part-subcategories:${encodeURIComponent(carId)}:${encodeURIComponent(existingCategory.id)}`;
            const enabledIds = readIds(key);
            const hiddenIds = readIds(`${key}:hidden`);
            const existingSubcategory = getSubcategoriesFor(existingCategory.id as PartCategory).find(item =>
                normalize(item.label) === normalize(catalogSubcategory) &&
                (item.id === 'other' ||
                    items.some(part => part.category === existingCategory.id && part.subcategory === item.id) ||
                    (!hiddenIds.includes(item.id) && (item.isCustom || enabledIds.includes(item.id))))
            );
            if (existingSubcategory) subcategory = existingSubcategory.id;
        }

        return {
            category: existingCategory?.id ?? CATALOG_CATEGORY,
            subcategory,
        };
    }

    const [initialDestination] = useState(() => {
        const destination = getCatalogDestination();
        if (destination) {
            return {
                category: destination.category === CATALOG_CATEGORY ? '' : destination.category,
                subcategory: destination.subcategory === NEW_SUBCATEGORY ? '' : destination.subcategory,
            };
        }

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



    const [subcategory, setSubcategory] = useState(initialDestination.subcategory);
    const [newCategoryName, setNewCategoryName] = useState('');
    const confirmedInstallations = article.installationOptions ?? [];


    const installation = confirmedInstallations.length === 1
        ? confirmedInstallations[0]
        : undefined;

    const [error, setError] = useState('');

    const subcategoryChosenManually = useRef(Boolean(catalogCategory || initialDestination.subcategory));

    const creatingCategoryManually = category === NEW_CATEGORY;
    const usingCatalogCategory = category === CATALOG_CATEGORY;
    const creatingCategory = creatingCategoryManually || usingCatalogCategory;
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
        ? (usingCatalogCategory ? catalogCategory ?? '' : newCategoryName.trim())
        : categories.find(item => item.id === category)?.label ?? '';

    const subcategoryLabel = creatingSubcategory
        ? catalogSubcategory ?? ''
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

        setError('');
    };

    const changeSubcategory = (value: string) => {
        subcategoryChosenManually.current = true;
        setSubcategory(value);
        setError('');
    };

    const applyCatalogPath = () => {
        const destination = getCatalogDestination();
        if (!destination) return;

        subcategoryChosenManually.current = true;
        setCategoryValue(destination.category);
        setSubcategory(destination.subcategory);
        setError('');
    };

    const save = () => {
        setError('');

        if (!category || !subcategory) {
            setError('Выберите категорию и подкатегорию.');
            return;
        }

        if (creatingCategory && !categoryLabel) {
            setError('Введите название категории.');
            return;
        }

        if (creatingSubcategory && !subcategoryLabel) {
            setError('Введите название подкатегории.');
            return;
        }

        try {
            const currentCar = getGarageCars().find(item => item.id === carId);
            if (!currentCar) throw new Error('Машина не найдена.');
            if (currentCar.partsCatalog?.items.some(item => matchesPersonalPart(item, article))) {
                throw new Error('Эта запчасть уже есть в вашем каталоге.');
            }

            let categoryId = category;

            if (creatingCategory) {
                const name = categoryLabel;

                const existing = getCategoriesFor(carId).find(
                    item => normalize(item.label) === normalize(name)
                );

                categoryId = existing?.id ?? addUserCategory(name).key;
            } else if (
                !getCategoriesFor(carId).some(item => item.id === categoryId)
            ) {
                throw new Error(
                    'Категория больше недоступна. Выберите другую.'
                );
            }

            const typedCategory = categoryId as PartCategory;
            let subcategoryId = subcategory;

            if (creatingSubcategory) {
                const name = subcategoryLabel;

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
                        ...readIds(categoryKey).filter(id => id !== `hidden:${categoryId}`),
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
                    ...(installation ? { installation } : {}),
                }
            );

            if (!result.success) {
                setError(result.message);
                return;
            }


            onSaved({
                category: typedCategory,
                subcategory: subcategoryId,
                path: [
                    'Запчасти',
                    getCategoryLabel(categoryId, carId),
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
        creatingCategoryManually,
        usingCatalogCategory,
        creatingSubcategory,
        newCategoryName,
        path,
        error,
        installation,

        newCategoryValue: NEW_CATEGORY,
        catalogCategoryValue: CATALOG_CATEGORY,
        catalogCategory,
        catalogSubcategory,
        newSubcategoryValue: NEW_SUBCATEGORY,

        changeCategory,
        applyCatalogPath,
        setSubcategory: changeSubcategory,
        setNewCategoryName,
        save,
    };
}
