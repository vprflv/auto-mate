'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { storage } from '@/features/admin/lib/system-store/storage';

import type {
    StoredMasterModel,
    StoredCatalogNode
} from '@/features/admin/lib/system-store/types';

import {
    catalogFilterFields,
    readCatalogFilters,
    buildCatalogQuery,
    hasCatalogFilters,
    getMatchingModificationIds,
    matchesCatalogFilters,
    type CatalogFilterKey,
    type CatalogSearchParams
} from '../lib/catalogFilters';

interface CatalogSnapshot {
    brandSlug: string;
    modelSlug: string;
    masterModel: StoredMasterModel | null;
    catalogNodes: StoredCatalogNode[];
}

export function useModelCatalog(
    brandSlug: string,
    modelSlug: string,
    query: CatalogSearchParams
) {
    const router = useRouter();

    const [snapshot, setSnapshot] =
        React.useState<CatalogSnapshot | null>(null);

    const [isPending, startTransition] = React.useTransition();

    const modelPath =
        `/admin/catalog/${encodeURIComponent(brandSlug)}` +
        `/${encodeURIComponent(modelSlug)}`;

    React.useEffect(() => {
        const loadData = () => {
            const state = storage.getState();

            const masterModel = state.masterModels.find(
                model =>
                    model.brandSlug === brandSlug &&
                    model.modelSlug === modelSlug
            );

            const catalogNodes = state.catalogNodes.filter(
                node =>
                    node.brandSlug === brandSlug &&
                    node.modelSlug === modelSlug
            );

            setSnapshot({
                brandSlug,
                modelSlug,
                masterModel: masterModel ?? null,
                catalogNodes
            });
        };

        loadData();

        window.addEventListener(
            'system-store-updated',
            loadData
        );

        return () => {
            window.removeEventListener(
                'system-store-updated',
                loadData
            );
        };
    }, [brandSlug, modelSlug]);

    // При переходе между моделями не показываем данные
    // предыдущего автомобиля до загрузки нового.
    const currentSnapshot =
        snapshot?.brandSlug === brandSlug &&
        snapshot?.modelSlug === modelSlug
            ? snapshot
            : null;

    const loaded = currentSnapshot !== null;

    const masterModel =
        currentSnapshot?.masterModel ?? null;

    const catalogNodes =
        currentSnapshot?.catalogNodes ?? [];

    const modifications = masterModel?.modifications ?? [];

    const filters = readCatalogFilters(query);
    const hasActiveFilters = hasCatalogFilters(filters);
    const currentQuery = buildCatalogQuery(filters);

    const matchingModIds = getMatchingModificationIds(
        modifications,
        filters
    );

    // Значения для выпадающих списков фильтров.
    const filterOptions: Record<CatalogFilterKey, string[]> = {
        engine: [],
        transmission: [],
        drivetrain: [],
        trim: []
    };

    for (const field of catalogFilterFields) {
        filterOptions[field.key] = Array.from(
            new Set(
                modifications
                    .map(mod => mod.attributes[field.key])
                    .filter(
                        (value): value is string =>
                            typeof value === 'string' &&
                            value.length > 0
                    )
            )
        ).sort((a, b) => a.localeCompare(b));
    }

    // Создаём отфильтрованные копии узлов,
    // исходные данные каталога не изменяем.
    const visibleNodes = catalogNodes
        .map(node => ({
            ...node,
            items: node.items.filter(part =>
                matchesCatalogFilters(
                    part,
                    filters,
                    matchingModIds
                )
            )
        }))
        .filter(node =>
            !hasActiveFilters || node.items.length > 0
        );

    const nodesByCategory = visibleNodes.reduce<
        Record<string, StoredCatalogNode[]>
    >((result, node) => {
        if (!result[node.category]) {
            result[node.category] = [];
        }

        result[node.category].push(node);

        return result;
    }, {});

    const visiblePartsCount = visibleNodes.reduce(
        (total, node) => total + node.items.length,
        0
    );

    const changeFilter = (
        key: CatalogFilterKey,
        value: string
    ) => {
        const nextQuery = buildCatalogQuery({
            ...filters,
            [key]: value
        });

        startTransition(() => {
            router.replace(
                nextQuery
                    ? `${modelPath}?${nextQuery}`
                    : modelPath,
                { scroll: false }
            );
        });
    };

    const resetFilters = () => {
        startTransition(() => {
            router.replace(modelPath, { scroll: false });
        });
    };

    return {
        loaded,
        isPending,
        masterModel,

        modelPath,
        currentQuery,

        filters,
        filterOptions,
        hasActiveFilters,
        matchingModCount: matchingModIds.size,

        visibleNodes,
        nodesByCategory,
        visiblePartsCount,

        changeFilter,
        resetFilters
    };
}