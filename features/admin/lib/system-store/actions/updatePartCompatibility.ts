import { storage } from '../storage';

import type { StoredPartItem } from '../types';

interface UpdatePartCompatibilityInput {
    nodeId: string;
    partId: string;
    modificationIds: string[];
}

export function updatePartCompatibility({
                                            nodeId,
                                            partId,
                                            modificationIds
                                        }: UpdatePartCompatibilityInput): StoredPartItem {
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

    const model = state.masterModels.find(
        item =>
            item.brandSlug === node.brandSlug &&
            item.modelSlug === node.modelSlug
    );

    if (!model) {
        throw new Error(
            'Модель автомобиля не найдена в каталоге.'
        );
    }

    const selectedIds = Array.from(
        new Set(
            modificationIds
                .map(id => id.trim())
                .filter(Boolean)
        )
    );

    const appliesToAll = selectedIds.includes('all');

    if (appliesToAll && selectedIds.length > 1) {
        throw new Error(
            'Выберите либо все модификации, либо конкретные.'
        );
    }

    const availableIds = new Set(
        (model.modifications ?? []).map(item => item.id)
    );

    if (
        !appliesToAll &&
        selectedIds.some(id => !availableIds.has(id))
    ) {
        throw new Error(
            'Некоторые модификации больше недоступны. Обновите карточку.'
        );
    }

    const updatedPart: StoredPartItem = {
        ...part,
        compatibleModifications: appliesToAll
            ? ['all']
            : selectedIds
    };

    const updatedItems = node.items.map(item =>
        item.id === partId ? updatedPart : item
    );

    const hasUniversalPart = updatedItems.some(
        item =>
            item.compatibleModifications?.includes('all')
    );

    const nodeModificationIds = hasUniversalPart
        ? ['all']
        : Array.from(
            new Set(
                updatedItems.flatMap(
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
                    items: updatedItems,
                    compatibleModifications: nodeModificationIds
                }
                : item
        )
    });

    return updatedPart;
}