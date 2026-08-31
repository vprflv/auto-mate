'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useVehicleCatalog } from '@/features/catalog/hooks/useVehicleCatalog';
import {
    removeArticleFromPersonalCatalog,
    saveArticleToPersonalCatalog
} from '@/features/catalog/lib/saveToPersonalCatalog';
import { getGarageCars } from '@/features/garage/add/lib/storage';
import { CarPartItem, PartCategory } from '@/types';
import { CatalogArticle } from '@/types/catalog/catalog';
import { findNodeName } from '@/features/catalog/lib/findNodeName';

function getPersonalParts(carId: string): CarPartItem[] {
    const car = getGarageCars().find((item) => item.id === carId);
    return car?.partsCatalog?.items || [];
}

export function useCatalogPage(carId: string) {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [personalParts, setPersonalParts] = useState<CarPartItem[]>([]);
    const [articleToSave, setArticleToSave] = useState<CatalogArticle | null>(null);
    const [nodeNameToSave, setNodeNameToSave] = useState<string | undefined>();

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

    const openSaveModal = (art: CatalogArticle) => {
        if (!catalog) return;
        setNodeNameToSave(findNodeName(catalog.nodes, art.nodeId) || undefined);
        setArticleToSave(art);
    };

    const confirmSave = ({
                             category,
                             subcategory,
                         }: {
        category: PartCategory;
        subcategory: string;
    }) => {
        if (!articleToSave) return;

        const result = saveArticleToPersonalCatalog(carId, articleToSave, {
            category,
            subcategory,
            nodeName: nodeNameToSave,
        });

        if (result.success) {
            toast.success(result.message);
            setPersonalParts(getPersonalParts(carId));
        } else {
            toast.error(result.message);
        }

        setArticleToSave(null);
    };

    const removeFromPersonal = (art: CatalogArticle) => {
        toast.warning(`Убрать «${art.name}» из каталога?`, {
            description: 'Позиция исчезнет из личного списка запчастей.',
            duration: Infinity,
            action: {
                label: 'Убрать',
                onClick: () => {
                    const result = removeArticleFromPersonalCatalog(carId, art.oem);
                    if (result.success) {
                        toast.success(result.message);
                        setPersonalParts(getPersonalParts(carId));
                    } else {
                        toast.error(result.message);
                    }
                },
            },
            cancel: {
                label: 'Отмена',
                onClick: () => {},
            },
        });
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
        removeFromPersonal,
        isAlreadyAdded,
        articleToSave,
        nodeNameToSave,
        openSaveModal,
        closeSaveModal: () => setArticleToSave(null),
        confirmSave,
    };
}