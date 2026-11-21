import { FLUID_CATALOG_CATEGORY } from '@/features/catalog/lib/catalogSections';
import { normalizeArticle } from './normalizeArticle';
import { getOemCrosses } from './oemCrosses';
import type { StoredCatalogNode, StoredPartItem } from './types';

export function fluidProductKey(part: Pick<StoredPartItem, 'isOem' | 'brand' | 'article'>): string {
    return JSON.stringify([
        part.isOem,
        part.brand.trim().replace(/\s+/g, ' ').toLowerCase(),
        normalizeArticle(part.article),
    ]);
}

function referenceNumbers(part: StoredPartItem): string[] {
    return (part.isOem ? [part.article, ...getOemCrosses(part)] : getOemCrosses(part))
        .map(normalizeArticle)
        .filter(Boolean);
}

export function getFluidAnalogFamily(nodes: StoredCatalogNode[], node: StoredCatalogNode, part: StoredPartItem) {
    const seeds = referenceNumbers(part);
    const alone = { members: [part], linked: false, ambiguous: false };
    if (node.category !== FLUID_CATALOG_CATEGORY || part.fluidAnalogDetached || !seeds.length) return alone;

    const candidates = nodes
        .filter(item => item.category === node.category && item.brandSlug === node.brandSlug && item.modelSlug === node.modelSlug)
        .flatMap(item => item.items)
        .filter(item => item.isVerified === true && !item.fluidAnalogDetached);
    const originals = candidates.filter(item => item.isOem);
    const numbers = new Set([seeds[0]]);
    let size: number;
    do {
        size = numbers.size;
        for (const original of originals) {
            const refs = referenceNumbers(original);
            if (refs.some(ref => numbers.has(ref))) refs.forEach(ref => numbers.add(ref));
        }
    } while (numbers.size !== size);

    const related = candidates.filter(item => referenceNumbers(item).some(ref => numbers.has(ref)));
    const brandsByNumber = new Map<string, Set<string>>();
    for (const original of related.filter(item => item.isOem)) {
        const key = normalizeArticle(original.article);
        const identities = brandsByNumber.get(key) ?? new Set<string>();
        identities.add(fluidProductKey(original));
        brandsByNumber.set(key, identities);
    }

    return {
        members: [part, ...related.filter(item => item.id !== part.id)],
        linked: getOemCrosses(part).length > 0 || related.some(item => fluidProductKey(item) !== fluidProductKey(part)),
        ambiguous: seeds.some(ref => !numbers.has(ref)) ||
            related.some(item => referenceNumbers(item).some(ref => !numbers.has(ref))) ||
            [...brandsByNumber.values()].some(identities => identities.size > 1),
    };
}

export function withCatalogNodeItems(node: StoredCatalogNode, items: StoredPartItem[]): StoredCatalogNode {
    const ids = items.flatMap(item => item.compatibleModifications ?? []);
    return { ...node, items, compatibleModifications: ids.includes('all') ? ['all'] : [...new Set(ids)] };
}

export function planCompatibleFluidFamily(
    nodes: StoredCatalogNode[],
    node: StoredCatalogNode,
    part: StoredPartItem,
    modificationIds: string[],
) {
    const family = getFluidAnalogFamily(nodes, node, part);
    const byProduct = new Map<string, CompatibleFluid>();
    if (family.ambiguous) return { ambiguous: true, byProduct };

    const directKey = fluidProductKey(part);
    const excludedKeys = new Set(node.excludedFluidProducts ?? []);
    const existing = new Map(node.items.map(item => [fluidProductKey(item), item]));
    for (const member of family.members) {
        const key = fluidProductKey(member);
        if (key === directKey || excludedKeys.has(key) || existing.get(key)?.fluidAnalogDetached) continue;

        const proven = member.compatibleModifications ?? [];
        const compatible = modificationIds.includes('all')
            ? proven
            : modificationIds.filter(id => proven.includes('all') || proven.includes(id));
        if (!compatible.length) continue;

        const entry = byProduct.get(key) ?? { part: member, ids: new Set<string>() };
        compatible.forEach(id => entry.ids.add(id));
        byProduct.set(key, entry);
    }

    return { ambiguous: false, byProduct };
}

type CompatibleFluid = { part: StoredPartItem; ids: Set<string> };

function createFluidPlacement({ part, ids }: CompatibleFluid): StoredPartItem {
    return {
        ...part,
        id: `part_${crypto.randomUUID()}`,
        compatibleModifications: ids.has('all') ? ['all'] : [...ids],
        installationsCount: 0,
        installation: undefined,
        installationsByModification: undefined,
        compatibilityScoresByModification: undefined,
    };
}

export function addCompatibleFluidFamily(
    nodes: StoredCatalogNode[],
    node: StoredCatalogNode,
    part: StoredPartItem,
    modificationIds: string[],
    rejectAmbiguous = false,
): StoredCatalogNode {
    const { ambiguous, byProduct } = planCompatibleFluidFamily(nodes, node, part, modificationIds);
    if (ambiguous) {
        if (rejectAmbiguous) throw new Error('У жидкости пересекаются OEM-цепочки. Уточните связи перед добавлением аналогов.');
        return node;
    }

    const existing = new Set(node.items.map(fluidProductKey));
    const items = node.items.map(item => {
        const entry = byProduct.get(fluidProductKey(item));
        if (!entry) return item;

        const ids = [...new Set([...(item.compatibleModifications ?? []), ...entry.ids])];
        return { ...item, compatibleModifications: ids.includes('all') ? ['all'] : ids };
    });

    const analogs = [...byProduct].filter(([key]) => !existing.has(key)).map(([, entry]) => createFluidPlacement(entry));
    return withCatalogNodeItems(node, [...items, ...analogs]);
}

/** Добавляем недостающие размещения и сохраняем настройки уже размещённых жидкостей. */
export function fillFluidAnalogBranches(nodes: StoredCatalogNode[]): StoredCatalogNode[] {
    const nodesByModel = new Map<string, StoredCatalogNode[]>();
    const modelKey = (node: StoredCatalogNode) => JSON.stringify([node.brandSlug, node.modelSlug]);

    for (const node of nodes) {
        if (node.category !== FLUID_CATALOG_CATEGORY) continue;
        const key = modelKey(node);
        const branches = nodesByModel.get(key) ?? [];
        branches.push(node);
        nodesByModel.set(key, branches);
    }

    let changed = false;
    const updated = nodes.map(node => {
        if (node.category !== FLUID_CATALOG_CATEGORY || !node.items.length) return node;
        const candidates = nodesByModel.get(modelKey(node));
        if (!candidates || candidates.length < 2) return node;

        const existing = new Set(node.items.map(fluidProductKey));
        const additions = new Map<string, CompatibleFluid>();
        for (const part of node.items) {
            const ids = part.compatibleModifications ?? [];
            if (part.isVerified !== true || part.fluidAnalogDetached || !ids.length) continue;

            const { byProduct } = planCompatibleFluidFamily(candidates, node, part, ids);
            for (const [key, entry] of byProduct) {
                if (existing.has(key)) continue;
                const placement = additions.get(key) ?? { part: entry.part, ids: new Set<string>() };
                entry.ids.forEach(id => placement.ids.add(id));
                additions.set(key, placement);
            }
        }

        if (additions.size === 0) return node;
        changed = true;
        return withCatalogNodeItems(node, [...node.items, ...[...additions.values()].map(createFluidPlacement)]);
    });
    return changed ? updated : nodes;
}
