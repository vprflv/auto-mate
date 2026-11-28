// types/catalog.ts

import {PartInstallation} from "@/types/partInstallation";

export type CatalogNode = {
    id: string;
    name: string;
    parentId?: string | null;
    image?: string;                // URL или base64 схемы
    children?: CatalogNode[];
    hasArticles?: boolean;
    fillCapacity?: number;
};


export type CatalogFitment = {
    brandSlug: string;
    modelSlug: string;
    modificationId: string;
    installations?: PartInstallation[];
    make: string;
    model: string;
    modification: string;
    year?: string;
    yearEnd?: string;
    trim?: string;
    description: string;
};

export type CatalogArticle = {
    id: string;
    oem: string;
    name: string;
    brand?: string;
    quantity?: number;
    installationOptions?: PartInstallation[];
    appliesToCurrentCar?: boolean;
    relatedFitments?: CatalogFitment[];
    note?: string;
    image?: string;
    nodeId: string;
    nodeIds?: string[];
    analogs?: string[];
    isOem?: boolean;
    isVerified?: boolean;

    // Номер оригинала может быть известен из кросса,
    // даже если отдельной записи оригинала пока нет.
    canSave?: boolean;

    originalNumbers?: string[];
    fitments?: CatalogFitment[];
    variants?: CatalogArticle[];
};

export type CatalogModificationOption = {
    preference: import('@/types').CarCatalogPreference;
    modelName: string;
    value: string;
    name: string;
    year?: string;
    yearEnd?: string;
    bodyCode?: string;
    engine?: string;
    transmission?: string;
};

export type VehicleCatalog = {
    carId: string;
    vin?: string;
    make: string;
    model: string;
    year: number;
    source: 'mock' | 'ai' | 'laximo' | 'partsapi' | 'tecdoc' | string;
    modificationOptions?: CatalogModificationOption[];
    selectedModification?: { name: string; year?: string; yearEnd?: string; differences: string[] };
    fetchedAt: string;
    nodes: CatalogNode[];          // дерево верхнего уровня
    articles: CatalogArticle[];    // плоский список для поиска
};

export type CatalogSection = 'parts' | 'fluids';

export type CatalogProviderParams = {
    section?: CatalogSection;
    carId: string;
    vin?: string;
    make: string;
    model: string;
    year: number;
};

export interface CatalogProvider {
    getCatalog(params: CatalogProviderParams): Promise<VehicleCatalog>;
}