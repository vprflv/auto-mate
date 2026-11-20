import { normalizeArticle } from '@/features/admin/lib/system-store/normalizeArticle';
import { getOemCrosses } from '@/features/admin/lib/system-store/oemCrosses';
import type { StoredCatalogNode, StoredPartItem } from '@/features/admin/lib/system-store/types';

type CatalogOemSource = { node: StoredCatalogNode; part: StoredPartItem };
type CatalogModel = Pick<StoredCatalogNode, 'brandSlug' | 'modelSlug'>;

export function findCatalogOemSource(
    nodes: StoredCatalogNode[],
    number: string,
    includeCrosses: boolean,
    model?: CatalogModel | null,
): CatalogOemSource | undefined {
    const key = normalizeArticle(number);
    if (!key) return undefined;

    let crossMatch: CatalogOemSource | undefined;
    let localCrossMatch: CatalogOemSource | undefined;

    for (const node of nodes) {
        for (const part of node.items) {
            if (!part.name.trim()) continue;
            if (part.isOem && normalizeArticle(part.article) === key) {
                return { node, part };
            }
            if (!includeCrosses || !getOemCrosses(part).some(cross => normalizeArticle(cross) === key)) {
                continue;
            }

            const match = { node, part };
            crossMatch ??= match;
            if (node.brandSlug === model?.brandSlug && node.modelSlug === model?.modelSlug) {
                localCrossMatch ??= match;
            }
        }
    }

    return localCrossMatch ?? crossMatch;
}
