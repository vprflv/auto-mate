import type { CatalogModification, StoredMasterModel } from '@/features/admin/lib/system-store/types';

type DecoderModel = Pick<StoredMasterModel, 'brandSlug' | 'brandName' | 'modelSlug' | 'modelName' | 'verified'> & {
    modifications: unknown[];
};
type DecoderModification = Pick<CatalogModification, 'id' | 'name' | 'attributes'>;

export function isCatalogRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isUsableCatalogModel(value: unknown): value is DecoderModel {
    return isCatalogRecord(value) && value.verified === true && Array.isArray(value.modifications) &&
        ['brandSlug', 'brandName', 'modelSlug', 'modelName'].every(field =>
            typeof value[field] === 'string' && value[field].trim().length > 0);
}

export function isUsableCatalogModification(value: unknown): value is DecoderModification {
    return isCatalogRecord(value) && typeof value.id === 'string' && value.id.trim().length > 0 &&
        typeof value.name === 'string' && isCatalogRecord(value.attributes) &&
        Object.values(value.attributes).every(attribute => typeof attribute === 'string' || attribute === undefined);
}
