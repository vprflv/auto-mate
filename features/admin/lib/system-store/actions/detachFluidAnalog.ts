import { FLUID_CATALOG_CATEGORY } from '@/features/catalog/lib/catalogSections';
import { storage } from '../storage';

export function detachFluidAnalog(nodeId: string, partId: string): void {
    const state = storage.getState();
    const node = state.catalogNodes.find(item => item.id === nodeId && item.category === FLUID_CATALOG_CATEGORY);
    const part = node?.items.find(item => item.id === partId);
    if (!part) throw new Error('Жидкость больше не найдена в этой ветке.');

    part.fluidAnalogDetached = true;
    part.oemCrosses = [];
    part.oemCross = '';
    storage.saveState(state);
}
