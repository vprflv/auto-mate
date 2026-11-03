import { storage } from '@/features/admin/lib/system-store/storage';
import { getGarageCars } from '@/features/garage/add/lib/storage';
import { buildOemCatalog } from '../buildOemCatalog';

import type { CatalogProvider } from '@/types/catalog/catalog';

export const masterCatalogProvider: CatalogProvider = {
    async getCatalog(params) {
        const state = storage.getState();

        const car = getGarageCars().find(
            item => item.id === params.carId
        );

        return buildOemCatalog(state, params, car);
    },
};