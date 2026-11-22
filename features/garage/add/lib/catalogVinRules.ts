import type { CatalogVinRule, StoredMasterModel } from '@/features/admin/lib/system-store/types';
import { isValidVin, isValidVinPrefix, normalizeVin, VIN_LENGTH } from './config/vin';

export function isValidCatalogVinRule(rule: CatalogVinRule): boolean {
    if (!rule || typeof rule.sample !== 'string' || !Array.isArray(rule.positions)) return false;
    const validPositions = rule.positions.every(position =>
        Number.isInteger(position) && position >= 0 && position < VIN_LENGTH
    );
    return validPositions && (isValidVinPrefix(rule.sample) ||
        (isValidVin(rule.sample) && rule.positions.length > 0));
}

export function findCatalogVinMatches(input: string, models: StoredMasterModel[]) {
    const vin = normalizeVin(input);
    if (!isValidVin(vin)) return [];

    return models.filter(model => model.verified).flatMap(model =>
        (Array.isArray(model.modifications) ? model.modifications : []).filter(modification =>
            Array.isArray(modification.vinRules) && modification.vinRules.some(rule => {
                if (!isValidCatalogVinRule(rule)) return false;
                const sample = normalizeVin(rule.sample);
                return isValidVinPrefix(sample)
                    ? vin.startsWith(sample)
                    : rule.positions.every(position => sample[position] === vin[position]);
            })
        ).map(modification => ({ model, modification }))
    );
}
