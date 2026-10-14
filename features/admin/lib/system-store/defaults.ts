import { StoredCatalogNode, StoredMasterModel, SystemState } from './types';

export const STORAGE_KEY = 'bm_shared_system_state_v1';

export const initialDefaultMasterModels: StoredMasterModel[] = [
    { brandSlug: 'audi', brandName: 'Audi', modelSlug: 'a4-b9', modelName: 'A4 (B9)', years: '2015 – 2024', verified: true },
    { brandSlug: 'audi', brandName: 'Audi', modelSlug: 'q5-fy', modelName: 'Q5 (FY)', years: '2017 – н.в.', verified: true },
    { brandSlug: 'bmw', brandName: 'BMW', modelSlug: '3-series-g20', modelName: '3 Series (G20)', years: '2018 – н.в.', verified: true },
    { brandSlug: 'bmw', brandName: 'BMW', modelSlug: '5-series-g30', modelName: '5 Series (G30)', years: '2017 – 2023', verified: true },
    { brandSlug: 'skoda', brandName: 'Skoda', modelSlug: 'octavia-a7', modelName: 'Octavia A7', years: '2013 – 2020', verified: true },
    { brandSlug: 'skoda', brandName: 'Skoda', modelSlug: 'kodiaq', modelName: 'Kodiaq I', years: '2016 – 2024', verified: true },
    { brandSlug: 'toyota', brandName: 'Toyota', modelSlug: 'camry-xv70', modelName: 'Camry (XV70)', years: '2017 – 2024', verified: true },
    { brandSlug: 'toyota', brandName: 'Toyota', modelSlug: 'rav4-xa50', modelName: 'RAV4 (XA50)', years: '2018 – н.в.', verified: true },
    { brandSlug: 'volkswagen', brandName: 'Volkswagen', modelSlug: 'tiguan-ii', modelName: 'Tiguan II', years: '2016 – 2024', verified: true },
];

export const initialDefaultNodes: StoredCatalogNode[] = [
    {
        id: 'skoda-octavia-a7-oil-filter',
        brandSlug: 'skoda',
        modelSlug: 'octavia-a7',
        title: 'Масляный фильтр',
        category: 'service',
        engineCompatibility: ['all'],
        items: [
            {
                id: 'p_01',
                brand: 'MANN-FILTER',
                article: 'W 712/95',
                name: 'Фильтр масляный',
                isOem: false,
                isVerified: true,
                installationsCount: 48,
                compatibilityScore: 98,
                priceRange: '850 – 1 100 ₽',
            },
            {
                id: 'p_02',
                brand: 'VAG',
                article: '04E 115 561 H',
                name: 'Оригинальный масляный фильтр',
                isOem: true,
                isVerified: true,
                installationsCount: 41,
                compatibilityScore: 99,
                priceRange: '1 200 – 1 600 ₽',
            },
        ],
    },
];

export const initialDefaultState: SystemState = {
    users: [],
    cars: [],
    serviceRecords: [],
    inbox: [],
    catalogNodes: initialDefaultNodes,
    masterModels: initialDefaultMasterModels,
};