import { getCatalogSection } from '@/features/catalog/lib/catalogSections';
import type { CatalogBranch } from '@/types';
import { fluidProductKey } from './fluidAnalogFamily';
import type { StoredCatalogNode, StoredPartItem, SystemState } from './types';

const nameKey = (value?: string) => value?.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ru') ?? '';

export function catalogSubcategoryKey(branch: Pick<CatalogBranch, 'category' | 'title'>): string {
    return JSON.stringify([branch.category.trim(), branch.title.trim().toLocaleLowerCase('ru')]);
}

export function catalogBranchKey(branch: CatalogBranch): string {
    const category = branch.category.trim();
    const title = branch.title.trim().toLocaleLowerCase('ru');
    const assembly = nameKey(branch.assembly);
    return JSON.stringify(assembly ? [category, assembly, title] : [category, title]);
}

export function catalogBranchReference({ category, assembly, title }: CatalogBranch): CatalogBranch {
    return { category, assembly, title };
}

export function catalogBranchLabel(branch: CatalogBranch): string {
    return branch.assembly ? `${branch.title} → ${branch.assembly}` : branch.title;
}

export function getCatalogAssemblyNames(
    branches: readonly CatalogBranch[],
    parent: Pick<CatalogBranch, 'category' | 'title'>,
): string[] {
    const names = new Map<string, string>();
    for (const branch of branches) {
        if (branch.category === parent.category && nameKey(branch.title) === nameKey(parent.title) && branch.assembly?.trim()) {
            names.set(nameKey(branch.assembly), branch.assembly);
        }
    }
    return [...names.values()].sort((first, second) => first.localeCompare(second, 'ru'));
}

export function getCatalogBranches(state?: Pick<SystemState, 'catalogBranches' | 'catalogNodes'> | null): CatalogBranch[] {
    const branches = new Map<string, CatalogBranch>();

    for (const branch of [...(state?.catalogBranches ?? []), ...(state?.catalogNodes ?? [])]) {
        if (!branch.category.trim() || !branch.title.trim()) continue;
        const key = catalogBranchKey(branch);
        if (!branches.has(key)) branches.set(key, catalogBranchReference(branch));
    }

    return [...branches.values()];
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
        const path = { category, assembly: branch.assembly?.trim().replace(/\s+/g, ' ') || undefined, title };
        unique.set(catalogBranchKey(path), path);
    }

    const result = [...unique.values()];
    if (result.length === 0) throw new Error('Выберите хотя бы одну ветку каталога.');
    if (result.some(branch => getCatalogSection(branch.category) !== getCatalogSection(result[0].category))) {
        throw new Error('Выберите ветки в пределах одного раздела каталога.');
    }
    return result;
}
