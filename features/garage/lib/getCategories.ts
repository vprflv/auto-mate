import type { Car, PartCategory } from '@/types';
import { buildOemCatalog, getOemCatalogCategoryId } from '@/features/catalog/lib/buildOemCatalog';
import {
    PART_CATEGORY_LABELS,
    PART_CATEGORY_ORDER,
} from '@/features/garage/lib/config/partCategories';
import { getUserCategories, getUserCategoryLabel } from '@/features/garage/lib/userCategories';
import { storage } from '@/features/admin/lib/system-store/storage';
import { getGarageCars } from '@/features/garage/add/lib/storage';
import { getCatalogCategoryLabel } from '@/features/admin/lib/system-store/categoryLabels';

const catalogPrefix = 'catalog-category:';

type CategoryOption = { id: string; label: string; isCustom: boolean; isDefault?: boolean };

export function getCategoriesFor(carId?: string): CategoryOption[] {
    const system = getSystemCategories();
    const car = carId ? getGarageCars().find(item => item.id === carId) : undefined;

    for (const { id, label } of car?.initialPartCategories ?? []) {
        const existing = system.find(item => item.id === id);
        if (existing) {
            existing.label = label;
            existing.isDefault = true;
        } else {
            system.push({ id, label, isCustom: false, isDefault: true });
        }
    }

    for (const part of car?.partsCatalog?.items ?? []) {
        if (part.category.startsWith(catalogPrefix) && !system.some(item => item.id === part.category)) {
            system.push({ id: part.category, label: getCatalogCategoryLabel(part.category.slice(catalogPrefix.length)), isCustom: false });
        }
    }

    return [...system, ...getUserCategories().map(category => ({
        id: category.key,
        label: category.name,
        isCustom: true,
    }))];
}

function getSystemCategories(): CategoryOption[] {
    return PART_CATEGORY_ORDER.map(id => ({
        id,
        label: PART_CATEGORY_LABELS[id],
        isCustom: false,
    }));
}

export function captureInitialPartCategories(car: Car, state = storage.getState()) {
    const system = getSystemCategories();

    const { catalogNodes, catalogCategoryLabels } = state;
    const catalog = buildOemCatalog(state, {
        carId: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
    }, car);
    const visibleCategoryIds = new Set(catalog.nodes.map(node => node.id));
    const catalogKeys = new Set(catalogNodes.map(node => node.category).filter(
        key => key && visibleCategoryIds.has(getOemCatalogCategoryId(key))
    ));
    const normalize = (name: string) => name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ru');

    for (const key of catalogKeys) {
        const label = getCatalogCategoryLabel(key, catalogCategoryLabels);
        const mappedId = key === 'service' ? 'maintenance' : key === 'ignition' ? 'electrical' : key;
        const builtin = system.find(item => item.id === mappedId) ??
            system.find(item => normalize(PART_CATEGORY_LABELS[item.id as PartCategory] ?? '') === normalize(key));
        if (builtin) {
            builtin.label = label;
            builtin.isDefault = true;
        } else {
            system.push({ id: catalogPrefix + key, label, isCustom: false, isDefault: true });
        }
    }

    return system.filter(item => item.isDefault).map(({ id, label }) => ({ id, label }));
}

export function getCategoryLabel(id: string, carId?: string): string {
    return (
        getCategoriesFor(carId).find(item => item.id === id)?.label ||
        PART_CATEGORY_LABELS[id as PartCategory] ||
        getUserCategoryLabel(id) ||
        (id.startsWith(catalogPrefix)
            ? getCatalogCategoryLabel(id.slice(catalogPrefix.length))
            : id)
    );
}
