import { getCatalogCategoryKeys, getCatalogCategoryLabel } from '../categoryLabels';
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

function movePartBetweenNodes(
    nodes: StoredCatalogNode[],
    { nodeId, partId, category, title }: MoveCatalogPartInput
): StoredCatalogNode[] {
    const targetCategory = category.trim();
    const targetTitle = title.trim();

    if (!targetCategory || !targetTitle) {
        throw new Error('Выберите категорию и подкатегорию.');
    }

    const source = nodes.find(node => node.id === nodeId);

    if (!source) {
        throw new Error('Исходный раздел больше не найден.');
    }

    const part = source.items.find(
        (item: StoredPartItem) => item.id === partId
    );

    if (!part) {
        throw new Error('Запчасть больше не найдена в исходном разделе.');
    }

    const target = nodes.find(node =>
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
        throw new Error(`В выбранной подкатегории уже есть деталь «${part.brand} ${part.article}».`);
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

    const catalogNodes = nodes.map(node => {
        if (node.id === source.id) return updatedSource;
        if (node.id === updatedTarget.id) return updatedTarget;
        return node;
    });

    if (!target) catalogNodes.push(updatedTarget);

    return catalogNodes;
}

export function moveCatalogPart(input: MoveCatalogPartInput): void {
    const state = storage.getState();
    const catalogNodes = movePartBetweenNodes(state.catalogNodes, input);
    storage.saveState({ ...state, catalogNodes });
}

export function moveCatalogCategoryParts(
    sourceCategory: string,
    parts: readonly Pick<MoveCatalogPartInput, 'nodeId' | 'partId'>[],
    destination: Pick<MoveCatalogPartInput, 'category' | 'title'>
): void {
    const state = storage.getState();
    const inputCategory = destination.category.trim();
    const keys = getCatalogCategoryKeys(
        state.catalogNodes.map(node => node.category).filter(Boolean),
        state.hiddenCatalogCategories
    );
    const category = keys.includes(inputCategory) ? inputCategory : keys.find(key =>
        getCatalogCategoryLabel(key, state.catalogCategoryLabels).toLocaleLowerCase('ru') ===
        inputCategory.toLocaleLowerCase('ru')
    ) ?? inputCategory;

    if (!parts.length) throw new Error('Выберите запчасти для переноса.');
    if (sourceCategory === category) throw new Error('Выберите другую категорию.');

    const sourceIds = new Set(state.catalogNodes
        .filter(node => node.category === sourceCategory)
        .map(node => node.id));
    let catalogNodes = state.catalogNodes;
    for (const part of parts) {
        if (!sourceIds.has(part.nodeId)) {
            throw new Error('Исходный раздел изменился. Откройте окно переноса заново.');
        }
        catalogNodes = movePartBetweenNodes(catalogNodes, { ...part, ...destination, category });
    }
    storage.saveState({ ...state, catalogNodes });
}

export function deleteEmptyCatalogCategory(category: string): void {
    const state = storage.getState();
    const keys = getCatalogCategoryKeys(
        state.catalogNodes.map(node => node.category).filter(Boolean),
        state.hiddenCatalogCategories
    );
    if (!keys.includes(category)) throw new Error('Категория больше не найдена.');
    if (state.catalogNodes.some(node => node.category === category && node.items.length > 0)) {
        throw new Error('Перед удалением перенесите все запчасти.');
    }

    const catalogCategoryLabels = { ...state.catalogCategoryLabels };
    delete catalogCategoryLabels[category];
    storage.saveState({
        ...state,
        catalogNodes: state.catalogNodes.filter(node => node.category !== category),
        catalogCategoryLabels,
        catalogCategoryOrder: state.catalogCategoryOrder?.filter(key => key !== category),
        hiddenCatalogCategories: [...new Set([...(state.hiddenCatalogCategories ?? []), category])],
    });
}