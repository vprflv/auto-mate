import type { CatalogModification } from '@/features/admin/lib/system-store/types';

type ModificationAttributes = { year?: string; yearEnd?: string; trim?: string };

const trimCollator = new Intl.Collator('ru', { numeric: true });
const yearRange = /^([1-9]\d{3})(?:\s*[-–—]\s*([1-9]\d{3}))?$/u;

function productionYears(attributes?: ModificationAttributes) {
    const years = yearRange.exec(attributes?.year?.trim() ?? '');
    const first = Number(years?.[1] ?? 0);
    const last = Number(yearRange.exec(attributes?.yearEnd?.trim() ?? '')?.[1] ?? years?.[2] ?? first);
    return { first: first || last, last };
}

export function compareCatalogModificationAttributes(first?: ModificationAttributes, second?: ModificationAttributes): number {
    const firstYears = productionYears(first);
    const secondYears = productionYears(second);
    const byYear = secondYears.first - firstYears.first || secondYears.last - firstYears.last;
    if (byYear) return byYear;

    const trim = (attributes?: ModificationAttributes) =>
        attributes?.trim?.trim().replace(/\s+/g, ' ').toLowerCase() ?? '';
    const firstTrim = trim(first);
    const secondTrim = trim(second);
    if (firstTrim === secondTrim) return 0;
    if (!firstTrim) return 1;
    if (!secondTrim) return -1;

    return trimCollator.compare(firstTrim, secondTrim) || (firstTrim < secondTrim ? -1 : 1);
}

export function sortCatalogModifications(modifications: readonly CatalogModification[]): CatalogModification[] {
    return [...modifications].sort((first, second) =>
        compareCatalogModificationAttributes(first.attributes, second.attributes)
    );
}

export function sortCatalogModificationIds(ids: readonly string[], modifications: readonly CatalogModification[]): string[] {
    const attributesById = new Map(modifications.map(modification => [modification.id, modification.attributes]));
    return [...ids].sort((first, second) =>
        compareCatalogModificationAttributes(attributesById.get(first), attributesById.get(second))
    );
}
