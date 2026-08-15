import { PartCategory } from '@/types';
import {
    PART_SUBCATEGORY_ORDER,
    PART_SUBCATEGORY_LABELS,
} from '@/features/garage/lib/config/partSubcategories';
import { getUserSubcategoriesByCategory } from '@/features/garage/lib/userSubcategories';

export function getSubcategoriesFor(category: PartCategory): {
    id: string;
    label: string;
    isCustom: boolean;
}[] {
    const system = (PART_SUBCATEGORY_ORDER[category] ?? ['other']).map((id) => ({
        id,
        label: PART_SUBCATEGORY_LABELS[id] || id,
        isCustom: false,
    }));

    const custom = getUserSubcategoriesByCategory(category).map((s) => ({
        id: s.key,
        label: s.name,
        isCustom: true,
    }));

    // свои — перед "Прочее"
    const withoutOther = system.filter((s) => s.id !== 'other');
    const other = system.find((s) => s.id === 'other');

    return [
        ...withoutOther,
        ...custom,
        ...(other ? [other] : []),
    ];
}

export function getSubcategoryLabel(category: PartCategory, subId: string): string {
    const all = getSubcategoriesFor(category);
    return all.find((s) => s.id === subId)?.label || subId;
}