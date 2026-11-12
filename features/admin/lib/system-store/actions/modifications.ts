import { storage } from '../storage';
import type { CatalogModification } from '../types';

export interface CreateModificationInput {
    brandSlug: string;
    modelSlug: string;
    name: string;
    attributes: CatalogModification['attributes'];
}

export interface UpdateModificationInput extends CreateModificationInput {
    modificationId: string;
}

function cleanAttributes(
    attributes: CatalogModification['attributes']
): CatalogModification['attributes'] {
    const result: CatalogModification['attributes'] = {};

    for (const [key, value] of Object.entries(attributes)) {
        const cleanKey = key.trim();
        const cleanValue = value?.trim().replace(/\s+/g, ' ');

        if (cleanKey && cleanValue) {
            Object.defineProperty(result, cleanKey, {
                value: cleanValue,
                enumerable: true,
                writable: true,
                configurable: true,
            });
        }
    }

    return result;
}

function attributesKey(
    attributes: CatalogModification['attributes']
): string {
    const cleaned = cleanAttributes(attributes);

    return JSON.stringify(
        Object.keys(cleaned)
            .sort()
            .map(key => [key, cleaned[key]?.toLowerCase()])
    );
}

export function createCatalogModification(
    input: CreateModificationInput
): CatalogModification {
    return saveCatalogModification(input);
}

export function updateCatalogModification(
    input: UpdateModificationInput
): CatalogModification {
    return saveCatalogModification(input, input.modificationId);
}

function saveCatalogModification(
    input: CreateModificationInput,
    modificationId?: string
): CatalogModification {
    const state = storage.getState();

    const model = state.masterModels.find(
        item =>
            item.brandSlug === input.brandSlug &&
            item.modelSlug === input.modelSlug
    );

    if (!model) {
        throw new Error('Модель автомобиля не найдена в каталоге.');
    }

    const name = input.name.trim().replace(/\s+/g, ' ');

    if (!name) {
        throw new Error('Укажите название модификации.');
    }

    const attributes = cleanAttributes(input.attributes);
    const modifications = model.modifications ?? [];
    const existing =
        modificationId === undefined
            ? undefined
            : modifications.find(item => item.id === modificationId);

    if (modificationId !== undefined && !existing) {
        throw new Error('Модификация не найдена в каталоге.');
    }

    const nameKey = name.toLowerCase();
    const inputAttributesKey = attributesKey(attributes);

    const duplicate = modifications.some(
        item =>
            item.id !== existing?.id &&
            item.name.trim().replace(/\s+/g, ' ').toLowerCase() === nameKey &&
            attributesKey(item.attributes) === inputAttributesKey
    );

    if (duplicate) {
        throw new Error(
            'Модификация с таким названием и характеристиками уже существует.'
        );
    }

    const modification: CatalogModification = existing
        ? { ...existing, name, attributes }
        : {
            id: `mod_${crypto.randomUUID()}`,
            name,
            attributes,
            registeredCount: 0,
        };

    storage.saveState({
        ...state,
        masterModels: state.masterModels.map(item =>
            item === model
                ? {
                    ...item,
                    modifications: existing
                        ? modifications.map(current =>
                            current.id === existing.id ? modification : current
                        )
                        : [...modifications, modification],
                }
                : item
        ),
    });

    return modification;
}