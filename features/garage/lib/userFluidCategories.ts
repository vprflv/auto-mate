const STORAGE_KEY = 'automate-user-fluid-categories';

export type UserFluidCategory = {
    id: string;
    key: string;
    name: string;
    createdAt: string;
};

export function getUserFluidCategories(): UserFluidCategory[] {
    if (typeof window === 'undefined') return [];

    const raw = localStorage.getItem(STORAGE_KEY);

    return raw ? JSON.parse(raw) : [];
}

export function saveUserFluidCategories(
    list: UserFluidCategory[]
) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(list)
    );
}

export function addUserFluidCategory(
    name: string
): UserFluidCategory {
    const list = getUserFluidCategories();

    const item: UserFluidCategory = {
        id: crypto.randomUUID(),
        key: `custom_fluid_${crypto.randomUUID()}`,
        name: name.trim(),
        createdAt: new Date().toISOString(),
    };

    list.push(item);

    saveUserFluidCategories(list);

    return item;
}

export function getUserFluidCategoryLabel(
    key: string
): string | undefined {
    return getUserFluidCategories().find(
        (category) => category.key === key
    )?.name;
}