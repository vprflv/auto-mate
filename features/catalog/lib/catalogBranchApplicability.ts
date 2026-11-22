import type { StoredCatalogNode } from '@/features/admin/lib/system-store/types';

export function catalogBranchAllowsModification(node: StoredCatalogNode, modificationId: string): boolean {
    return node.allowedModificationIds?.includes(modificationId) ?? true;
}

export function restrictCatalogBranchModifications(node: StoredCatalogNode | undefined, ids: string[]): string[] {
    const allowed = node?.allowedModificationIds;
    if (!allowed) return ids;
    return ids.includes('all') ? allowed : ids.filter(id => allowed.includes(id));
}
