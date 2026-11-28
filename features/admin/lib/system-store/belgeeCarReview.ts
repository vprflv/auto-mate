import type { Car } from '@/types';
import { catalogReviewVersion } from '@/features/catalog/lib/catalogVehicleSelection';
import { carReviewVersion, resolveCarCatalogIdentity } from '@/features/catalog/lib/carCatalogIdentity';
import { isBelgeeS50SharedVin, isGeelyEmgrandSs11Model, isSharedSs11Model } from '@/features/garage/add/lib/belgeeS50Vin';
import { findCatalogVinMatches } from '@/features/garage/add/lib/catalogVinRules';
import { formatTransmission } from '@/features/garage/add/lib/config/robotTransmission';
import { normalizeVin } from '@/features/garage/add/lib/config/vin';
import type { InboxItem, StoredMasterModel } from './types';

export function getSharedSs11CarReviewVin(item: InboxItem): string | undefined {
    if (item.type !== 'car_model' || !isSharedSs11Model(item.carBrand, item.carModel)) return undefined;
    const rawVin = item.carVin || item.carSpecs?.vin;
    if (typeof rawVin !== 'string') return undefined;
    const vin = normalizeVin(rawVin);
    return isBelgeeS50SharedVin(vin) ? vin : undefined;
}

export function reconcileSharedSs11CarReviews(inbox: InboxItem[], models: StoredMasterModel[], cars: readonly Car[]): InboxItem[] {
    let changed = false;
    const reviews = inbox.flatMap(item => {
        const vin = getSharedSs11CarReviewVin(item);
        const mismatch = item.vinMismatch;
        const versions = Object.entries(item.garageCarVersions ?? {});
        if (!vin || (!mismatch && !(item.vinTraining && versions.length))) return [item];

        if (mismatch) {
            const matches = findCatalogVinMatches(vin, models);
            const selectedId = mismatch.selectedModificationId ?? item.proposedModificationId;
            const selectedGeely = isGeelyEmgrandSs11Model(item.carBrand, item.carModel);
            const selectedMatches = matches.some(({ model, modification }) =>
                isSharedSs11Model(model.brandName, model.modelName) &&
                isGeelyEmgrandSs11Model(model.brandName, model.modelName) === selectedGeely &&
                (selectedId ? modification.id === selectedId : modification.name === mismatch.selected.name)
            );
            if (matches.length && !selectedMatches) {
                const confirmedMatches = matches.map(({ model, modification }) => ({
                    name: `${model.brandName} ${model.modelName} · ${modification.name}`,
                    transmission: formatTransmission(modification.attributes?.transmission) || undefined,
                }));
                if (JSON.stringify(confirmedMatches) === JSON.stringify(mismatch.matches)) return [item];
                changed = true;
                return [{ ...item, vinMismatch: { ...mismatch, matches: confirmedMatches } }];
            }

            if (mismatch.catalogOpen && versions.length === 1 && cars.some(car =>
                car.id === versions[0][0] && normalizeVin(car.vin) === vin &&
                (catalogReviewVersion(car) === versions[0][1] || carReviewVersion(car) === versions[0][1]) && resolveCarCatalogIdentity(car, models)
            )) {
                changed = true;
                return [];
            }
        }

        changed = true;
        return [{ ...item, vinMismatch: undefined, vinTraining: undefined,
            note: 'Сверьте модель, коробку передач и остальные характеристики автомобиля.' }];
    });
    return changed ? reviews : inbox;
}
