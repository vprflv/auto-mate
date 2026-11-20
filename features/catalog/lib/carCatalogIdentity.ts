import type { Car } from '@/types';
import type { CatalogModification, StoredMasterModel } from '@/features/admin/lib/system-store/types';
import { normalizeRobotTransmission } from '@/features/garage/add/lib/config/robotTransmission';

export const modificationFields = {
    engine: 'engine',
    transmission: 'transmission',
    driveType: 'drivetrain',
    trim: 'trim',
    displacementL: 'displacementL',
    fuel: 'fuel',
    bodyClass: 'bodyClass',
} as const;

const normalize = (value?: string) =>
    (value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
export const normalizeCode = (value?: string) => (value ?? '').replace(/[\s-]/g, '').toUpperCase();

type IdentityField = keyof typeof modificationFields;
const identityFields = Object.keys(modificationFields) as IdentityField[];

function matchesIdentityFields(car: Pick<Car, IdentityField>, modification: CatalogModification): boolean {
    return identityFields.every(field => {
        const entered = normalize(car[field]);
        const stored = normalize(modification.attributes?.[modificationFields[field]]);
        if (field === 'transmission') {
            return normalizeRobotTransmission(entered) === normalizeRobotTransmission(stored);
        }
        const decimal = /^\d+(?:[.,]\d+)?$/;
        if (field === 'displacementL' && decimal.test(entered) && decimal.test(stored)) {
            return Number(entered.replace(',', '.')) === Number(stored.replace(',', '.'));
        }
        return entered === stored;
    });
}

function matchesProductionYear(year: number, modification: CatalogModification): boolean {
    const start = modification.attributes?.year?.trim() ?? '';
    const end = modification.attributes?.yearEnd?.trim() || start;
    return /^\d{4}$/.test(start) && /^\d{4}$/.test(end) &&
        year >= Number(start) && year <= Number(end);
}

export function modificationValues(modification: CatalogModification) {
    return Object.fromEntries(
        Object.entries(modificationFields).map(([field, attribute]) => [
            field, modification.attributes[attribute] ?? '',
        ])
    ) as Record<keyof typeof modificationFields, string>;
}

export function matchesVehicleDetails(modification: CatalogModification, year: string, bodyCode: string) {
    const catalogCode = normalizeCode(modification.attributes?.bodyCode ?? '');
    const enteredCode = normalizeCode(bodyCode);
    if (enteredCode && catalogCode && catalogCode !== enteredCode) return false;

    const enteredYear = year.trim();
    if (!/^\d{4}$/.test(enteredYear)) return true;

    const start = modification.attributes?.year?.trim();
    const end = modification.attributes?.yearEnd?.trim();
    return (!start || !/^\d{4}$/.test(start) || Number(enteredYear) >= Number(start)) &&
        (!end || !/^\d{4}$/.test(end) || Number(enteredYear) <= Number(end));
}

type MatchInput = Pick<Car, IdentityField |
    'make' | 'model' | 'year' | 'bodyCode' | 'catalogBrandSlug' | 'catalogModelSlug'>;

export function findMatchingCatalogModifications(
    car: MatchInput,
    models: StoredMasterModel[],
    { includeUnspecifiedBody = false } = {}
) {
    if (!normalize(car.engine)) return [];

    const matchingModels = models.filter(model =>
        model.verified &&
        normalize(model.brandName) === normalize(car.make) &&
        normalize(model.modelName) === normalize(car.model) &&
        (!car.catalogBrandSlug || model.brandSlug === car.catalogBrandSlug) &&
        (!car.catalogModelSlug || model.modelSlug === car.catalogModelSlug)
    );
    const bodyCode = normalizeCode(car.bodyCode);
    return matchingModels.flatMap(model =>
        (Array.isArray(model.modifications) ? model.modifications : [])
            .filter(candidate =>
                matchesProductionYear(car.year, candidate) &&
                ((!bodyCode && includeUnspecifiedBody) ||
                    bodyCode === normalizeCode(candidate.attributes?.bodyCode)) &&
                matchesIdentityFields(car, candidate)
            )
            .map(modification => ({ model, modification }))
    );
}

export function linkMatchingCatalogModification(car: Car, models: StoredMasterModel[]): Car {
    const matches = findMatchingCatalogModifications(car, models);
    if (car.catalogModificationId) {
        if (matches.some(({ modification }) => modification.id === car.catalogModificationId)) return car;
        car = { ...car, catalogModificationId: undefined, modificationName: undefined };
    }
    if (matches.length !== 1) return car;

    const { model, modification } = matches[0];
    return {
        ...car,
        catalogBrandSlug: model.brandSlug,
        catalogModelSlug: model.modelSlug,
        catalogModificationId: modification.id,
        modificationName: modification.name,
    };
}

export function resolveCarCatalogIdentity(car: Car, models: StoredMasterModel[]) {
    // Проверяем привязку, сохранённую при выборе или точном совпадении.
    const model = models.find(item =>
        item.verified &&
        item.brandSlug === car.catalogBrandSlug &&
        item.modelSlug === car.catalogModelSlug &&
        normalize(item.brandName) === normalize(car.make) &&
        normalize(item.modelName) === normalize(car.model)
    );
    const modifications = Array.isArray(model?.modifications)
        ? model.modifications
        : [];

    const modification = modifications.find(
        item => item.id === car.catalogModificationId
    );
    if (!model || !modification) return null;

    if (!matchesIdentityFields(car, modification) ||
        !matchesVehicleDetails(modification, String(car.year), car.bodyCode ?? '')) return null;

    return { model, modification };
}

export function refreshCatalogRegistrationCounts(models: StoredMasterModel[], cars: readonly Car[]): void {
    for (const model of models) {
        model.registeredCount = 0;
        if (!Array.isArray(model.modifications)) continue;
        for (const modification of model.modifications) modification.registeredCount = 0;
    }

    const counted = new Set<string>();
    for (const car of cars) {
        if (!car?.id || !car.catalogModificationId || counted.has(car.id)) continue;
        const identity = resolveCarCatalogIdentity(car, models);
        if (!identity) continue;

        counted.add(car.id);
        identity.model.registeredCount += 1;
        identity.modification.registeredCount += 1;
    }
}

export function carReviewVersion(car: Car, legacy = false): string {
    return JSON.stringify([
        normalize(car.make), normalize(car.model), car.year,
        ...Object.keys(modificationFields).map(key =>
            normalize(car[key as keyof typeof modificationFields])
        ),
        ...(legacy ? [] : [normalizeCode(car.bodyCode)]),
    ]);
}
