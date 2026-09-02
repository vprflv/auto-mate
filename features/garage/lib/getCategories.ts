import { PartCategory } from '@/types';
import {
    PART_CATEGORY_LABELS,
    PART_CATEGORY_ORDER,
} from '@/features/garage/lib/config/partCategories';
import { getUserCategories, getUserCategoryLabel } from '@/features/garage/lib/userCategories';

export function getCategoriesFor(): { id: string; label: string; isCustom: boolean }[] {
    const system = PART_CATEGORY_ORDER.map((id) => ({
        id,
        label: PART_CATEGORY_LABELS[id],
        isCustom: false,
    }));

    const custom = getUserCategories().map((c) => ({
        id: c.key,
        label: c.name,
        isCustom: true,
    }));

    return [...system, ...custom];
}

export function getCategoryLabel(id: string): string {
    return (
        PART_CATEGORY_LABELS[id as PartCategory] ||
        getUserCategoryLabel(id) ||
        id
    );
}