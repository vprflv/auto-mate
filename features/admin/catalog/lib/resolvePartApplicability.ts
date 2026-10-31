import type { StoredPartItem } from '@/features/admin/lib/system-store/types';

import { getOemCrosses } from '@/features/admin/lib/system-store/oemCrosses';
import { normalizeArticle } from '@/features/admin/lib/system-store/normalizeArticle';

export interface PartApplicability {
    directIds: string[];
    inheritedIds: string[];
    effectiveIds: string[];
}

function uniqueIds(ids: string[]): string[] {
    const result = Array.from(
        new Set(
            ids
                .map(id => id.trim())
                .filter(Boolean)
        )
    );

    return result.includes('all')
        ? ['all']
        : result;
}

/**
 * modelParts должны содержать детали только текущей модели.
 *
 * Оригинал использует собственную применимость.
 * Аналог дополнительно получает применимость OEM-оригиналов,
 * номера которых прямо указаны у него в кроссах.
 */
export function resolvePartApplicability(
    part: StoredPartItem,
    modelParts: StoredPartItem[]
): PartApplicability {
    const directIds = uniqueIds(
        part.compatibleModifications ?? []
    );

    // Другие оригиналы и аналоги не расширяют
    // применимость этой оригинальной детали.
    if (part.isOem) {
        return {
            directIds,
            inheritedIds: [],
            effectiveIds: directIds
        };
    }

    const linkedOemNumbers = new Set(
        getOemCrosses(part)
            .map(normalizeArticle)
            .filter(Boolean)
    );

    // Ищем именно оригинальные детали,
    // чей собственный артикул указан у аналога.
    const originals = modelParts.filter(
        candidate =>
            candidate.isOem &&
            linkedOemNumbers.has(
                normalizeArticle(candidate.article)
            )
    );

    const inheritedIds = uniqueIds(
        originals.flatMap(
            original =>
                original.compatibleModifications ?? []
        )
    );

    return {
        directIds,
        inheritedIds,
        effectiveIds: uniqueIds([
            ...directIds,
            ...inheritedIds
        ])
    };
}