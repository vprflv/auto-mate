import type { Car, CarCatalogPreference } from '@/types';
import type { CatalogModification, StoredMasterModel } from '@/features/admin/lib/system-store/types';
import { findCatalogFrameMatches, normalizeFrameNumber } from '@/features/garage/add/lib/catalogFrameRules';
import { findCatalogVinMatches, findCatalogVinSuggestions, type CatalogVinMatch } from '@/features/garage/add/lib/catalogVinRules';
import { normalizeVin } from '@/features/garage/add/lib/config/vin';
import { carReviewVersion, findCatalogModificationOptions, findMatchingCatalogModifications, matchesModificationField,
    matchesVehicleDetails, modificationFields, normalizeCode, resolveCarCatalogIdentity } from './carCatalogIdentity';

export function catalogPreferenceFor({ model, modification }: CatalogVinMatch): CarCatalogPreference {
    return { brandSlug: model.brandSlug, modelSlug: model.modelSlug, modificationId: modification.id };
}

export function catalogPreferenceKey(preference: CarCatalogPreference): string {
    return JSON.stringify([preference.brandSlug, preference.modelSlug, preference.modificationId]);
}

export function resolveCatalogPreference(preference: CarCatalogPreference | undefined, models: StoredMasterModel[]) {
    if (!preference) return undefined;
    const model = models.find(entry => entry.verified && entry.brandSlug === preference.brandSlug && entry.modelSlug === preference.modelSlug);
    const modification = model?.modifications?.find(entry => entry.id === preference.modificationId);
    return model && modification ? { model, modification } : undefined;
}

const sameChoice = (first: CatalogVinMatch, second: CatalogVinMatch) =>
    first.model === second.model && first.modification === second.modification;

function identifierCandidates(car: Car, models: StoredMasterModel[]) {
    const vin = findCatalogVinMatches(car.vin, models);
    const frame = car.frameNumber ? findCatalogFrameMatches(car.frameNumber, models) : [];
    return { vin, frame, specificFrame: frame.filter(match => !match.requiresConfirmation) };
}

export function getCatalogCandidates(car: Car, models: StoredMasterModel[]) {
    const { vin, frame, specificFrame } = identifierCandidates(car, models);
    const preferred = resolveCatalogPreference(car.catalogPreference, models);
    const stored = resolveCarCatalogIdentity(car, models);
    const matches = findMatchingCatalogModifications(car, models);
    const consistent = (candidate: CatalogVinMatch) => [vin, specificFrame].every(evidence =>
        evidence.length === 0 || evidence.some(match => sameChoice(candidate, match)));
    const auto = stored && consistent(stored) ? stored : matches.length === 1 && consistent(matches[0]) ? matches[0] : undefined;
    const confirmed = !car.catalogPreference ? auto : undefined;
    const options = new Map<string, CatalogVinMatch & { value: string }>();
    for (const match of [...vin, ...frame, ...matches, ...findCatalogModificationOptions(car, models)]) {
        const value = catalogPreferenceKey(catalogPreferenceFor(match));
        if (!options.has(value)) options.set(value, { ...match, value });
    }
    if (!options.size) {
        for (const match of findCatalogVinSuggestions(car.vin, models)) {
            const value = catalogPreferenceKey(catalogPreferenceFor(match));
            options.set(value, { ...match, value });
        }
    }
    return { preferred, confirmed, options: [...options.values()] };
}

const comparableLabels: Record<keyof typeof modificationFields, string> = {
    engine: 'Двигатель', transmission: 'КПП', driveType: 'Привод', trim: 'Комплектация',
    displacementL: 'Объём двигателя', fuel: 'Топливо', bodyClass: 'Тип кузова', facelift: 'Версия кузова',
};
const describe = (model: StoredMasterModel, modification: CatalogModification) =>
    [model.brandName, model.modelName, modification.name].join(' · ');

export function getCatalogChoiceDifferences(car: Car, choice: CatalogVinMatch, models: StoredMasterModel[]): string[] {
    const { model, modification } = choice;
    const differences: string[] = [];
    const attributes = modification.attributes;
    if ([car.make, car.model].join(' ').trim().toLowerCase() !== [model.brandName, model.modelName].join(' ').trim().toLowerCase()) {
        differences.push(`Марка и модель: ${car.make} ${car.model} → ${model.brandName} ${model.modelName}.`);
    }
    if (normalizeCode(car.bodyCode) && normalizeCode(attributes.bodyCode) && normalizeCode(car.bodyCode) !== normalizeCode(attributes.bodyCode)) {
        differences.push(`Код кузова: ${car.bodyCode} → ${attributes.bodyCode}.`);
    }
    if (!matchesVehicleDetails(modification, String(car.year), '')) {
        differences.push(`Год автомобиля: ${car.year}. Годы выпуска модификации: ${[...new Set([attributes.year, attributes.yearEnd].filter(Boolean))].join('–')}.`);
    }
    for (const field of Object.keys(modificationFields) as (keyof typeof modificationFields)[]) {
        const entered = car[field];
        const catalog = attributes[modificationFields[field]];
        if (entered && catalog && !matchesModificationField(field, entered, catalog)) {
            differences.push(`${comparableLabels[field]}: ${entered} → ${catalog}.`);
        }
    }
    const { vin, specificFrame } = identifierCandidates(car, models);
    for (const [label, matches] of [['VIN', vin], ['Frame', specificFrame]] as const) {
        if (matches.length && !matches.some(match => sameChoice(choice, match))) {
            differences.push(`По ${label} найдены другие карточки: ${matches.map(match => describe(match.model, match.modification)).join('; ')}.`);
        }
    }
    return differences;
}

export function catalogReviewVersion(car: Car): string {
    return JSON.stringify(['catalog-review-v2', carReviewVersion(car), normalizeVin(car.vin),
        normalizeFrameNumber(car.frameNumber ?? ''), car.cylinders, car.doors, car.plantCountry,
        car.catalogBrandSlug, car.catalogModelSlug, car.catalogModificationId,
        car.catalogPreference ? catalogPreferenceKey(car.catalogPreference) : null]);
}
