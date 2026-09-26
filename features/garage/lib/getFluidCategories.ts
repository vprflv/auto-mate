import { FLUID_CATEGORY_OPTIONS } from '@/features/garage/lib/config/serviceItemCategories';
import {
    getUserFluidCategories,
    getUserFluidCategoryLabel,
} from '@/features/garage/lib/userFluidCategories';

export function getFluidCategoriesFor(): {
    id: string;
    label: string;
    isCustom: boolean;
}[] {
    const system = FLUID_CATEGORY_OPTIONS.map((option) => ({
        id: option.value,
        label: option.label,
        isCustom: false,
    }));

    const custom = getUserFluidCategories().map((category) => ({
        id: category.key,
        label: category.name,
        isCustom: true,
    }));

    return [...system, ...custom];
}

export function getFluidCategoryLabel(
    id: string
): string {
    return (
        FLUID_CATEGORY_OPTIONS.find(
            (option) => option.value === id
        )?.label ||
        getUserFluidCategoryLabel(id) ||
        id
    );
}