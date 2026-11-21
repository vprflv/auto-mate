import type { CatalogModification, StoredCatalogNode, StoredMasterModel } from '@/features/admin/lib/system-store/types';
import { FLUID_CATEGORY_OPTIONS } from '@/features/garage/lib/config/serviceItemCategories';
import type { FluidCategory, FluidFillCapacities } from '@/types/oil';
import { FLUID_CATALOG_CATEGORY } from './catalogSections';

export const FLUID_FILL_CAPACITY_NOTICE =
    'Справочная информация основана на опыте и данных пользователей. Перед заправкой сверьте объём и способ замены с руководством производителя для вашей модификации.';

const litersFormatter = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 3,
});

export function formatFillCapacity(liters: number): string {
    return `${litersFormatter.format(liters)} л`;
}

export function getNodeFluidCategory(node: StoredCatalogNode): FluidCategory | null {
    if (node.fluidCategory !== undefined) return node.fluidCategory;
    const title = node.title.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ru');
    if (title === 'трансмиссия' || title === 'трансмиссионное масло') return 'gearboxOil';
    return FLUID_CATEGORY_OPTIONS.find(option => option.label.toLocaleLowerCase('ru') === title)?.value ?? null;
}

export function getNodeFillCapacity(node: StoredCatalogNode, modification: CatalogModification): number | undefined {
    if (node.fillCapacitiesByModification) {
        return node.fillCapacitiesByModification[modification.id];
    }

    const category = getNodeFluidCategory(node);
    return category ? modification.fluidFillCapacities?.[category] : undefined;
}

export function getServiceFillCapacities(
    nodes: StoredCatalogNode[],
    model: StoredMasterModel,
    modification: CatalogModification,
): FluidFillCapacities {
    const capacities: FluidFillCapacities = {};
    const volumesByCategory = new Map<FluidCategory, Set<number>>();

    for (const node of nodes) {
        if (node.category !== FLUID_CATALOG_CATEGORY ||
            node.brandSlug !== model.brandSlug || node.modelSlug !== model.modelSlug) continue;

        const category = getNodeFluidCategory(node);
        const liters = getNodeFillCapacity(node, modification);
        if (!category || liters === undefined) continue;

        const values = volumesByCategory.get(category) ?? new Set<number>();
        values.add(liters);
        volumesByCategory.set(category, values);
    }

    for (const [category, values] of volumesByCategory) {
        // Разные объёмы в двух ветках одного типа нельзя переносить в общее поле ТО.
        const [liters] = values;
        if (values.size === 1) capacities[category] = liters;
    }
    return capacities;
}
