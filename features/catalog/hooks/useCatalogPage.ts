'use client';

import { useEffect, useMemo, useState } from 'react';

import { useVehicleCatalog } from '@/features/catalog/hooks/useVehicleCatalog';
import {

    isFluidArticle,
    removeArticleFromPersonalCatalog,
    removeFluidFromPersonalCatalog,
    saveFluidToPersonalCatalog,
} from '@/features/catalog/lib/saveToPersonalCatalog';
import { getGarageCars } from '@/features/garage/add/lib/storage';
import { CarPartItem,  } from '@/types';
import { CatalogArticle } from '@/types/catalog/catalog';
import { findNodeName } from '@/features/catalog/lib/findNodeName';

import { CarFluidItem } from '@/types/oil';

import {toast} from "sonner";


function getPersonalParts(carId: string): CarPartItem[] {
    const car = getGarageCars().find((item) => item.id === carId);
    return car?.partsCatalog?.items || [];
}

function getPersonalFluids(carId: string): CarFluidItem[] {
    const car = getGarageCars().find((item) => item.id === carId);
    return car?.fluids?.items || [];
}



export function useCatalogPage(carId: string) {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [personalParts, setPersonalParts] = useState<CarPartItem[]>([]);
    const [personalFluids, setPersonalFluids] = useState<CarFluidItem[]>([]);

    const [partToSave, setPartToSave] = useState<{
        article: CatalogArticle;
        nodeName?: string;
    } | null>(null);


    const car = getGarageCars().find(item => item.id === carId) || null;

    const { catalog, isLoading, isFetching, error, refresh } = useVehicleCatalog({
        carId,
        vin: car?.vin,
        make: car?.make || '',
        model: car?.model || '',
        year: car?.year || 0,
        enabled: !!car,
    });

    useEffect(() => {
        setPersonalParts(getPersonalParts(carId));
        setPersonalFluids(getPersonalFluids(carId));
    }, [carId]);

    useEffect(() => {
        if (!catalog?.nodes.length) return;

        const containsSelectedNode = (
            nodes: typeof catalog.nodes
        ): boolean =>
            nodes.some(node =>
                node.id === selectedNodeId ||
                containsSelectedNode(node.children ?? [])
            );

        if (containsSelectedNode(catalog.nodes)) return;

        const firstNode = catalog.nodes[0];

        setSelectedNodeId(
            firstNode.children?.[0]?.id ?? firstNode.id
        );
    }, [catalog, selectedNodeId]);

    const filteredArticles = useMemo(() => {
        if (!catalog) return [];

        const q = search.trim().toLowerCase();

        if (q) {
            return catalog.articles.filter(article =>
                [article, ...(article.variants ?? [])].some(item =>
                    [
                        item.name,
                        item.oem,
                        item.brand ?? '',
                        ...(item.originalNumbers ?? []),
                    ].some(value =>
                        value.toLowerCase().includes(q)
                    )
                )
            );
        }

        if (!selectedNodeId) return [];

        const selectedNodeIds = new Set<string>();

        const collectSelectedNodes = (
            nodes: typeof catalog.nodes,
            parentSelected = false
        ): void => {
            for (const node of nodes) {
                const selected =
                    parentSelected ||
                    node.id === selectedNodeId;

                if (selected) {
                    selectedNodeIds.add(node.id);
                }

                collectSelectedNodes(
                    node.children ?? [],
                    selected
                );
            }
        };

        collectSelectedNodes(catalog.nodes);

        return catalog.articles.filter(article =>
            selectedNodeIds.has(article.nodeId)
        );
    }, [catalog, selectedNodeId, search]);

    const selectedNodeName = catalog
        ? findNodeName(catalog.nodes, selectedNodeId)
        : null;

    const isAlreadyAdded = (oem: string) =>
        personalParts.some(
            (item) => item.oemNumber?.toLowerCase() === oem.toLowerCase()
        ) ||
        personalFluids.some(
            (item) => item.spec?.toLowerCase() === oem.toLowerCase()
        );

    const addToPersonal = (article: CatalogArticle) => {
        if (!catalog) return;

        if (isFluidArticle(article)) {
            const result = saveFluidToPersonalCatalog(
                carId,
                article
            );

            if (result.success) {
                setPersonalFluids(getPersonalFluids(carId));
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }

            return;
        }

        setPartToSave({
            article,
            nodeName:
                findNodeName(catalog.nodes, article.nodeId) ??
                undefined,
        });
    };

    const closeSaveModal = () => {
        setPartToSave(null);
    };

    const finishSavingPart = () => {
        setPersonalParts(getPersonalParts(carId));
        setPartToSave(null);
    };

    const removeFromPersonal = (art: CatalogArticle) => {
        if (isFluidArticle(art)) {
            const result = removeFluidFromPersonalCatalog(carId, art.oem);
            if (result.success) setPersonalFluids(getPersonalFluids(carId));
            return;
        }

        const result = removeArticleFromPersonalCatalog(carId, art.oem);
        if (result.success) {
            setPersonalParts(getPersonalParts(carId));
        }
    };

    return {

        error,
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
        partToSave,
        closeSaveModal,
        finishSavingPart,
        removeFromPersonal,
    };
}