import {
    modificationValues,
    resolveCarCatalogIdentity,
} from '@/features/catalog/lib/carCatalogIdentity';
import { getGarageCars, saveGarageCars } from '@/features/garage/add/lib/storage';
import { uniqueInstallations } from '@/features/catalog/lib/partInstallations';
import { storage } from '../storage';
import type { CatalogModification, StoredMasterModel } from '../types';

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
    assertRequiredModificationAttributes(input.attributes);
    return saveCatalogModification(input);
}

export function assertRequiredModificationAttributes(
    attributes: CatalogModification['attributes']
): void {
    if (!attributes.fuel?.trim() || !attributes.bodyClass?.trim()) {
        throw new Error('Укажите тип топлива и тип кузова для новой модификации.');
    }
}

export function updateCatalogModification(
    input: UpdateModificationInput
): CatalogModification {
    return saveCatalogModification(input, input.modificationId);
}

export function getModificationPartLinks(
    model: Pick<StoredMasterModel, 'brandSlug' | 'modelSlug'>,
    modificationId: string,
    state = storage.getState()
) {
    return state.catalogNodes
        .filter(node => node.brandSlug === model.brandSlug && node.modelSlug === model.modelSlug)
        .flatMap(node => node.items
            .filter(part =>
                part.compatibleModifications?.includes(modificationId) ||
                Object.prototype.hasOwnProperty.call(part.installationsByModification ?? {}, modificationId)
            )
            .map(part => ({ node, part, key: JSON.stringify([node.id, part.id]) })));
}

export function deleteCatalogModification({
    brandSlug,
    modelSlug,
    modificationId,
    destinations,
}: Pick<UpdateModificationInput, 'brandSlug' | 'modelSlug' | 'modificationId'> & {
    destinations: ReadonlyMap<string, string | null>;
}): void {
    const state = storage.getState();
    const model = state.masterModels.find(
        item => item.brandSlug === brandSlug && item.modelSlug === modelSlug
    );
    const modifications = model?.modifications ?? [];

    if (!model || !modifications.some(item => item.id === modificationId)) {
        throw new Error('Модификация больше не найдена в каталоге.');
    }

    if (getGarageCars().some(car =>
        car.catalogBrandSlug === brandSlug &&
        car.catalogModelSlug === modelSlug &&
        car.catalogModificationId === modificationId
    )) {
        throw new Error('К модификации привязаны машины в гараже. Сначала измените их привязку.');
    }

    if (state.inbox.some(item => item.catalogModificationId === modificationId)) {
        throw new Error('На модификацию ссылаются заявки. Сначала обработайте их.');
    }

    const links = getModificationPartLinks(model, modificationId, state);
    if (links.some(({ key }) => !destinations.has(key))) {
        throw new Error('Выберите действие для каждой связанной запчасти.');
    }
    const validIds = new Set(modifications.filter(item => item.id !== modificationId).map(item => item.id));
    for (const { key } of links) {
        const destination = destinations.get(key);
        if (destination != null && !validIds.has(destination)) {
            throw new Error('Выбранная модификация больше не доступна.');
        }
    }

    for (const { part, key } of links) {
        const destination = destinations.get(key);
        const ids = (part.compatibleModifications ?? []).filter(id => id !== modificationId);
        if (destination && !ids.includes('all') && !ids.includes(destination)) {
            ids.push(destination);
        }
        part.compatibleModifications = ids;

        const scores = part.compatibilityScoresByModification;
        if (scores) {
            const score = scores[modificationId];
            if (destination && !ids.includes('all') && score !== undefined) {
                scores[destination] ??= score;
            }
            delete scores[modificationId];
        }

        const installations = part.installationsByModification;
        if (installations) {
            const positions = installations[modificationId];
            if (destination && positions?.length) {
                installations[destination] = uniqueInstallations([
                    ...(installations[destination] ?? []),
                    ...positions,
                ]);
            }
            delete installations[modificationId];
        }
    }

    for (const node of state.catalogNodes) {
        if (node.brandSlug !== brandSlug || node.modelSlug !== modelSlug) continue;

        const ids = new Set(node.items.flatMap(part => part.compatibleModifications ?? []));
        node.compatibleModifications = ids.has('all') ? ['all'] : [...ids];
    }

    model.modifications = modifications.filter(item => item.id !== modificationId);
    storage.saveState(state);
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

    const garageCars = existing ? getGarageCars() : [];
    const updatedCars = garageCars.map(car => {
        const identity = resolveCarCatalogIdentity(car, state.masterModels);
        if (identity?.model !== model || identity.modification.id !== existing?.id) {
            return car;
        }

        return {
            ...car,
            ...modificationValues(modification),
            modificationName: modification.name,
            updatedAt: new Date().toISOString(),
        };
    });

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

    if (updatedCars.some((car, index) => car !== garageCars[index])) {
        try {
            saveGarageCars(updatedCars);
        } catch (error) {
            storage.saveState(state);
            throw error;
        }
    }

    return modification;
}
