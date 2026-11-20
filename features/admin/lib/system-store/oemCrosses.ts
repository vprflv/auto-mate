import type { StoredPartItem } from './types';
import { formatArticle, normalizeArticle } from './normalizeArticle';

/** Убираем пустые номера и повторы, сохраняя формат отображения. */
export function uniqueOemCrosses(values: string[]): string[] {
    const numbers = new Map<string, string>();

    for (const value of values) {
        const key = normalizeArticle(value);

        if (key && !numbers.has(key)) {
            numbers.set(key, formatArticle(value));
        }
    }

    return Array.from(numbers.values());
}

/** Читаем новый список или старое поле с одним номером. */
export function getOemCrosses(
    part: Pick<StoredPartItem, 'oemCross' | 'oemCrosses'>
): string[] {
    return uniqueOemCrosses([
        ...(part.oemCrosses ?? []),
        part.oemCross ?? '',
    ]);
}

/** Расширяем поиск по связям, заданным на подтверждённых оригиналах. */
export function getRelatedParts(
    part: StoredPartItem,
    candidates: StoredPartItem[]
): StoredPartItem[] {
    const getNumbers = (item: StoredPartItem): string[] =>
        item.isOem
            ? [item.article, ...getOemCrosses(item)]
            : getOemCrosses(item);

    const targets = new Set(
        getNumbers(part)
            .map(normalizeArticle)
            .filter(Boolean)
    );

    const originalLinks = candidates
        .filter(candidate => candidate.isOem && candidate.isVerified === true)
        .map(candidate => getNumbers(candidate).map(normalizeArticle).filter(Boolean));

    let previousSize: number;
    do {
        previousSize = targets.size;
        for (const numbers of originalLinks) {
            if (numbers.some(number => targets.has(number))) {
                for (const number of numbers) targets.add(number);
            }
        }
    } while (targets.size > previousSize);

    return candidates.filter(candidate =>
        candidate.id !== part.id &&
        getNumbers(candidate).some(article =>
            targets.has(normalizeArticle(article))
        )
    );
}
