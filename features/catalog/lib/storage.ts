// features/catalog/lib/storage.ts


import {VehicleCatalog} from "@/types/catalog/catalog";

const KEY_PREFIX = 'automate-catalog-';

export function getCachedCatalog(carId: string): VehicleCatalog | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(KEY_PREFIX + carId);
        return raw ? (JSON.parse(raw) as VehicleCatalog) : null;
    } catch {
        return null;
    }
}

export function saveCatalog(catalog: VehicleCatalog) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEY_PREFIX + catalog.carId, JSON.stringify(catalog));
}

export function clearCatalog(carId: string) {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEY_PREFIX + carId);
}