import type { Car } from '@/types';
import type { CatalogModification, StoredMasterModel } from '@/features/admin/lib/system-store/types';
import { getConfirmedVinMatch } from '@/features/garage/add/lib/catalogVinRules';
import { formatTransmission, ROBOT_TRANSMISSION } from '@/features/garage/add/lib/config/robotTransmission';

import { knownFacelift, matchesFacelift } from './facelift';

export const modificationFields = {
    engine: 'engine',
    transmission: 'transmission',
    driveType: 'drivetrain',
    trim: 'trim',
    displacementL: 'displacementL',
    fuel: 'fuel',
    bodyClass: 'bodyClass',
    facelift: 'facelift',
} as const;

const normalize = (value?: string) =>
    (value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
export const normalizeCode = (value?: string) => (value ?? '').replace(/[\s-]/g, '').toUpperCase();

type IdentityField = keyof typeof modificationFields;
const identityFields = Object.keys(modificationFields) as IdentityField[];

function transmissionKey(value: string): string {
    const label = formatTransmission(value);
    return (label === 'Робот (DCT)' ? ROBOT_TRANSMISSION : label).toLowerCase();
}

export function matchesModificationField(field: IdentityField, input?: string, catalogValue?: string): boolean {
    if (field === 'facelift') return matchesFacelift(input, catalogValue);
    const entered = normalize(input);
    const stored = normalize(catalogValue);
    if (field === 'transmission') {
        return transmissionKey(entered) === transmissionKey(stored);
    }
    const decimal = /^\d+(?:[.,]\d+)?$/;
    if (field === 'displacementL' && decimal.test(entered) && decimal.test(stored)) {
        return Number(entered.replace(',', '.')) === Number(stored.replace(',', '.'));
    }
    return entered === stored;
}

function matchesIdentityFields(car: Pick<Car, IdentityField>, modification: CatalogModification): boolean {
    return identityFields.every(field => matchesModificationField(
        field, car[field], modification.attributes?.[modificationFields[field]]
    ));
}

export function matchesKnownModificationFields(car: Pick<Car, IdentityField>, modification: CatalogModification): boolean {
    return identityFields.every(field => {
        const entered = normalize(car[field]);
        return !entered || matchesModificationField(field, entered, modification.attributes?.[modificationFields[field]]);
    });
}

export function getCatalogProductionYears(modification: CatalogModification) {
    const parse = (year?: string) => /^[1-9]\d{3}$/.test(year?.trim() ?? '') ? Number(year) : undefined;
    const start = parse(modification.attributes?.year);
    const end = parse(modification.attributes?.yearEnd) ?? start;
    return { start, end };
}

function matchesProductionYear(year: number, modification: CatalogModification): boolean {
    const { start, end } = getCatalogProductionYears(modification);
    return start !== undefined && end !== undefined && year >= start && year <= end;
}

export function modificationValues(modification: Pick<CatalogModification, 'attributes'>, existingFacelift?: string) {
    return Object.fromEntries(
        Object.entries(modificationFields).map(([field, attribute]) => {
            const stored = modification.attributes[attribute];
            if (field === 'facelift') {
                const catalogFacelift = knownFacelift(stored);
                const enteredFacelift = knownFacelift(existingFacelift);
                return [field, catalogFacelift === 'facelift' && enteredFacelift?.startsWith('facelift_')
                    ? enteredFacelift : catalogFacelift ?? enteredFacelift ?? ''];
            }
            if (field === 'transmission') return [field, formatTransmission(stored)];
            return [field, stored ?? ''];
        })
    ) as Record<keyof typeof modificationFields, string>;
}

export function matchesVehicleDetails(
    modification: CatalogModification,
    year: string,
    bodyCode: string,
    { ignoreYear = false, modelYear, yearTolerance = 0 }: { ignoreYear?: boolean; modelYear?: number; yearTolerance?: number } = {}
) {
    const catalogCode = normalizeCode(modification.attributes?.bodyCode ?? '');
    const enteredCode = normalizeCode(bodyCode);
    if (enteredCode && catalogCode && catalogCode !== enteredCode) return false;

    const enteredYear = year.trim();
    if (ignoreYear || !/^\d{4}$/.test(enteredYear)) return true;

    const { start, end } = getCatalogProductionYears(modification);
    const withinYears = (year: number) => (start === undefined || year >= start) && (end === undefined || year <= end);
    const actualYear = Number(enteredYear);
    return ((start === undefined || actualYear >= start - yearTolerance) &&
        (end === undefined || actualYear <= end + yearTolerance)) || (modelYear !== undefined && withinYears(modelYear));
}

export function findVinMatchFacelift(
    model: StoredMasterModel,
    modification: CatalogModification,
    modelYear?: number,
): ReturnType<typeof knownFacelift> {
    const recorded = knownFacelift(modification.attributes?.facelift);
    if (recorded) return recorded;

    const bodyCode = normalizeCode(modification.attributes?.bodyCode);
    if (!bodyCode) return undefined;

    const years = getCatalogProductionYears(modification);
    const start = modelYear ?? years.start;
    const end = modelYear ?? years.end;
    if (start === undefined || end === undefined || end < start) return undefined;

    const applicable = (model.modifications ?? []).flatMap(candidate => {
        const version = knownFacelift(candidate.attributes?.facelift);
        if (!version || normalizeCode(candidate.attributes?.bodyCode) !== bodyCode) return [];
        const { start: first, end: last } = getCatalogProductionYears(candidate);
        if (first === undefined || last === undefined || last < first || first > end || last < start) return [];
        return [{ version, first, last }];
    });

    const versions = new Set(applicable.map(candidate => candidate.version));
    if (versions.size !== 1) return undefined;

    let nextYear = start;
    for (const { first, last } of applicable.sort((a, b) => a.first - b.first)) {
        if (first > nextYear) return undefined;
        nextYear = Math.max(nextYear, last + 1);
        if (nextYear > end) return applicable[0].version;
    }
    return undefined;
}

type MatchInput = Pick<Car, IdentityField |
    'make' | 'model' | 'year' | 'bodyCode' | 'catalogBrandSlug' | 'catalogModelSlug'>;

function findVerifiedModels(car: MatchInput, models: StoredMasterModel[]) {
    return models.filter(model =>
        model.verified &&
        normalize(model.brandName) === normalize(car.make) &&
        normalize(model.modelName) === normalize(car.model) &&
        (!car.catalogBrandSlug || model.brandSlug === car.catalogBrandSlug) &&
        (!car.catalogModelSlug || model.modelSlug === car.catalogModelSlug)
    );
}

export function findCatalogModificationOptions(car: Car, models: StoredMasterModel[]) {
    return findVerifiedModels(car, models).flatMap(model =>
        (Array.isArray(model.modifications) ? model.modifications : []).map(modification => ({
            model,
            modification,
            value: JSON.stringify([model.brandSlug, model.modelSlug, modification.id]),
        }))
    );
}

export function findMatchingCatalogModifications(
    car: MatchInput,
    models: StoredMasterModel[],
    { includeUnspecifiedBody = false } = {}
) {
    if (!normalize(car.engine)) return [];

    const bodyCode = normalizeCode(car.bodyCode);
    return findVerifiedModels(car, models).flatMap(model =>
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

    const ignoreYear = Boolean(car.catalogYearApproval) &&
        car.catalogYearApproval === carCatalogYearApprovalVersion(car);
    if (!matchesIdentityFields(car, modification)) return null;
    if (!matchesVehicleDetails(modification, String(car.year), car.bodyCode ?? '', { ignoreYear })) {
        const vinMatch = getConfirmedVinMatch(car.vin, models);
        if (vinMatch?.modification !== modification ||
            !matchesVehicleDetails(modification, String(car.year), car.bodyCode ?? '', { modelYear: vinMatch.modelYear })) return null;
    }

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

export function carCatalogYearApprovalVersion(car: Car): string {
    return JSON.stringify([
        car.id, car.catalogBrandSlug, car.catalogModelSlug, car.catalogModificationId,
        carReviewVersion(car),
    ]);
}

export function carReviewVersion(car: Car, legacy = false): string {
    const facelift = knownFacelift(car.facelift);
    return JSON.stringify([
        normalize(car.make), normalize(car.model), car.year,
        ...identityFields.filter(field => field !== 'facelift').map(field => normalize(car[field])),
        ...(legacy ? [] : [normalizeCode(car.bodyCode)]),
        ...(facelift ? [facelift] : []),
    ]);
}
