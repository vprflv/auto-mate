import { normalizeArticle } from '@/features/admin/lib/system-store/normalizeArticle';
import { getOemCrosses } from '@/features/admin/lib/system-store/oemCrosses';
import type {
    StoredCatalogNode,
    StoredPartItem,
} from '@/features/admin/lib/system-store/types';

export type CatalogPartSearchResult = {
    node: StoredCatalogNode;
    part: StoredPartItem;
};

export function searchCatalogParts(
    nodes: readonly StoredCatalogNode[],
    query: string
): CatalogPartSearchResult[] {
    const number = normalizeArticle(query);
    if (!number) return [];

    const results: CatalogPartSearchResult[] = [];

    for (const node of nodes) {
        for (const part of node.items) {
            const matchesArticle = normalizeArticle(part.article) === number;
            const matchesOem = getOemCrosses(part).some(
                oem => normalizeArticle(oem) === number
            );

            if (matchesArticle || matchesOem) {
                results.push({ node, part });
            }
        }
    }

    return results;
}