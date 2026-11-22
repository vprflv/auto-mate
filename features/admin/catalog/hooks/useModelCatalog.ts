'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { CatalogSection } from '@/types/catalog/catalog';
import { getCatalogSection } from '@/features/catalog/lib/catalogSections';
import { catalogBranchAllowsModification } from '@/features/catalog/lib/catalogBranchApplicability';
import { getNodeFillCapacity } from '@/features/catalog/lib/fluidFillCapacities';

import { storage } from '@/features/admin/lib/system-store/storage';

import type {
    StoredMasterModel,
    StoredCatalogNode
} from '@/features/admin/lib/system-store/types';

import {
    catalogFilterFields,
    readCatalogFilters,
    buildCatalogQuery,
    buildModelCatalogHref,
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
        window.addEventListener('garage-updated', loadData);
        window.addEventListener('storage', loadData);

        window.addEventListener(
            'system-store-updated',
            loadData
        );

        return () => {
            window.removeEventListener('garage-updated', loadData);
            window.removeEventListener('storage', loadData);
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

    const section: CatalogSection = query.section === 'fluids' ? 'fluids' : 'parts';
    const sectionNodes = catalogNodes.filter(node => getCatalogSection(node.category) === section);
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

    const modelParts = sectionNodes.flatMap(
        node => node.items
    );

    // Создаём отфильтрованные копии узлов,
    // исходные данные каталога не изменяем.
    const visibleNodes = sectionNodes
        .map(node => {
            const branchModIds = node.allowedModificationIds === undefined ? matchingModIds
                : new Set(node.allowedModificationIds.filter(id => matchingModIds.has(id)));
            return {
                ...node,
                items: node.items.filter(part =>
                    matchesCatalogFilters(part, filters, branchModIds, section === 'fluids' ? [] : modelParts)
                ),
            };
        })
        .filter(node =>
            !hasActiveFilters || node.items.length > 0 || (
                section === 'fluids' && modifications.some(modification =>
                    matchingModIds.has(modification.id) && catalogBranchAllowsModification(node, modification.id) &&
                    getNodeFillCapacity(node, modification) !== undefined
                )
            )
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
            modificationIds: [],
            [key]: value
        });

        startTransition(() => {
            router.replace(
                buildModelCatalogHref(modelPath, nextQuery, section),
                { scroll: false }
            );
        });
    };

    const resetFilters = () => {
        startTransition(() => {
            router.replace(buildModelCatalogHref(modelPath, '', section), { scroll: false });
        });
    };

    const selectModification = (modificationId: string, checked: boolean) => {
        const selected = new Set(filters.modificationIds);
        if (checked) selected.add(modificationId);
        else selected.delete(modificationId);

        const nextQuery = buildCatalogQuery({
            ...readCatalogFilters({}),
            modificationIds: [...selected],
        });
        startTransition(() => {
            router.replace(buildModelCatalogHref(modelPath, nextQuery, section), { scroll: false });
        });
    };

    return {
        loaded,
        isPending,
        masterModel,

        modelPath,
        currentQuery,
        section,

        filters,
        filterOptions,
        hasActiveFilters,
        matchingModCount: matchingModIds.size,

        visibleNodes,
        nodesByCategory,
        visiblePartsCount,

        changeFilter,
        selectModification,
        resetFilters
    };
}
