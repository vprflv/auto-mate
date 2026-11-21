import { getCatalogSection } from '@/features/catalog/lib/catalogSections';
import type { CatalogBranch } from '@/types';
import { fluidProductKey } from './fluidAnalogFamily';
import type { StoredCatalogNode, StoredPartItem } from './types';

export function catalogBranchKey(branch: CatalogBranch): string {
    return JSON.stringify([branch.category.trim(), branch.title.trim().toLocaleLowerCase('ru')]);
}

export function getCatalogPartPlacements(nodes: StoredCatalogNode[], source: StoredCatalogNode, part: StoredPartItem) {
    const key = fluidProductKey(part);
    const section = getCatalogSection(source.category);

    return nodes.flatMap(node => {
        if (node.brandSlug !== source.brandSlug || node.modelSlug !== source.modelSlug ||
            getCatalogSection(node.category) !== section) return [];

        const match = node.items.find(item => fluidProductKey(item) === key);
        return match ? [{ node, part: match }] : [];
    });
}

export function normalizeCatalogBranches(branches: CatalogBranch[]): CatalogBranch[] {
    const unique = new Map<string, CatalogBranch>();
    for (const branch of branches) {
        const category = branch.category.trim();
        const title = branch.title.trim();
        if (!category || !title) throw new Error('Укажите категорию и подкатегорию.');
        unique.set(catalogBranchKey({ category, title }), { category, title });
    }

    const result = [...unique.values()];
    if (result.length === 0) throw new Error('Выберите хотя бы одну ветку каталога.');
    if (result.some(branch => getCatalogSection(branch.category) !== getCatalogSection(result[0].category))) {
        throw new Error('Выберите ветки в пределах одного раздела каталога.');
    }
    return result;
}
