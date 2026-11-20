import { getCatalogCategoryLabel, defaultCatalogCategoryLabels } from '../categoryLabels';
import { storage } from '../storage';

const nameKey = (value: string) => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ru');

export function renameCatalogSection(
    section: { category: string } | { nodeId: string },
    value: string
): void {
    const name = value.trim().replace(/\s+/g, ' ');
    if (!name) throw new Error('Введите название раздела.');

    const state = storage.getState();
    if ('category' in section) {
        const categories = new Set([
            ...Object.keys(defaultCatalogCategoryLabels),
            ...state.catalogNodes.map(node => node.category),
        ]);
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
        const duplicate = state.catalogNodes.some(item =>
            item.id !== node.id &&
            item.brandSlug === node.brandSlug &&
            item.modelSlug === node.modelSlug &&
            item.category === node.category &&
            nameKey(item.title) === nameKey(name)
        );
        if (duplicate) throw new Error('Подкатегория с таким названием уже существует.');
        node.title = name;
    }
    storage.saveState(state);
}
