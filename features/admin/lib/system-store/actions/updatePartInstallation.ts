import {normalizeInstallation, uniqueInstallations} from '@/features/catalog/lib/partInstallations';
import type { PartInstallation } from '@/types/partInstallation';
import { storage } from '../storage';

interface UpdatePartInstallationInput {
    nodeId: string;
    partId: string;
    modificationId: string;
    positions: PartInstallation[];
}

export function updatePartInstallation({
                                           nodeId,
                                           partId,
                                           modificationId,
                                           positions,
                                       }: UpdatePartInstallationInput): void {
    const state = storage.getState();
    const node = state.catalogNodes.find(item => item.id === nodeId);

    if (!node) {
        throw new Error('Раздел каталога больше не найден.');
    }

    const part = node.items.find(item => item.id === partId);

    if (!part) {
        throw new Error('Запчасть больше не найдена в этом разделе.');
    }

    const model = state.masterModels.find(item =>
        item.brandSlug === node.brandSlug &&
        item.modelSlug === node.modelSlug
    );

    const modifications = Array.isArray(model?.modifications)
        ? model.modifications
        : [];
    const compatibleIds = part.compatibleModifications ?? [];

    if (
        !modifications.some(item => item.id === modificationId) ||
        (!compatibleIds.includes('all') && !compatibleIds.includes(modificationId))
    ) {
        throw new Error('Выбранная модификация недоступна для этой запчасти.');
    }

    const nextPositions = uniqueInstallations(positions);
    const nextInstallations = { ...part.installationsByModification };

    if (nextPositions.length > 0) {
        nextInstallations[modificationId] = nextPositions;
    } else {
        delete nextInstallations[modificationId];
    }

    part.installationsByModification = nextInstallations;
    storage.saveState(state);
}

export function updateCommonPartInstallation({
                                                 nodeId,
                                                 partId,
                                                 position,
                                             }: {
    nodeId: string;
    partId: string;
    position: PartInstallation;
}): void {
    const state = storage.getState();
    const node = state.catalogNodes.find(item => item.id === nodeId);

    if (!node) {
        throw new Error('Раздел каталога больше не найден.');
    }

    const part = node.items.find(item => item.id === partId);

    if (!part) {
        throw new Error('Запчасть больше не найдена в этом разделе.');
    }

    part.installation = normalizeInstallation(position);
    delete part.installationsByModification;

    storage.saveState(state);
}