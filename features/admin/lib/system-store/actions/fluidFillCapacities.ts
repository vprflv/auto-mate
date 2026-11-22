import { storage } from '../storage';
import { FLUID_CATALOG_CATEGORY } from '@/features/catalog/lib/catalogSections';
import { getNodeFillCapacity } from '@/features/catalog/lib/fluidFillCapacities';

export function saveFluidFillCapacity(
    nodeId: string,
    modificationId: string,
    value: string,
): void {
    const state = storage.getState();
    const node = state.catalogNodes.find(item => item.id === nodeId && item.category === FLUID_CATALOG_CATEGORY);
    if (!node) throw new Error('Подкатегория жидкостей больше не найдена.');

    const currentModel = state.masterModels.find(item =>
        item.brandSlug === node.brandSlug && item.modelSlug === node.modelSlug
    );
    const modifications = currentModel?.modifications ?? [];
    const modification = modifications.find(item => item.id === modificationId);
    if (!modification) throw new Error('Модификация больше не найдена.');

    const liters = value ? Number(value.replace(',', '.')) : null;
    if (liters !== null && (!/^\d+(?:[.,]\d{1,3})?$/.test(value) || !Number.isFinite(liters) || liters <= 0)) {
        throw new Error('Укажите объём больше нуля, до трёх знаков после запятой.');
    }

    const previousCapacities = node.fillCapacitiesByModification ?? Object.fromEntries(
        modifications.flatMap(item => {
            const liters = getNodeFillCapacity(node, item);
            return liters === undefined ? [] : [[item.id, liters] as const];
        })
    );
    const capacities = { ...previousCapacities };
    if (liters === null) delete capacities[modification.id];
    else capacities[modification.id] = liters;

    node.fillCapacitiesByModification = capacities;
    storage.saveState(state);
}
