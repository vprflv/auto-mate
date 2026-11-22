import { FLUID_CATALOG_CATEGORY } from '@/features/catalog/lib/catalogSections';
import { storage } from '../storage';

export function setFluidBranchApplicability(nodeId: string, modificationIds: string[] | undefined): void {
    const state = storage.getState();
    const node = state.catalogNodes.find(item => item.id === nodeId && item.category === FLUID_CATALOG_CATEGORY);
    if (!node) throw new Error('Ветка жидкостей больше не найдена.');

    const model = state.masterModels.find(item => item.brandSlug === node.brandSlug && item.modelSlug === node.modelSlug);
    if (!model) throw new Error('Модель автомобиля больше не найдена.');

    const available = new Set((model.modifications ?? []).map(item => item.id));
    if (modificationIds?.some(id => !available.has(id))) {
        throw new Error('Список модификаций изменился. Проверьте отмеченные позиции.');
    }

    node.allowedModificationIds = modificationIds ? [...new Set(modificationIds)] : undefined;
    storage.saveState(state);
}
