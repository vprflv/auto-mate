'use client';

import { useEffect, useMemo, useState } from 'react';

import { useVehicleCatalog } from '@/features/catalog/hooks/useVehicleCatalog';
import {

    isFluidArticle, matchesPersonalPart,
    removeArticleFromPersonalCatalog,
    removeFluidFromPersonalCatalog,
    saveFluidToPersonalCatalog,
} from '@/features/catalog/lib/saveToPersonalCatalog';
import { catalogReviewVersion } from '@/features/catalog/lib/catalogVehicleSelection';
import { getGarageCars } from '@/features/garage/add/lib/storage';
import { CarPartItem,  } from '@/types';
import type { CatalogArticle, CatalogSection } from '@/types/catalog/catalog';
import { findCatalogNode, findNodePath } from '@/features/catalog/lib/findNodeName';

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



export function useCatalogPage(carId: string, section: CatalogSection) {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [personalParts, setPersonalParts] = useState<CarPartItem[]>([]);
    const [personalFluids, setPersonalFluids] = useState<CarFluidItem[]>([]);

    const [partToSave, setPartToSave] = useState<{
        article: CatalogArticle;
        catalogPath: string[];
    } | null>(null);


    const car = getGarageCars().find(item => item.id === carId) || null;

    const { catalog, isLoading, isFetching, error, refresh } = useVehicleCatalog({
        carId,
        section,
        catalogRevision: car ? catalogReviewVersion(car) : undefined,
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
            const paths = new Map<string, string>();
            const matchesPath = (nodeId: string) => {
                let path = paths.get(nodeId);
                if (path === undefined) {
                    path = findNodePath(catalog.nodes, nodeId).join(' ').toLowerCase();
                    paths.set(nodeId, path);
                }
                return path.includes(q);
            };
            const searchable = section === 'fluids'
                ? catalog.articles.map(article => ({ ...article, variants: article.variants?.filter(variant => variant.nodeIds?.length !== 0) }))
                : catalog.articles;
            return searchable.filter(article =>
                [article, ...(article.variants ?? [])].some(item =>
                    (item.nodeIds ?? [item.nodeId]).some(matchesPath) || [
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

        const belongsToSelection = (article: CatalogArticle) =>
            (article.nodeIds ?? [article.nodeId]).some(id => selectedNodeIds.has(id));
        const groups: CatalogArticle[] = [];
        const ungrouped = new Map<string, CatalogArticle>();
        const groupedVariantIds = new Set<string>();

        for (const article of catalog.articles) {
            const variants = article.variants?.filter(variant =>
                variant.nodeIds ? belongsToSelection(variant) : selectedNodeIds.has(article.nodeId)
            );
            if (belongsToSelection(article)) {
                groups.push({ ...article, variants });
                variants?.forEach(variant => groupedVariantIds.add(variant.id));
            } else {
                variants?.forEach(variant => ungrouped.set(variant.id, variant));
            }
        }

        return [...groups, ...[...ungrouped.values()].filter(variant => !groupedVariantIds.has(variant.id))];
    }, [catalog, selectedNodeId, search, section]);

    const selectedNode = catalog && selectedNodeId
        ? findCatalogNode(catalog.nodes, selectedNodeId)
        : undefined;

    const isAlreadyAdded = (article: CatalogArticle) =>
        isFluidArticle(article)
            ? personalFluids.some(
                item => item.spec?.toLowerCase() === article.oem.toLowerCase()
            )
            : personalParts.some(item => matchesPersonalPart(item, article));

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

        const placements = (article.nodeIds ?? [article.nodeId]).map(id => findNodePath(catalog.nodes, id));
        const selectedPath = selectedNodeId ? findNodePath(catalog.nodes, selectedNodeId) : [];
        const path = placements.find(item => selectedPath.every((name, index) => name === item[index])) ?? placements[0] ?? [];
        setPartToSave({
            article,
            catalogPath: path.slice(0, 2),
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

        const result = removeArticleFromPersonalCatalog(carId, art);
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
        selectedNode,
        isAlreadyAdded,
        addToPersonal,
        partToSave,
        closeSaveModal,
        finishSavingPart,
        removeFromPersonal,
    };
}
