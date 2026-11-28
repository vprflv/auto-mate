import { getGarageCars } from '@/features/garage/add/lib/storage';
import { storage } from '../storage';
import type { StoredMasterModel, SystemState } from '../types';
import { normalizeSlug } from '../utils';

type ModelKey = Pick<StoredMasterModel, 'brandSlug' | 'modelSlug'>;

function getDeletionScope(state: SystemState, { brandSlug, modelSlug }: ModelKey) {
    const belongsToModel = (item: ModelKey) => item.brandSlug === brandSlug && item.modelSlug === modelSlug;
    const models = state.masterModels.filter(belongsToModel);
    const [model] = models;
    if (!model) throw new Error('Модель больше не найдена в каталоге.');
    if (models.length > 1) throw new Error('У нескольких карточек одинаковый адрес. Удаление невозможно, пока их нельзя различить.');

    const nodes = state.catalogNodes.filter(belongsToModel);
    const modifications = model.modifications ?? [];
    return {
        model,
        belongsToModel,
        modifications,
        counts: {
            modifications: modifications.length,
            sections: nodes.length,
            items: nodes.reduce((total, node) => total + node.items.length, 0),
            vinRules: modifications.reduce((total, item) => total + (item.vinRules?.length ?? 0) + (item.vinExceptions?.length ?? 0), 0),
        },
    };
}

export function getCatalogModelDeletionCounts(target: ModelKey) {
    return getDeletionScope(storage.getState(), target).counts;
}

export function deleteCatalogModel(target: ModelKey, confirmed: ReturnType<typeof getCatalogModelDeletionCounts>): void {
    const state = storage.getState();
    const { model, belongsToModel, modifications, counts } = getDeletionScope(state, target);

    if (Object.entries(counts).some(([key, count]) => confirmed[key as keyof typeof counts] !== count)) {
        throw new Error('Состав карточки изменился. Откройте подтверждение заново.');
    }

    if (getGarageCars().some(car => car.catalogBrandSlug === model.brandSlug &&
        car.catalogModelSlug === model.modelSlug && Boolean(car.catalogModificationId))) {
        throw new Error('К модели привязаны машины в гараже. Сначала измените их привязку.');
    }

    const modificationIds = new Set(modifications.map(modification => modification.id));
    if (state.inbox.some(item =>
        (normalizeSlug(item.carBrand) === model.brandSlug || normalizeSlug(item.carBrand) === normalizeSlug(model.brandName)) &&
        (normalizeSlug(item.carModel) === model.modelSlug || normalizeSlug(item.carModel) === normalizeSlug(model.modelName)) &&
        [item.catalogModificationId, item.proposedModificationId, item.vinMismatch?.selectedModificationId]
            .some(id => id !== undefined && modificationIds.has(id))
    )) {
        throw new Error('К модификациям модели привязаны заявки. Сначала обработайте их.');
    }

    storage.saveState({
        ...state,
        masterModels: state.masterModels.filter(item => item !== model),
        catalogNodes: state.catalogNodes.filter(item => !belongsToModel(item)),
    });
}
