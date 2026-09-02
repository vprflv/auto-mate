'use client';

import { useEffect, useMemo, useState } from 'react';

import { useVehicleCatalog } from '@/features/catalog/hooks/useVehicleCatalog';
import {
    detectCategory,
    removeArticleFromPersonalCatalog,
    saveArticleToPersonalCatalog,
} from '@/features/catalog/lib/saveToPersonalCatalog';
import { getGarageCars } from '@/features/garage/add/lib/storage';
import { CarPartItem, PartCategory } from '@/types';
import { CatalogArticle } from '@/types/catalog/catalog';
import { findNodeName } from '@/features/catalog/lib/findNodeName';

import {
    PART_SUBCATEGORY_LABELS,
    PART_SUBCATEGORY_ORDER,
} from '@/features/garage/lib/config/partSubcategories';

function getPersonalParts(carId: string): CarPartItem[] {
    const car = getGarageCars().find((item) => item.id === carId);
    return car?.partsCatalog?.items || [];
}

function detectSubcategory(category: PartCategory, text: string): string {
    const q = text.toLowerCase();
    const keys = PART_SUBCATEGORY_ORDER[category] || ['other'];

    for (const key of keys) {
        if (key === 'other') continue;
        const label = PART_SUBCATEGORY_LABELS[key] || key;
        if (q.includes(label.toLowerCase()) || q.includes(key.toLowerCase())) {
            return key;
        }
    }

    return 'other';
}

export function useCatalogPage(carId: string) {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [personalParts, setPersonalParts] = useState<CarPartItem[]>([]);

    const car = useMemo(
        () => getGarageCars().find((item) => item.id === carId) || null,
        [carId]
    );

    const { catalog, isLoading, isFetching, refresh } = useVehicleCatalog({
        carId,
        vin: car?.vin,
        make: car?.make || '',
        model: car?.model || '',
        year: car?.year || 0,
        enabled: !!car,
    });

    useEffect(() => {
        setPersonalParts(getPersonalParts(carId));
    }, [carId]);

    const filteredArticles = useMemo(() => {
        if (!catalog) return [];

        return catalog.articles.filter((art) => {
            if (selectedNodeId && art.nodeId !== selectedNodeId) return false;
            if (!search) return true;
            const q = search.toLowerCase();
            return (
                art.name.toLowerCase().includes(q) ||
                art.oem.toLowerCase().includes(q) ||
                (art.brand && art.brand.toLowerCase().includes(q))
            );
        });
    }, [catalog, selectedNodeId, search]);

    const selectedNodeName = catalog
        ? findNodeName(catalog.nodes, selectedNodeId)
        : null;

    const isAlreadyAdded = (oem: string) =>
        personalParts.some(
            (item) => item.oemNumber?.toLowerCase() === oem.toLowerCase()
        );

    const addToPersonal = (art: CatalogArticle) => {
        if (!catalog) return;

        const nodeName = findNodeName(catalog.nodes, art.nodeId) || undefined;
        const category = detectCategory(art, nodeName);
        const subcategory = detectSubcategory(
            category,
            `${art.name} ${nodeName || ''} ${art.note || ''}`
        );

        const result = saveArticleToPersonalCatalog(carId, art, {
            category,
            subcategory,
            nodeName,
        });

        if (result.success) {
            setPersonalParts(getPersonalParts(carId));
        }
    };

    const removeFromPersonal = (art: CatalogArticle) => {
        const result = removeArticleFromPersonalCatalog(carId, art.oem);
        if (result.success) {
            setPersonalParts(getPersonalParts(carId));
        }
    };


    return {
        car,
        catalog,
        isLoading,
        isFetching,
        refresh,
        search,
        setSearch,
        selectedNodeId,
        setSelectedNodeId,
        filteredArticles,
        selectedNodeName,
        isAlreadyAdded,
        addToPersonal,
        removeFromPersonal,
    };
}