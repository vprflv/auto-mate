import { CatalogNode } from '@/types/catalog/catalog';

export function findNodeName(nodes: CatalogNode[], id: string | null): string | null {
    return findNodePath(nodes, id).at(-1) ?? null;
}

export function findNodePath(nodes: CatalogNode[], id: string | null): string[] {
    if (!id) return [];

    for (const node of nodes) {
        if (node.id === id) return [node.name];
        if (node.children) {
            const found = findNodePath(node.children, id);
            if (found.length) return [node.name, ...found];
        }
    }

    return [];
}
