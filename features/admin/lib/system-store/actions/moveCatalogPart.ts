import { withCatalogNodeItems as withItems } from '../fluidAnalogFamily';
import { getCatalogCategoryKeys, getCatalogCategoryLabel } from '../categoryLabels';
import type { CatalogBranch } from '@/types';
import { getCatalogSection } from '@/features/catalog/lib/catalogSections';
import { catalogBranchKey, getCatalogBranches } from '../catalogBranches';
import { normalizeArticle } from '../normalizeArticle';
import { storage } from '../storage';
import type { StoredCatalogNode } from '../types';

type MoveCatalogPartInput = CatalogBranch & { nodeId: string; partId: string };

function movePartBetweenNodes(
    nodes: StoredCatalogNode[],
    { nodeId, partId, category, assembly, title }: MoveCatalogPartInput,
): StoredCatalogNode[] {
    const targetCategory = category.trim();
    const targetTitle = title.trim();
    const targetBranch = { category: targetCategory, assembly: assembly?.trim() || undefined, title: targetTitle };

    if (!targetCategory || !targetTitle) {
        throw new Error('Выберите категорию и подкатегорию.');
    }

    const source = nodes.find(node => node.id === nodeId);

    if (!source) {
        throw new Error('Исходный раздел больше не найден.');
    }

    const part = source.items.find(
        item => item.id === partId
    );

    if (!part) {
        throw new Error('Запчасть больше не найдена в исходном разделе.');
    }

    const target = nodes.find(node =>
        node.brandSlug === source.brandSlug &&
        node.modelSlug === source.modelSlug &&
        catalogBranchKey(node) === catalogBranchKey(targetBranch)
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

    const updatedSource = withItems(source, source.items.filter(item => item.id !== partId));

    const destination = target ?? {
        id: `node_${crypto.randomUUID()}`,
        brandSlug: source.brandSlug,
        modelSlug: source.modelSlug,
        ...targetBranch,
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

export function moveCatalogCategoryParts(
    sourceCategory: string,
    parts: readonly Pick<MoveCatalogPartInput, 'nodeId' | 'partId'>[],
    destination: CatalogBranch
): void {
    const state = storage.getState();
    const inputCategory = destination.category.trim();
    const keys = getCatalogCategoryKeys(
        getCatalogBranches(state),
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

export function moveCatalogBranchParts(
    source: CatalogBranch,
    parts: readonly Pick<MoveCatalogPartInput, 'nodeId' | 'partId'>[],
    destination: CatalogBranch,
): void {
    const state = storage.getState();
    const sourceKey = catalogBranchKey(source);
    const branches = getCatalogBranches(state);
    const target = branches.find(branch => catalogBranchKey(branch) === catalogBranchKey(destination)) ?? destination;
    if (sourceKey === catalogBranchKey(target)) throw new Error('Выберите другую подкатегорию.');
    const section = getCatalogSection(source.category);
    if (getCatalogSection(target.category.trim()) !== section) {
        throw new Error('Выберите подкатегорию в том же разделе каталога.');
    }
    const sourceNodes = state.catalogNodes.filter(node => catalogBranchKey(node) === sourceKey);
    const sourceIds = new Set(sourceNodes.map(node => node.id));
    if (!parts.length) throw new Error('Выберите позиции для переноса.');
    if (section === 'fluids') {
        const selected = new Set(parts.map(part => JSON.stringify([part.nodeId, part.partId])));
        if (sourceNodes.some(node => node.items.some(part => !selected.has(JSON.stringify([node.id, part.id]))))) {
            throw new Error('Перенесите все жидкости из подкатегории одним действием.');
        }
    }
    let catalogNodes = state.catalogNodes;
    for (const part of parts) {
        if (!sourceIds.has(part.nodeId)) throw new Error('Подкатегория изменилась. Проверьте список позиций.');
        catalogNodes = movePartBetweenNodes(catalogNodes, { ...part, ...target });
    }
    storage.saveState({ ...state, catalogNodes });
}

export function deleteEmptyCatalogBranch(branch: CatalogBranch): void {
    const state = storage.getState();
    const key = catalogBranchKey(branch);
    const branches = getCatalogBranches(state);
    if (!branches.some(item => catalogBranchKey(item) === key)) throw new Error('Подкатегория уже удалена.');
    if (state.catalogNodes.some(node => catalogBranchKey(node) === key && node.items.length > 0)) {
        throw new Error('Перед удалением перенесите все позиции из этой подкатегории.');
    }
    storage.saveState({
        ...state,
        catalogNodes: state.catalogNodes.filter(node => catalogBranchKey(node) !== key),
        catalogBranches: branches.filter(item => catalogBranchKey(item) !== key),
    });
}

export function deleteEmptyCatalogCategory(category: string): void {
    const state = storage.getState();
    const keys = getCatalogCategoryKeys(
        getCatalogBranches(state),
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
        catalogBranches: getCatalogBranches(state).filter(branch => branch.category !== category),
        catalogCategoryLabels,
        catalogCategoryOrder: state.catalogCategoryOrder?.filter(key => key !== category),
        hiddenCatalogCategories: [...new Set([...(state.hiddenCatalogCategories ?? []), category])],
    });
}