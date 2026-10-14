export function normalizeSlug(str: string): string {
    return (str || '')
        .toLowerCase()
        .trim()
        .replace(/\(.*?\)/g, '')
        .replace(/[^a-zа-я0-9]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}