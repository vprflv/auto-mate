const STORAGE_KEY = 'automate-user-categories';

export type UserCategory = {
    id: string;
    key: string;
    name: string;
    createdAt: string;
};

export function getUserCategories(): UserCategory[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}

export function saveUserCategories(list: UserCategory[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function addUserCategory(name: string): UserCategory {
    const list = getUserCategories();
    const item: UserCategory = {
        id: crypto.randomUUID(),
        key: `custom_${Date.now()}`,
        name: name.trim(),
        createdAt: new Date().toISOString(),
    };
    list.push(item);
    saveUserCategories(list);
    return item;
}

export function getUserCategoryLabel(key: string): string | undefined {
    return getUserCategories().find((c) => c.key === key)?.name;
}