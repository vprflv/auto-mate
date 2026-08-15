import { PartCategory, UserSubcategory } from '@/types';

const STORAGE_KEY = 'automate-user-subcategories';

export function getUserSubcategories(): UserSubcategory[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}

export function saveUserSubcategories(list: UserSubcategory[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function getUserSubcategoriesByCategory(category: PartCategory): UserSubcategory[] {
    return getUserSubcategories().filter((s) => s.category === category);
}

export function addUserSubcategory(
    category: PartCategory,
    name: string,
    keywords: string[] = []
): UserSubcategory {
    const list = getUserSubcategories();

    const item: UserSubcategory = {
        id: crypto.randomUUID(),
        category,
        name: name.trim(),
        key: `custom_${Date.now()}`,
        keywords: keywords.map((k) => k.toLowerCase().trim()).filter(Boolean),
        createdAt: new Date().toISOString(),
    };

    list.push(item);
    saveUserSubcategories(list);
    return item;
}

/** Когда пользователь переносит запчасть в свою категорию — учимся */
export function learnKeywords(subKey: string, partName: string) {
    const list = getUserSubcategories();
    const sub = list.find((s) => s.key === subKey);
    if (!sub) return;

    const words = partName
        .toLowerCase()
        .split(/[\s,\-_/]+/)
        .map((w) => w.trim())
        .filter((w) => w.length >= 4);

    const newKeywords = words.filter((w) => !sub.keywords.includes(w));
    if (newKeywords.length === 0) return;

    sub.keywords = [...sub.keywords, ...newKeywords].slice(0, 15); // лимит
    saveUserSubcategories(list);
}