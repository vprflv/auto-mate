export interface ModelEntry {
    slug: string;
    name: string;
    years: string;
    partsCount: number;
    verifiedPercent: number;
}

export interface BrandCatalog {
    brand: string;
    slug: string;
    models: ModelEntry[];
}