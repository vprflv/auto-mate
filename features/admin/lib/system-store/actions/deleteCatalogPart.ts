import { storage } from '../storage';

interface DeleteCatalogPartInput {
    nodeId: string;
    partId: string;
}

export function deleteCatalogPart({
                                      nodeId,
                                      partId
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

    const remainingItems = node.items.filter(
        item => item.id !== partId
    );

    // Обновляем сводную применимость узла.
    const hasUniversalPart = remainingItems.some(
        item =>
            item.compatibleModifications?.includes('all')
    );

    const compatibleModifications = hasUniversalPart
        ? ['all']
        : Array.from(
            new Set(
                remainingItems.flatMap(
                    item =>
                        item.compatibleModifications ?? []
                )
            )
        );

    storage.saveState({
        ...state,

        catalogNodes: state.catalogNodes.map(item =>
            item.id === nodeId
                ? {
                    ...item,
                    items: remainingItems,
                    compatibleModifications
                }
                : item
        )
    });
}