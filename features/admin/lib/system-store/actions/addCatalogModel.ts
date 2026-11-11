import { storage } from '../storage';
import type { StoredMasterModel } from '../types';
import { normalizeSlug } from '../utils';

type AddCatalogModelInput = {
    brandName: string;
    modelName: string;
    years: string;
};

export function addCatalogModel(
    input: AddCatalogModelInput
): StoredMasterModel {
    const brandName = input.brandName.trim();
    const modelName = input.modelName.trim();
    const years = input.years.trim();

    const brandSlug = normalizeSlug(brandName);
    const modelSlug = normalizeSlug(modelName);

    if (!brandSlug || !modelSlug || !years) {
        throw new Error('Укажите марку, модель и годы выпуска.');
    }

    const state = storage.getState();
    const alreadyExists = state.masterModels.some(model =>
        model.brandSlug === brandSlug &&
        model.modelSlug === modelSlug
    );

    if (alreadyExists) {
        throw new Error(`Модель «${brandName} ${modelName}» уже есть в каталоге.`);
    }

    const model: StoredMasterModel = {
        brandSlug,
        brandName,
        modelSlug,
        modelName,
        years,
        verified: true,
        registeredCount: 0,
        modifications: [],
    };

    storage.saveState({
        ...state,
        masterModels: [...state.masterModels, model],
    });

    return model;
}