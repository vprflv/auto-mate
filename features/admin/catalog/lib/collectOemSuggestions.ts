import type {
    StoredPartItem,
    StoredCatalogNode
} from '@/features/admin/lib/system-store/types';

import { getOemCrosses } from '@/features/admin/lib/system-store/oemCrosses';
import { normalizeArticle } from '@/features/admin/lib/system-store/normalizeArticle';

import type { OemSuggestion } from '@/features/admin/catalog-inbox/components/part-moderation/OemCrossSelect';

export function collectOemSuggestions(
    part: StoredPartItem,
    nodeId: string,
    catalogNodes: StoredCatalogNode[]
): OemSuggestion[] {
    const result = new Map<string, OemSuggestion>();

    const ownArticle = part.isOem
        ? normalizeArticle(part.article)
        : '';

    const add = (suggestion: OemSuggestion) => {
        const key = normalizeArticle(suggestion.article);

        if (!key || key === ownArticle) return;

        const existing = result.get(key);

        const shouldReplace =
            !existing ||
            (
                existing.source === 'cross' &&
                suggestion.source === 'catalog'
            ) ||
            (
                existing.source === suggestion.source &&
                !existing.sameNode &&
                suggestion.sameNode
            );

        if (shouldReplace) {
            result.set(key, suggestion);
        }
    };

    for (const node of catalogNodes) {
        const sameNode = node.id === nodeId;

        for (const item of node.items) {
            for (const article of getOemCrosses(item)) {
                add({
                    id: `cross:${normalizeArticle(article)}`,
                    article,
                    brand: '',
                    name: '',
                    nodeTitle: node.title,
                    sameNode,
                    source: 'cross'
                });
            }

            if (item.isOem && item.article.trim()) {
                add({
                    id: `catalog:${normalizeArticle(item.article)}`,
                    article: item.article,
                    brand: item.brand,
                    name: item.name,
                    nodeTitle: node.title,
                    sameNode,
                    source: 'catalog'
                });
            }
        }
    }

    return Array.from(result.values());
}