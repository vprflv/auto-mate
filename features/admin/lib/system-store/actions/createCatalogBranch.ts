import type { CatalogBranch } from '@/types';
import type { CatalogSection } from '@/types/catalog/catalog';
import { getCatalogSection } from '@/features/catalog/lib/catalogSections';
import { catalogBranchKey, getCatalogBranches } from '../catalogBranches';
import { getCatalogCategoryLabel } from '../categoryLabels';
import { storage } from '../storage';
import type { SystemState } from '../types';

const cleanName = (value: string) => value.trim().replace(/\s+/g, ' ');
const nameKey = (value: string) => cleanName(value).toLocaleLowerCase('ru');

export function resolveCatalogBranch(state: SystemState, section: CatalogSection, branch: CatalogBranch): CatalogBranch {
    const inputCategory = cleanName(branch.category);
    const title = cleanName(branch.title);
    if (!inputCategory || !title) throw new Error('Укажите категорию и подкатегорию.');

    const branches = getCatalogBranches(state);
    const categoryKey = nameKey(inputCategory);
    const category = branches.find(item => item.category === inputCategory)?.category ??
        branches.find(item => getCatalogSection(item.category) === section &&
            nameKey(getCatalogCategoryLabel(item.category, state.catalogCategoryLabels)) === categoryKey
        )?.category ?? inputCategory;

    if (getCatalogSection(category) !== section) throw new Error('Выберите категорию в текущем разделе каталога.');
    const inputAssembly = cleanName(branch.assembly ?? '') || undefined;
    const siblings = branches.filter(item => item.category === category && nameKey(item.title) === nameKey(title));
    const existing = siblings.find(item => nameKey(item.assembly ?? '') === nameKey(inputAssembly ?? ''));
    return existing ?? { category, title: siblings[0]?.title ?? title, assembly: inputAssembly };
}

export function createCatalogBranch(section: CatalogSection, branch: CatalogBranch): CatalogBranch {
    const state = storage.getState();
    const saved = resolveCatalogBranch(state, section, branch);
    const branches = getCatalogBranches(state);
    const existing = branches.some(item => catalogBranchKey(item) === catalogBranchKey(saved));
    const category = saved.category;
    const hidden = state.hiddenCatalogCategories;
    if (!existing || hidden?.includes(category)) {
        storage.saveState({
            ...state,
            catalogBranches: existing ? branches : [...branches, saved],
            hiddenCatalogCategories: hidden?.filter(key => key !== category),
        });
    }
    return saved;
}
