// types/catalog.ts

export type CatalogNode = {
    id: string;
    name: string;
    parentId?: string | null;
    image?: string;                // URL или base64 схемы
    children?: CatalogNode[];
    hasArticles?: boolean;
};

export type CatalogArticle = {
    id: string;
    oem: string;
    name: string;
    brand?: string;
    quantity?: number;
    note?: string;
    image?: string;
    nodeId: string;
    analogs?: string[];
};

export type VehicleCatalog = {
    carId: string;
    vin?: string;
    make: string;
    model: string;
    year: number;
    source: 'mock' | 'ai' | 'laximo' | 'partsapi' | 'tecdoc' | string;
    fetchedAt: string;
    nodes: CatalogNode[];          // дерево верхнего уровня
    articles: CatalogArticle[];    // плоский список для поиска
};

export type CatalogProviderParams = {
    carId: string;
    vin?: string;
    make: string;
    model: string;
    year: number;
};

export interface CatalogProvider {
    getCatalog(params: CatalogProviderParams): Promise<VehicleCatalog>;
}