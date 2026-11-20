import type { CatalogModification } from '@/features/admin/lib/system-store/types';

const trimCollator = new Intl.Collator('ru', { numeric: true });

export function sortModificationsByTrim(modifications: readonly CatalogModification[]): CatalogModification[] {
    const trimKey = (item: CatalogModification) =>
        item.attributes?.trim?.trim().replace(/\s+/g, ' ').toLowerCase() ?? '';

    return [...modifications].sort((first, second) => {
        const firstTrim = trimKey(first);
        const secondTrim = trimKey(second);

        if (firstTrim === secondTrim) return 0;
        if (!firstTrim) return 1;
        if (!secondTrim) return -1;

        return trimCollator.compare(firstTrim, secondTrim) || (firstTrim < secondTrim ? -1 : 1);
    });
}
