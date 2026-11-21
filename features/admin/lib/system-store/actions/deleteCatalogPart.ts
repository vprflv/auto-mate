import { fluidProductKey, getFluidAnalogFamily, withCatalogNodeItems } from '../fluidAnalogFamily';
import { storage } from '../storage';
import { FLUID_CATALOG_CATEGORY } from '@/features/catalog/lib/catalogSections';

interface DeleteCatalogPartInput {
    nodeId: string;
    partId: string;
    familyIds?: string[];
}

export function deleteCatalogPart({
                                      nodeId,
                                      partId,
                                      familyIds,
                                  }: DeleteCatalogPartInput): void {
    const state = storage.getState();

    const node = state.catalogNodes.find(
        item => item.id === nodeId
    );

    if (!node) {
        throw new Error('Узел каталога не найден.');
    }

    const part = node.items.find(
        item => item.id === partId
    );

    if (!part) {
        throw new Error('Запчасть не найдена.');
    }

    const family = getFluidAnalogFamily(state.catalogNodes, node, part);
    if (family.linked && !familyIds) {
        throw new Error('Сначала отвяжите жидкость от аналогов или удалите всю цепочку из ветки.');
    }
    if (familyIds && (family.ambiguous || node.category !== FLUID_CATALOG_CATEGORY)) {
        throw new Error('OEM-цепочки пересекаются. Уточните связи перед удалением группы.');
    }

    const memberIds = new Set(family.members.map(item => item.id));
    const localIds = node.items.filter(item => memberIds.has(item.id)).map(item => item.id);
    if (familyIds && (familyIds.length !== localIds.length || localIds.some(id => !familyIds.includes(id)))) {
        throw new Error('Состав цепочки изменился. Откройте подтверждение заново.');
    }

    const toRemove = new Set(familyIds ?? [part.id]);
    const remainingItems = node.items.filter(item => !toRemove.has(item.id));

    const updatedNode = withCatalogNodeItems(node, remainingItems);
    if (part.fluidAnalogDetached && !familyIds) {
        updatedNode.excludedFluidProducts = [...new Set([...(node.excludedFluidProducts ?? []), fluidProductKey(part)])];
    }

    storage.saveState({
        ...state,

        catalogNodes: state.catalogNodes.map(item =>
            item.id === nodeId
                ? updatedNode
                : item
        )
    });
}