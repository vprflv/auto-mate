export function normalizeSlug(str: string): string {
    return (str || '')
        .toLowerCase()
        .trim()
        .replace(/\(.*?\)/g, '')
        .replace(/[^a-zа-я0-9]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// Замена визуально идентичных русских букв на латиницу
const CYRILLIC_TO_LATIN_MAP: Record<string, string> = {
    'А': 'A', 'В': 'B', 'С': 'C', 'Е': 'E', 'Н': 'H',
    'К': 'K', 'М': 'M', 'О': 'O', 'Р': 'P', 'Т': 'T', 'Х': 'X'
};

// Стоп-слова, которые юзеры вбивают в поле артикула вместо реального номера
const FAKE_OEM_STOP_WORDS = new Set([
    'НЕТ', 'NO', 'NONE', 'ХЗ', 'НЕЗНАЮ', 'НЕПОМНЮ', 'ОРИГИНАЛ', 'OEM', '—', '-', 'АНАЛОГ',
    'DOT3', 'DOT4', 'DOT5', 'DOT51', 'DEXRON', 'DEXRON3', 'DEXRON6', 'ATF'
]);

// Регулярка для отсева допусков жидкостей
const FLUID_SPEC_REGEX = /^(DOT\d*|DEXRON\d*|VW\d{3}\d{2}|MB\d{3}\d*|ACEA[A-Z0-9]+|API[A-Z0-9]+)$/i;

/**
 * Приводит OEM / артикул к строгому каноническому виду:
 * 1. Выкидывает дефисы, пробелы, точки, слэши
 * 2. Заменяет русские буквы-двойники на латиницу
 * 3. Переводит в UPPERCASE
 *
 * Пример: " 04e-115.561 Н " -> "04E115561H" (с латинской H)
 */
export function normalizeOem(raw?: string | null): string {
    if (!raw) return '';

    const trimmed = raw.trim().toUpperCase();

    // Быстрая проверка на заглушки
    if (FAKE_OEM_STOP_WORDS.has(trimmed) || trimmed.length < 3) {
        return '';
    }

    // Оставляем только буквы и цифры (выкидываем пробелы, тире, слэши, точки)
    const stripped = trimmed.replace(/[^A-Z0-9А-Я]/g, '');

    // Проверяем: нет ли стоп-слова, достаточна ли длина и не является ли это допуском
    if (FAKE_OEM_STOP_WORDS.has(stripped) || stripped.length < 3 || FLUID_SPEC_REGEX.test(stripped)) {
        return '';
    }

    // Транслитерируем кириллицу в латиницу
    return stripped
        .split('')
        .map((char) => CYRILLIC_TO_LATIN_MAP[char] || char)
        .join('');
}