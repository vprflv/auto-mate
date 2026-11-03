import type { Car } from '@/types';
import type { CatalogModification, StoredMasterModel } from '@/features/admin/lib/system-store/types';

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

export function modificationValues(modification: CatalogModification) {
    return Object.fromEntries(
        Object.entries(modificationFields).map(([field, attribute]) => [
            field, modification.attributes[attribute] ?? '',
        ])
    ) as Record<keyof typeof modificationFields, string>;
}

export function resolveCarCatalogIdentity(car: Car, models: StoredMasterModel[]) {
    // Только явный выбор. По названию и похожим характеристикам не угадываем.
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

    const values = modificationValues(modification);
    if (Object.keys(modificationFields).some(key => {
        const field = key as keyof typeof modificationFields;
        return normalize(car[field]) !== normalize(values[field]);
    })) return null;

    return { model, modification };
}

export function carReviewVersion(car: Car): string {
    return JSON.stringify([
        normalize(car.make), normalize(car.model), car.year,
        ...Object.keys(modificationFields).map(key =>
            normalize(car[key as keyof typeof modificationFields])
        ),
    ]);
}