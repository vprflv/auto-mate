import type {
    CatalogModification,
    StoredPartItem
} from '@/features/admin/lib/system-store/types';
import {resolvePartApplicability} from "@/features/admin/catalog/lib/resolvePartApplicability";

import type { CatalogSection } from '@/types/catalog/catalog';

export interface CatalogFilters {
    engine: string;
    transmission: string;
    drivetrain: string;
    trim: string;
    modificationIds?: string[];
}

export type CatalogFilterKey = Exclude<keyof CatalogFilters, 'modificationIds'>;

export type CatalogSearchParams = Record<
    string,
    string | string[] | undefined
>;

export const catalogFilterFields: {
    key: CatalogFilterKey;
    label: string;
    allLabel: string;
}[] = [
    {
        key: 'engine',
        label: 'Двигатель',
        allLabel: 'Все моторы'
    },
    {
        key: 'transmission',
        label: 'КПП',
        allLabel: 'Любая'
    },
    {
        key: 'drivetrain',
        label: 'Привод',
        allLabel: 'Любой'
    },
    {
        key: 'trim',
        label: 'Комплектация',
        allLabel: 'Любая'
    }
];

/** Читаем выбранные параметры из адреса страницы. */
export function readCatalogFilters(
    query: CatalogSearchParams
): CatalogFilters {
    const read = (key: CatalogFilterKey): string => {
        const value = query[key];

        return typeof value === 'string' && value
            ? value
            : 'all';
    };

    return {
        engine: read('engine'),
        transmission: read('transmission'),
        drivetrain: read('drivetrain'),
        trim: read('trim'),
        modificationIds: [...new Set([query.modificationId ?? []].flat().filter(Boolean))],
    };
}

/** Формируем строку параметров для ссылок и переходов. */
export function buildCatalogQuery(
    filters: CatalogFilters
): string {
    const query = new URLSearchParams();
    for (const id of filters.modificationIds ?? []) query.append('modificationId', id);

    for (const field of catalogFilterFields) {
        const value = filters[field.key];

        if (value !== 'all') {
            query.set(field.key, value);
        }
    }

    return query.toString();
}

export function buildModelCatalogHref(modelPath: string, currentQuery: string, section: CatalogSection): string {
    const query = new URLSearchParams(currentQuery);
    if (section === 'fluids') query.set('section', section);
    const search = query.toString();
    return search ? `${modelPath}?${search}` : modelPath;
}

export function hasCatalogFilters(
    filters: CatalogFilters
): boolean {
    return Boolean(filters.modificationIds?.length) || catalogFilterFields.some(
        field => filters[field.key] !== 'all'
    );
}

/** Все параметры должны совпасть у одной модификации. */
export function getMatchingModificationIds(
    modifications: CatalogModification[],
    filters: CatalogFilters
): Set<string> {
    const selectedIds = filters.modificationIds;
    if (selectedIds?.length) {
        return new Set(modifications.filter(mod => selectedIds.includes(mod.id)).map(mod => mod.id));
    }

    return new Set(
        modifications
            .filter(mod =>
                catalogFilterFields.every(field =>
                    filters[field.key] === 'all' ||
                    mod.attributes[field.key] === filters[field.key]
                )
            )
            .map(mod => mod.id)
    );
}

/** Проверяем применимость конкретной запчасти. */
/** Проверяем собственную и унаследованную применимость детали. */
export function matchesCatalogFilters(
    part: StoredPartItem,
    filters: CatalogFilters,
    matchingModIds: ReadonlySet<string>,
    modelParts: StoredPartItem[] = []
): boolean {
    // Без фильтров показываем все записи.
    if (!hasCatalogFilters(filters)) return true;

    // Такого сочетания параметров нет у модели.
    if (matchingModIds.size === 0) return false;

    const { effectiveIds } = resolvePartApplicability(
        part,
        modelParts
    );

    return (
        effectiveIds.includes('all') ||
        effectiveIds.some(id => matchingModIds.has(id))
    );
}
