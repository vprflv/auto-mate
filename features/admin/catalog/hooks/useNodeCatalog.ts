'use client';

import * as React from 'react';

import { storage } from '@/features/admin/lib/system-store/storage';
import { getCatalogSection } from '@/features/catalog/lib/catalogSections';
import { getRelatedParts, uniqueRelatedProducts } from '@/features/admin/lib/system-store/oemCrosses';

import type {
    StoredCatalogNode,
    StoredMasterModel,
    StoredPartItem
} from '@/features/admin/lib/system-store/types';

import {
    catalogFilterFields,
    readCatalogFilters,
    buildCatalogQuery,
    buildModelCatalogHref,
    hasCatalogFilters,
    getMatchingModificationIds,
    matchesCatalogFilters,
    type CatalogSearchParams
} from '../lib/catalogFilters';

interface CatalogSnapshot {
    brandSlug: string;
    modelSlug: string;
    nodeId: string;

    node: StoredCatalogNode | null;
    masterModel: StoredMasterModel | null;
    modelParts: StoredPartItem[];
}

export function useNodeCatalog(
    brandSlug: string,
    modelSlug: string,
    nodeId: string,
    query: CatalogSearchParams
) {
    const [snapshot, setSnapshot] =
        React.useState<CatalogSnapshot | null>(null);

    const [selectedPartId, setSelectedPartId] =
        React.useState<string | null>(null);

    React.useEffect(() => {
        const loadData = () => {
            const state = storage.getState();

            const modelNodes = state.catalogNodes.filter(
                item =>
                    item.brandSlug === brandSlug &&
                    item.modelSlug === modelSlug
            );

            const node = modelNodes.find(
                item => item.id === nodeId
            ) ?? null;

            const masterModel = state.masterModels.find(
                item =>
                    item.brandSlug === brandSlug &&
                    item.modelSlug === modelSlug
            ) ?? null;

            setSnapshot({
                brandSlug,
                modelSlug,
                nodeId,
                node,
                masterModel,
                modelParts: node
                    ? modelNodes.filter(item => getCatalogSection(item.category) === getCatalogSection(node.category)).flatMap(item => item.items)
                    : []
            });

            // Если открытую деталь удалили,
            // закрываем её карточку.
            setSelectedPartId(current => {
                if (!current) return null;

                return node?.items.some(
                    item => item.id === current
                )
                    ? current
                    : null;
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
    }, [brandSlug, modelSlug, nodeId]);

    const currentSnapshot =
        snapshot?.brandSlug === brandSlug &&
        snapshot?.modelSlug === modelSlug &&
        snapshot?.nodeId === nodeId
            ? snapshot
            : null;

    const loaded = currentSnapshot !== null;
    const node = currentSnapshot?.node ?? null;

    const filters = readCatalogFilters(query);
    const hasActiveFilters = hasCatalogFilters(filters);

    const matchingModIds = getMatchingModificationIds(
        currentSnapshot?.masterModel?.modifications ?? [],
        filters
    );
    const modelParts = currentSnapshot?.modelParts ?? [];
    const branchModIds = node?.allowedModificationIds === undefined ? matchingModIds
        : new Set(node.allowedModificationIds.filter(id => matchingModIds.has(id)));
    const isFluid = node && getCatalogSection(node.category) === 'fluids';

    const matches = (part: StoredPartItem): boolean =>
        matchesCatalogFilters(
            part,
            filters,
            branchModIds,
            isFluid ? [] : modelParts
        );

    // Только детали, подходящие выбранным параметрам.
    const visibleParts = node?.items.filter(matches) ?? [];

    // Аналоги считаем с учётом тех же фильтров,
    // но по всем разделам этой модели.
    const matchingModelParts =
        currentSnapshot?.modelParts.filter(matches) ?? [];

    const getAnalogsCount = (
        part: StoredPartItem
    ): number => {
        if (!part.isOem || part.fluidAnalogDetached) return 0;
        const analogs = getRelatedParts(part, matchingModelParts).filter(item => !item.isOem);
        return uniqueRelatedProducts(part, analogs).length;
    };

    // Берём актуальную деталь из хранилища после
    // каждого обновления, включая сохранение OEM-номеров.
    const selectedPart = node?.items.find(
        item => item.id === selectedPartId
    ) ?? null;

    const openPart = (part: StoredPartItem) => {
        setSelectedPartId(part.id);
    };

    const closePart = () => {
        setSelectedPartId(null);
    };

    const modelPath =
        `/admin/catalog/${encodeURIComponent(brandSlug)}` +
        `/${encodeURIComponent(modelSlug)}`;

    const nodePath =
        `${modelPath}/${encodeURIComponent(nodeId)}`;

    const currentQuery = buildCatalogQuery(filters);

    const modelHref = buildModelCatalogHref(
        modelPath,
        currentQuery,
        node ? getCatalogSection(node.category) : 'parts',
    );

    const activeFilterLabels = catalogFilterFields
        .filter(field => filters[field.key] !== 'all')
        .map(
            field =>
                `${field.label}: ${filters[field.key]}`
        );

    return {
        loaded,
        node,
        masterModel: currentSnapshot?.masterModel ?? null,

        visibleParts,
        getAnalogsCount,

        hasActiveFilters,
        matchingModCount: matchingModIds.size,
        activeFilterLabels,

        modelHref,
        nodePath,

        selectedPart,
        isModalOpen: selectedPart !== null,
        openPart,
        closePart
    };
}