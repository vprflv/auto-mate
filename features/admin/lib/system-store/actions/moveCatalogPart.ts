import { normalizeArticle } from '../normalizeArticle';
import { storage } from '../storage';
import type { StoredCatalogNode, StoredPartItem } from '../types';

interface MoveCatalogPartInput {
    nodeId: string;
    partId: string;
    category: string;
    title: string;
}

function withItems(
    node: StoredCatalogNode,
    items: StoredPartItem[]
): StoredCatalogNode {
    const modificationIds = items.flatMap(
        item => item.compatibleModifications ?? []
    );

    return {
        ...node,
        items,
        compatibleModifications: modificationIds.includes('all')
            ? ['all']
            : [...new Set(modificationIds)],
    };
}

export function moveCatalogPart({
                                    nodeId,
                                    partId,
                                    category,
                                    title,
                                }: MoveCatalogPartInput): void {
    const targetCategory = category.trim();
    const targetTitle = title.trim();

    if (!targetCategory || !targetTitle) {
        throw new Error('Выберите категорию и подкатегорию.');
    }

    const state = storage.getState();
    const source = state.catalogNodes.find(node => node.id === nodeId);

    if (!source) {
        throw new Error('Исходный раздел больше не найден.');
    }

    const part = source.items.find(
        (item: StoredPartItem) => item.id === partId
    );

    if (!part) {
        throw new Error('Запчасть больше не найдена в исходном разделе.');
    }

    if (!source || !part) {
        throw new Error('Запчасть больше не найдена в исходном разделе.');
    }

    const target = state.catalogNodes.find(node =>
        node.brandSlug === source.brandSlug &&
        node.modelSlug === source.modelSlug &&
        node.category === targetCategory &&
        node.title.trim().toLowerCase() === targetTitle.toLowerCase()
    );

    if (target?.id === source.id) {
        throw new Error('Запчасть уже находится в этой подкатегории.');
    }

    const brandKey = part.brand.trim().toUpperCase();
    const articleKey = normalizeArticle(part.article);

    if (target?.items.some(item =>
        item.id === part.id ||
        (
            Boolean(articleKey) &&
            item.brand.trim().toUpperCase() === brandKey &&
            normalizeArticle(item.article) === articleKey
        )
    )) {
        throw new Error('В выбранной подкатегории уже есть эта запчасть.');
    }

    const updatedSource = withItems(
        source,
        source.items.filter(item => item.id !== partId)
    );

    const destination = target ?? {
        id: `node_${crypto.randomUUID()}`,
        brandSlug: source.brandSlug,
        modelSlug: source.modelSlug,
        category: targetCategory,
        title: targetTitle,
        items: [],
        compatibleModifications: [],
    };
    const updatedTarget = withItems(destination, [...destination.items, part]);

    const catalogNodes = state.catalogNodes.map(node => {
        if (node.id === source.id) return updatedSource;
        if (node.id === updatedTarget.id) return updatedTarget;
        return node;
    });

    if (!target) catalogNodes.push(updatedTarget);

    storage.saveState({ ...state, catalogNodes });
}