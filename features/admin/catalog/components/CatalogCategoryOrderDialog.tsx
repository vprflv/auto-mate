'use client';

import { CategoryOrderDialog } from '@/components/ui/CategoryOrderDialog';
import { getCatalogCategoryKeys, getCatalogCategoryLabel, sortCatalogCategoryKeys } from '@/features/admin/lib/system-store/categoryLabels';
import { storage } from '@/features/admin/lib/system-store/storage';

export function CatalogCategoryOrderDialog() {
    return (
        <CategoryOrderDialog
            getCategories={() => {
                const { catalogNodes, catalogCategoryOrder, catalogCategoryLabels, hiddenCatalogCategories } = storage.getState();
                const keys = getCatalogCategoryKeys(catalogNodes.map(node => node.category).filter(Boolean), hiddenCatalogCategories);
                return sortCatalogCategoryKeys(keys, catalogCategoryOrder, catalogCategoryLabels).map(id => ({
                    id,
                    label: getCatalogCategoryLabel(id, catalogCategoryLabels),
                }));
            }}
            onSave={ids => storage.saveState({ ...storage.getState(), catalogCategoryOrder: ids })}
        />
    );
}
