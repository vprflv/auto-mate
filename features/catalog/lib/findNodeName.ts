import { CatalogNode } from '@/types/catalog/catalog';

export function findNodeName(nodes: CatalogNode[], id: string | null): string | null {
    return findNodePath(nodes, id).at(-1) ?? null;
}

export function findCatalogNode(nodes: CatalogNode[], id: string): CatalogNode | undefined {
    for (const node of nodes) {
        if (node.id === id) return node;
        const child = node.children && findCatalogNode(node.children, id);
        if (child) return child;
    }
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
