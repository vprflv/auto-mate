
/**
 * Технический ключ артикула для сравнения и поиска.
 *
 * Не объединяет разные окончания:
 * A01 и A02 остаются разными номерами.
 */
export function normalizeArticle(
    value: string | null | undefined
): string {
    return (value ?? '')
        .trim()
        .toUpperCase()
        .replace(/[\s-]/g, '');
}

export function catalogProductKey(brand: string | undefined, article: string): string {
    return JSON.stringify([brand?.trim().replace(/\s+/g, ' ').toLowerCase() ?? '', normalizeArticle(article)]);
}

/**
 * Единый формат отображения.
 *
 * Сохраняем исходные разделители,
 * но убираем лишние пробелы и приводим
 * буквы к верхнему регистру.
 */
export function formatArticle(
    value: string | null | undefined
): string {
    return (value ?? '')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ' ');
}
