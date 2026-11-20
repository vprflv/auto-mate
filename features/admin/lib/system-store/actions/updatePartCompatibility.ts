import { storage } from '../storage';

import type { StoredPartItem } from '../types';

export function addPartsToModification({
    brandSlug,
    modelSlug,
    modificationId,
    parts,
}: {
    brandSlug: string;
    modelSlug: string;
    modificationId: string;
    parts: readonly { nodeId: string; partId: string }[];
}): void {
    const state = storage.getState();
    const model = state.masterModels.find(item =>
        item.brandSlug === brandSlug && item.modelSlug === modelSlug
    );
    if (!model?.modifications?.some(item => item.id === modificationId)) {
        throw new Error('Модификация больше не найдена в каталоге.');
    }

    const selectedByNode = new Map<string, Set<string>>();
    for (const { nodeId, partId } of parts) {
        const selected = selectedByNode.get(nodeId) ?? new Set<string>();
        selected.add(partId);
        selectedByNode.set(nodeId, selected);
    }

    const catalogNodes = state.catalogNodes.map(node => {
        const selected = selectedByNode.get(node.id);
        if (!selected || node.brandSlug !== brandSlug || node.modelSlug !== modelSlug) return node;

        const items = node.items.map(part => {
            if (!selected.delete(part.id)) return part;
            const ids = part.compatibleModifications ?? [];
            if (ids.includes('all') || ids.includes(modificationId)) return part;
            return {
                ...part,
                compatibleModifications: [...ids, modificationId],
            };
        });
        if (selected.size === 0) selectedByNode.delete(node.id);

        const ids = new Set(items.flatMap(part => part.compatibleModifications ?? []));
        return { ...node, items, compatibleModifications: ids.has('all') ? ['all'] : [...ids] };
    });
    if (selectedByNode.size > 0) {
        throw new Error('Некоторые запчасти больше не найдены. Откройте подбор заново.');
    }
    storage.saveState({ ...state, catalogNodes });
}

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
            : selectedIds,
        ...(part.compatibilityScoresByModification ? {
            compatibilityScoresByModification: Object.fromEntries(
                Object.entries(part.compatibilityScoresByModification)
                    .filter(([id]) => !appliesToAll && selectedIds.includes(id))
            ),
        } : {}),
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
