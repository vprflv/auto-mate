import { CatalogNode } from '@/types/catalog/catalog';

export function findNodeName(nodes: CatalogNode[], id: string | null): string | null {
    if (!id) return null;

    for (const node of nodes) {
        if (node.id === id) return node.name;
        if (node.children) {
            const found = findNodeName(node.children, id);
            if (found) return found;
        }
    }

    return null;
}