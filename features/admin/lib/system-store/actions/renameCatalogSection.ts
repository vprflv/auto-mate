import { getCatalogCategoryLabel, getCatalogCategoryKeys } from '../categoryLabels';
import { catalogBranchKey, catalogSubcategoryKey, getCatalogBranches } from '../catalogBranches';
import { getNodeFluidCategory } from '@/features/catalog/lib/fluidFillCapacities';
import { FLUID_CATALOG_CATEGORY } from '@/features/catalog/lib/catalogSections';
import { storage } from '../storage';

const nameKey = (value: string) => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ru');

export function renameCatalogSection(
    section: { category: string } | { nodeId: string; renameAssembly?: boolean },
    value: string
): void {
    const name = value.trim().replace(/\s+/g, ' ');
    if (!name) throw new Error('Введите название раздела.');

    const state = storage.getState();
    const branches = getCatalogBranches(state);
    if ('category' in section) {
        const categories = getCatalogCategoryKeys(branches);
        for (const category of categories) {
            if (
                category !== section.category &&
                nameKey(getCatalogCategoryLabel(category, state.catalogCategoryLabels)) === nameKey(name)
            ) {
                throw new Error('Категория с таким названием уже существует.');
            }
        }
        state.catalogCategoryLabels = { ...state.catalogCategoryLabels, [section.category]: name };
    } else {
        const node = state.catalogNodes.find(item => item.id === section.nodeId);
        if (!node) throw new Error('Подкатегория больше не найдена.');
        const { renameAssembly } = section;
        if (renameAssembly && !node.assembly) throw new Error('Узел больше не найден.');
        const key = renameAssembly ? catalogBranchKey : catalogSubcategoryKey;
        const ownKey = key(node);
        const patch = renameAssembly ? { assembly: name } : { title: name };
        const newKey = key({ ...node, ...patch });
        if (newKey !== ownKey && branches.some(item => key(item) === newKey)) {
            throw new Error(renameAssembly ? 'Узел с таким названием уже существует в этой подкатегории.' :
                'Подкатегория с таким названием уже существует.');
        }

        state.catalogBranches = branches.map(branch => key(branch) === ownKey ? { ...branch, ...patch } : branch);
        state.catalogNodes = state.catalogNodes.map(item => {
            if (key(item) !== ownKey) return item;
            const fluidCategory = !renameAssembly && item.category === FLUID_CATALOG_CATEGORY
                ? getNodeFluidCategory(item) : item.fluidCategory;
            return { ...item, ...patch, fluidCategory };
        });
    }
    storage.saveState(state);
}
