import type {
    CatalogModification,
    StoredPartItem
} from '@/features/admin/lib/system-store/types';

export interface CatalogFilters {
    engine: string;
    transmission: string;
    drivetrain: string;
    trim: string;
}

export type CatalogFilterKey = keyof CatalogFilters;

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
        trim: read('trim')
    };
}

/** Формируем строку параметров для ссылок и переходов. */
export function buildCatalogQuery(
    filters: CatalogFilters
): string {
    const query = new URLSearchParams();

    for (const field of catalogFilterFields) {
        const value = filters[field.key];

        if (value !== 'all') {
            query.set(field.key, value);
        }
    }

    return query.toString();
}

export function hasCatalogFilters(
    filters: CatalogFilters
): boolean {
    return catalogFilterFields.some(
        field => filters[field.key] !== 'all'
    );
}

/** Все параметры должны совпасть у одной модификации. */
export function getMatchingModificationIds(
    modifications: CatalogModification[],
    filters: CatalogFilters
): Set<string> {
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
export function matchesCatalogFilters(
    part: StoredPartItem,
    filters: CatalogFilters,
    matchingModIds: ReadonlySet<string>
): boolean {
    // Без фильтров показываем и неуточнённые записи.
    if (!hasCatalogFilters(filters)) return true;

    // Такого сочетания параметров нет у модели.
    if (matchingModIds.size === 0) return false;

    const ids = part.compatibleModifications ?? [];

    return (
        ids.includes('all') ||
        ids.some(id => matchingModIds.has(id))
    );
}