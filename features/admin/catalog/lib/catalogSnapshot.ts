import { storage } from '@/features/admin/lib/system-store/storage';
import type {
    StoredCatalogNode,
    StoredMasterModel,
} from '@/features/admin/lib/system-store/types';

export type CatalogSnapshot = {
    schemaVersion: 1;
    exportedAt: string;
    masterModels: StoredMasterModel[];
    catalogNodes: StoredCatalogNode[];
};

export function createCatalogSnapshot(): CatalogSnapshot {
    const { masterModels, catalogNodes } = storage.getState();

    return {
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        masterModels,
        catalogNodes,
    };
}

export function downloadCatalogSnapshot(): void {
    const snapshot = createCatalogSnapshot();
    const json = JSON.stringify(snapshot, null, 2);
    const file = new Blob([json], {
        type: 'application/json;charset=utf-8',
    });

    const url = URL.createObjectURL(file);
    const timestamp = snapshot.exportedAt.slice(0, 19).replace(/:/g, '-');
    const link = document.createElement('a');

    link.href = url;
    link.download = `auto-mate-catalog-${timestamp}.json`;

    document.body.appendChild(link);
    try {
        link.click();
    } finally {
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}