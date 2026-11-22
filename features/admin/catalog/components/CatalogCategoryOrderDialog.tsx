'use client';

import { CategoryOrderDialog } from '@/components/ui/CategoryOrderDialog';
import { getCatalogCategoryKeys, getCatalogCategoryLabel, sortCatalogCategoryKeys } from '@/features/admin/lib/system-store/categoryLabels';
import { getCatalogBranches } from '@/features/admin/lib/system-store/catalogBranches';
import { storage } from '@/features/admin/lib/system-store/storage';

export function CatalogCategoryOrderDialog() {
    return (
        <CategoryOrderDialog
            getCategories={() => {
                const state = storage.getState();
                const { catalogCategoryOrder, catalogCategoryLabels, hiddenCatalogCategories } = state;
                const keys = getCatalogCategoryKeys(getCatalogBranches(state), hiddenCatalogCategories);
                return sortCatalogCategoryKeys(keys, catalogCategoryOrder, catalogCategoryLabels).map(id => ({
                    id,
                    label: getCatalogCategoryLabel(id, catalogCategoryLabels),
                }));
            }}
            onSave={ids => storage.saveState({ ...storage.getState(), catalogCategoryOrder: ids })}
        />
    );
}
