// features/catalog/lib/types.ts

import {CatalogArticle, VehicleCatalog} from "@/types/catalog/catalog";

export interface CatalogProvider {
    /** Получить/построить каталог для машины */
    getCatalog(params: {
        carId: string;
        vin?: string;
        make: string;
        model: string;
        year: number;
    }): Promise<VehicleCatalog>;

    /** Поиск по каталогу (можно делать локально после загрузки) */
    search?(catalog: VehicleCatalog, query: string): CatalogArticle[];
}