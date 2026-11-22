import type { CatalogBranch } from '@/types';
import { getCatalogSection } from '@/features/catalog/lib/catalogSections';
import { catalogBranchKey, getCatalogPartPlacements, normalizeCatalogBranches } from '../catalogBranches';
import { addCompatibleFluidFamily, fluidProductKey, getFluidAnalogFamily, withCatalogNodeItems } from '../fluidAnalogFamily';
import { normalizeArticle } from '../normalizeArticle';
import { storage } from '../storage';
import type { StoredCatalogNode } from '../types';

export function setCatalogPartBranches(
    nodeId: string,
    partId: string,
    branches: CatalogBranch[],
    previousBranchKeys: string[],
): void {
    const state = storage.getState();
    const source = state.catalogNodes.find(node => node.id === nodeId);
    const part = source?.items.find(item => item.id === partId);
    if (!source || !part) throw new Error('Позиция больше не найдена в каталоге.');

    const section = getCatalogSection(source.category);
    const selected = normalizeCatalogBranches(branches);
    if (selected.some(branch => getCatalogSection(branch.category) !== section)) {
        throw new Error('Выберите ветки в пределах текущего раздела каталога.');
    }

    const existing = getCatalogPartPlacements(state.catalogNodes, source, part);
    const existingKeys = new Set(existing.map(({ node }) => catalogBranchKey(node)));
    if (existingKeys.size !== previousBranchKeys.length || previousBranchKeys.some(key => !existingKeys.has(key))) {
        throw new Error('Ветки позиции изменились. Откройте карточку заново.');
    }
    const selectedKeys = new Set(selected.map(catalogBranchKey));
    const nodes = new Map(state.catalogNodes.map(node => [node.id, node]));
    const isFluid = section === 'fluids';

    for (const branch of selected) {
        const key = catalogBranchKey(branch);
        if (existingKeys.has(key)) continue;

        const target = state.catalogNodes.find(node => node.brandSlug === source.brandSlug &&
            node.modelSlug === source.modelSlug && catalogBranchKey(node) === key);
        if (target?.items.some(item => item.brand.trim().toLowerCase() === part.brand.trim().toLowerCase() &&
            normalizeArticle(item.article) === normalizeArticle(part.article))) {
            throw new Error(`В ветке «${branch.title}» уже есть этот артикул с другим статусом OEM.`);
        }

        const destination: StoredCatalogNode = target ?? {
            ...branch,
            id: `node_${crypto.randomUUID()}`,
            brandSlug: source.brandSlug,
            modelSlug: source.modelSlug,
            compatibleModifications: [],
            items: [],
        };
        const placement = { ...part, id: `part_${crypto.randomUUID()}`, installationsCount: 0 };
        let updated = withCatalogNodeItems(destination, [...destination.items, placement]);
        if (isFluid) {
            updated.excludedFluidProducts = updated.excludedFluidProducts?.filter(key => key !== fluidProductKey(part));
            updated = addCompatibleFluidFamily(state.catalogNodes, updated, placement, placement.compatibleModifications ?? [], true);
        }
        nodes.set(updated.id, updated);
    }

    for (const { node, part: current } of existing) {
        if (selectedKeys.has(catalogBranchKey(node))) continue;

        const family = getFluidAnalogFamily(state.catalogNodes, node, current);
        if (family.ambiguous) {
            throw new Error(`В ветке «${node.title}» пересекаются OEM-цепочки. Сначала уточните связи или отвяжите жидкость.`);
        }
        const removedIds = new Set(family.members.map(item => item.id));
        const updated = withCatalogNodeItems(node, node.items.filter(item => !removedIds.has(item.id)));
        if (current.fluidAnalogDetached) {
            updated.excludedFluidProducts = [...new Set([...(node.excludedFluidProducts ?? []), fluidProductKey(current)])];
        }
        nodes.set(updated.id, updated);
    }

    storage.saveState({
        ...state,
        catalogNodes: [...nodes.values()],
        hiddenCatalogCategories: state.hiddenCatalogCategories?.filter(key => !selected.some(branch => branch.category === key)),
    });
}
