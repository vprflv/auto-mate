export interface AppUser {
    id: string;
    name: string;
    email: string;
    carsCount: number;
    createdAt: string;
    status: 'active' | 'blocked' | 'pending';
}

export interface CarSpecs {
    vin?: string;
    bodyClass?: string;
    displacementL?: string;
    fuel?: string;
    transmission?: string;
    driveType?: string;
    engineCode?: string;
    color?: string;
    trim?: string;
}

export interface AppCar {
    id: string;
    userId: string;
    ownerName: string;
    brand: string;
    model: string;
    title: string;
    year: number;
    vin: string;
    plateNumber?: string;
    mileage: number;
    engine: string;
    engineCode?: string;
    transmission?: string;
    drivetrain?: string;
    carSpecs?: CarSpecs;
    createdAt: string;
}

export interface AppServiceItem {
    name: string;
    brand: string;
    article: string;
    isOem?: boolean;
    quantity: number;
    price?: number;
}

export interface AppServiceRecord {
    id: string;
    carId: string;
    title: string;
    date: string;
    mileage: number;
    items: AppServiceItem[];
}

export interface InboxItem {
    id: string;
    type: 'part' | 'car_model';
    source?: 'user_manual' | 'user_service';
    carBrand: string;
    carModel: string;
    carYear?: number;
    carVin?: string;
    engine?: string;
    engineCode?: string;
    drivetrain?: string;
    transmission?: string;
    carSpecs?: CarSpecs | Record<string, any>;
    nodeTitle?: string;
    partBrand?: string;
    partArticle?: string;
    partName?: string;
    isOem?: boolean;
    itemType?: string;
    category?: string;
    subcategory?: string;
    quantity?: number;
    price?: number;
    mileage?: number;
    suggestedScore?: number;
    occurrencesCount?: number;
    submittedBy?: string;
    submittedAt?: string;
    note?: string;
    adminCategory?: string;
    adminCategoryLabel?: string;
    adminNodeTitle?: string;
}

// --- ЭТАЛОННЫЙ КАТАЛОГ (MASTER CATALOG) ---

export interface CatalogModification {
    id: string;
    name: string;
    registeredCount: number;
    attributes: {
        trim?: string;
        engine?: string;
        transmission?: string;
        drivetrain?: string;
        [key: string]: string | undefined;
    };
}

export interface StoredPartItem {
    id: string;
    brand: string;
    article: string;
    name: string;
    isOem: boolean;
    isVerified?: boolean;
    installationsCount: number;
    compatibilityScore: number;
    priceRange?: string;
    note?: string;
}

export interface StoredCatalogNode {
    id: string;
    brandSlug: string;
    modelSlug: string;
    title: string;
    category: 'service' | 'brakes' | 'suspension' | 'ignition' | 'fluids' | string;
    compatibleModifications: string[]; // Массив ID модификаций (['mod_cf4_sir']) или ['all']
    items: StoredPartItem[];
}

export interface StoredMasterModel {
    brandSlug: string;
    brandName: string;
    modelSlug: string;
    modelName: string;
    years: string;
    verified: boolean;
    registeredCount: number; // Счетчик кузова
    modifications: CatalogModification[]; // Админ пополняет этот список
}

export interface SystemState {
    users: AppUser[];
    cars: AppCar[];
    serviceRecords: AppServiceRecord[];
    inbox: InboxItem[];
    catalogNodes: StoredCatalogNode[];
    masterModels: StoredMasterModel[];
}