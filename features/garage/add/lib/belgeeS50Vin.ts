import type { StoredMasterModel } from '@/features/admin/lib/system-store/types';
import { formatTransmission } from './config/robotTransmission';
import { isValidVin, isValidVinPrefix, normalizeVin } from './config/vin';

export const BELGEE_S50_SHARED_PREFIX = 'Y4K8824Z';
const transmissions = ['Механика (5MT)', 'Автомат (6AT)'] as const;

export function isBelgeeS50Model(brand: string, model: string): boolean {
    return /^(belgee|белджи)$/iu.test(brand.trim()) && model.trim().toLowerCase() === 's50';
}

export function isGeelyEmgrandSs11Model(brand: string, model: string): boolean {
    const name = model.trim().toLowerCase().replace(/[()\s-]+/g, ' ').trim();
    return /^(geely|джили)$/iu.test(brand.trim()) && /^(emgrand|эмгранд)( (iv|4))?( ss11([ -]?a1)?)?$/.test(name);
}

export function isSharedSs11Model(brand: string, model: string): boolean {
    return isBelgeeS50Model(brand, model) || isGeelyEmgrandSs11Model(brand, model);
}

export function isBelgeeS50SharedVin(input: string): boolean {
    const vin = normalizeVin(input);
    return isValidVin(vin) && vin.startsWith(BELGEE_S50_SHARED_PREFIX);
}

export function isBelgeeS50SharedVinSample(input: string): boolean {
    const sample = normalizeVin(input);
    return sample === BELGEE_S50_SHARED_PREFIX || isBelgeeS50SharedVin(sample) ||
        (isValidVinPrefix(sample) && sample.startsWith(BELGEE_S50_SHARED_PREFIX));
}

export function getBelgeeS50TransmissionChoices(models: StoredMasterModel[]) {
    const matches = models.filter(model => model.verified && model.modelSlug === 's50' &&
        (model.brandSlug === 'belgee' || isBelgeeS50Model(model.brandName, model.modelSlug))
    ).flatMap(model => Array.isArray(model.modifications)
        ? model.modifications.map(modification => ({ model, modification }))
        : []);

    return transmissions.map(transmission => ({
        transmission,
        matches: matches.filter(({ modification }) => {
            const { displacementL, transmission: catalogTransmission } = modification.attributes ?? {};
            return (!displacementL?.trim() || Number(displacementL.trim().replace(',', '.')) === 1.5) &&
                formatTransmission(catalogTransmission) === transmission;
        }),
    }));
}

export function getGeelyEmgrandSs11VinMatches(models: StoredMasterModel[]) {
    return models.filter(model => model.verified && isGeelyEmgrandSs11Model(model.brandName, model.modelName))
        .flatMap(model => (model.modifications ?? []).filter(({ attributes }) => {
            const bodyCode = attributes?.bodyCode?.replace(/[\s-]/g, '').toUpperCase();
            const displacement = attributes?.displacementL?.trim();
            return (!bodyCode || /^SS11(?:A1)?$/.test(bodyCode)) &&
                (!displacement || Number(displacement.replace(',', '.')) === 1.5);
        }).map(modification => ({ model, modification })));
}
