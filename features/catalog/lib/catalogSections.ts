import type { CatalogSection } from '@/types/catalog/catalog';

export const FLUID_CATALOG_CATEGORY = 'fluids';

export function getCatalogSection(category: string): CatalogSection {
    return category === FLUID_CATALOG_CATEGORY ? 'fluids' : 'parts';
}
