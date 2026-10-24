import { storage } from '../storage';

import type {
    CatalogModification
} from '../types';

export interface CreateModificationInput {
    brandSlug: string;
    modelSlug: string;
    name: string;
    attributes: CatalogModification['attributes'];
}

/** Убираем пустые значения и лишние пробелы. */
function cleanAttributes(
    attributes: CatalogModification['attributes']
): CatalogModification['attributes'] {
    const result: CatalogModification['attributes'] = {};

    for (const [key, value] of Object.entries(attributes)) {
        const cleanKey = key.trim();

        const cleanValue = value
            ?.trim()
            .replace(/\s+/g, ' ');

        if (cleanKey && cleanValue) {
            Object.defineProperty(result, cleanKey, {
                value: cleanValue,
                enumerable: true,
                writable: true,
                configurable: true
            });
        }
    }

    return result;
}

/** Ключ для сравнения характеристик независимо от порядка полей. */
function attributesKey(
    attributes: CatalogModification['attributes']
): string {
    const cleaned = cleanAttributes(attributes);

    return JSON.stringify(
        Object.keys(cleaned)
            .sort()
            .map(key => [
                key,
                cleaned[key]?.toLowerCase()
            ])
    );
}

export function createCatalogModification(
    input: CreateModificationInput
): CatalogModification {
    const state = storage.getState();

    const model = state.masterModels.find(
        item =>
            item.brandSlug === input.brandSlug &&
            item.modelSlug === input.modelSlug
    );

    if (!model) {
        throw new Error(
            'Модель автомобиля не найдена в каталоге.'
        );
    }

    const name = input.name
        .trim()
        .replace(/\s+/g, ' ');

    if (!name) {
        throw new Error(
            'Укажите название модификации.'
        );
    }

    const attributes = cleanAttributes(input.attributes);
    const existingModifications = model.modifications ?? [];

    const duplicate = existingModifications.some(
        item =>
            item.name.trim().replace(/\s+/g, ' ').toLowerCase() ===
            name.toLowerCase() &&
            attributesKey(item.attributes) ===
            attributesKey(attributes)
    );

    if (duplicate) {
        throw new Error(
            'Модификация с таким названием и характеристиками уже существует.'
        );
    }

    const modification: CatalogModification = {
        id: `mod_${crypto.randomUUID()}`,
        name,
        attributes,
        registeredCount: 0
    };

    storage.saveState({
        ...state,

        masterModels: state.masterModels.map(item =>
            item === model
                ? {
                    ...item,
                    modifications: [
                        ...existingModifications,
                        modification
                    ]
                }
                : item
        )
    });

    return modification;
}