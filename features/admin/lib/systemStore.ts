'use client';


export interface CarSpecs {
    vin?: string;
    bodyClass?: string;
    displacementL?: string;
    fuel?: string;
    transmission?: string;
    driveType?: string;
    engineCode?: string;
    color?: string;
}

export interface InboxItem {
    id: string;
    type?: 'part' | 'car_model';
    source: 'user_service' | 'ai_draft' | 'user_garage';
    carBrand: string;
    carModel: string;
    engine?: string;
    year?: number;
    specs?: CarSpecs; // Полный паспорт ТС для модерации
    nodeTitle?: string;
    partBrand?: string;
    partArticle?: string;
    partName?: string;
    isOem?: boolean;
    suggestedScore?: number;
    occurrencesCount?: number;
    submittedBy: string;
    submittedAt: string;
    note?: string;
}

export interface AppUser {
    id: string;
    name: string;
    email: string;
    carsCount: number;
    createdAt: string;
    status: 'active' | 'blocked' | 'pending';
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
    type?: 'part' | 'car_model'; // Деталь или новая модель авто
    source: 'user_service' | 'ai_draft' | 'user_garage';
    carBrand: string;
    carModel: string;
    engine?: string;
    year?: number;
    nodeTitle?: string;
    partBrand?: string;
    partArticle?: string;
    partName?: string;
    isOem?: boolean;
    suggestedScore?: number;
    occurrencesCount?: number;
    submittedBy: string;
    submittedAt: string;
    note?: string;
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
    category: 'service' | 'brakes' | 'suspension' | 'ignition' | 'fluids';
    engineCompatibility: string[];
    items: StoredPartItem[];
}

export interface StoredMasterModel {
    brandSlug: string;
    brandName: string;
    modelSlug: string;
    modelName: string;
    years: string;
    verified: boolean;
}

const STORAGE_KEY = 'bm_shared_system_state_v1';

export function normalizeSlug(str: string): string {
    return (str || '')
        .toLowerCase()
        .trim()
        .replace(/\(.*?\)/g, '')
        .replace(/[^a-zа-я0-9]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

interface SystemState {
    users: AppUser[];
    cars: AppCar[];
    serviceRecords: AppServiceRecord[];
    inbox: InboxItem[];
    catalogNodes: StoredCatalogNode[];
    masterModels: StoredMasterModel[];
}

const initialDefaultMasterModels: StoredMasterModel[] = [
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

const initialDefaultNodes: StoredCatalogNode[] = [
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

const initialDefaultState: SystemState = {
    users: [],
    cars: [],
    serviceRecords: [],
    inbox: [],
    catalogNodes: initialDefaultNodes,
    masterModels: initialDefaultMasterModels,
};

export const systemStore = {
    getState(): SystemState {
        if (typeof window === 'undefined') return initialDefaultState;
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDefaultState));
            return initialDefaultState;
        }
        try {
            const parsed = JSON.parse(raw);
            if (!parsed.masterModels || parsed.masterModels.length === 0) {
                parsed.masterModels = initialDefaultMasterModels;
            }
            if (!parsed.catalogNodes || parsed.catalogNodes.length === 0) {
                parsed.catalogNodes = initialDefaultNodes;
            }
            return parsed;
        } catch {
            return initialDefaultState;
        }
    },

    saveState(state: SystemState) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        window.dispatchEvent(new Event('system-store-updated'));
    },

    createUser(name: string, email: string, customId?: string): AppUser {
        const state = this.getState();
        const existing = state.users.find(
            (u) => u.email.toLowerCase() === email.toLowerCase()
        );

        if (existing) {
            if (name && existing.name !== name && existing.name === existing.email.split('@')[0]) {
                existing.name = name;
                this.saveState(state);
            }
            return existing;
        }

        const newUser: AppUser = {
            id: customId || `usr_${Date.now().toString().slice(-4)}`,
            name: name.trim() || email.split('@')[0],
            email: email.trim().toLowerCase(),
            carsCount: 0,
            createdAt: new Date().toLocaleDateString('ru-RU'),
            status: 'active',
        };

        state.users.unshift(newUser);
        this.saveState(state);
        return newUser;
    },

    // Добавление автомобиля с проверкой 1-в-1
    addCar(params: {
        userId: string;
        brand: string;
        model: string;
        year: number;
        vin?: string;
        plateNumber?: string;
        mileage: number;
        engine: string;
        engineCode?: string;
        bodyClass?: string;
        displacementL?: string;
        fuel?: string;
        transmission?: string;
        driveType?: string;
        color?: string;
    }): AppCar {
        const state = this.getState();
        const user = state.users.find((u) => u.id === params.userId);

        const newCar: AppCar = {
            id: `car_${Date.now().toString().slice(-4)}`,
            userId: params.userId,
            ownerName: user?.name || 'Пользователь',
            brand: params.brand,
            model: params.model,
            title: `${params.brand} ${params.model}`,
            year: params.year,
            vin: params.vin || `VIN${Date.now().toString().slice(-6)}`,
            plateNumber: params.plateNumber,
            mileage: params.mileage,
            engine: params.engine,
            engineCode: params.engineCode,
            createdAt: new Date().toLocaleDateString('ru-RU'),
        };

        state.cars.unshift(newCar);
        if (user) {
            user.carsCount += 1;
        }

        const bSlug = normalizeSlug(params.brand);
        const mSlug = normalizeSlug(params.model);

        const isExactMatch = state.masterModels.some(
            (m) => m.brandSlug === bSlug && m.modelSlug === mSlug
        );

        if (!isExactMatch) {
            const alreadyInInbox = state.inbox.some(
                (i) => i.type === 'car_model' && normalizeSlug(i.carBrand) === bSlug && normalizeSlug(i.carModel) === mSlug
            );

            if (!alreadyInInbox) {
                const carInboxTicket: InboxItem = {
                    id: `inbox_car_${Date.now()}`,
                    type: 'car_model',
                    source: 'user_garage',
                    carBrand: params.brand,
                    carModel: params.model,
                    engine: params.engine,
                    year: params.year,
                    specs: {
                        vin: params.vin,
                        bodyClass: params.bodyClass,
                        displacementL: params.displacementL,
                        fuel: params.fuel,
                        transmission: params.transmission,
                        driveType: params.driveType,
                        engineCode: params.engineCode,
                        color: params.color,
                    },
                    submittedBy: user?.email || 'Пользователь',
                    submittedAt: 'Только что',
                    note: `Пользователь добавил авто в гараж. Требуется подтвердить включение модели в общий каталог.`,
                };
                state.inbox.unshift(carInboxTicket);
            }
        }

        this.saveState(state);
        return newCar;
    },

    addServiceRecord(params: {
        carId: string;
        title: string;
        date: string;
        mileage: number;
        items: AppServiceItem[];
    }): AppServiceRecord {
        const state = this.getState();
        const car = state.cars.find((c) => c.id === params.carId);
        const user = state.users.find((u) => u.id === car?.userId);

        const newRecord: AppServiceRecord = {
            id: `rec_${Date.now().toString().slice(-4)}`,
            carId: params.carId,
            title: params.title,
            date: params.date,
            mileage: params.mileage,
            items: params.items,
        };

        state.serviceRecords.unshift(newRecord);

        if (car && params.mileage > car.mileage) {
            car.mileage = params.mileage;
        }

        if (car) {
            params.items.forEach((item) => {
                const inboxItem: InboxItem = {
                    id: `inbox_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                    type: 'part',
                    source: 'user_service',
                    carBrand: car.brand,
                    carModel: car.model,
                    engine: car.engine,
                    nodeTitle: item.name,
                    partBrand: item.brand,
                    partArticle: item.article,
                    partName: item.name,
                    isOem: Boolean(item.isOem),
                    suggestedScore: item.isOem ? 90 : 35,
                    occurrencesCount: 1,
                    submittedBy: user?.email || 'Пользователь',
                    submittedAt: 'Только что',
                    note: `Установлено на пробеге ${params.mileage.toLocaleString('ru-RU')} км`,
                };
                state.inbox.unshift(inboxItem);
            });
        }

        this.saveState(state);
        return newRecord;
    },

    resolveInboxItem(id: string) {
        const state = this.getState();
        state.inbox = state.inbox.filter((item) => item.id !== id);
        this.saveState(state);
    },

    // Одобрить деталь в каталог
    approveInboxItem(id: string) {
        const state = this.getState();
        const item = state.inbox.find((i) => i.id === id);
        if (!item) return;

        if (item.type === 'car_model') {
            this.approveCarModel(id);
            return;
        }

        const brandSlug = normalizeSlug(item.carBrand);
        const modelSlug = normalizeSlug(item.carModel);

        let targetNode = state.catalogNodes.find(
            (n) => n.brandSlug === brandSlug && n.modelSlug === modelSlug && n.title.toLowerCase() === (item.nodeTitle || '').toLowerCase()
        );

        if (!targetNode) {
            targetNode = {
                id: `${brandSlug}-${modelSlug}-${Date.now()}`,
                brandSlug,
                modelSlug,
                title: item.nodeTitle || 'Расходники ТО',
                category: 'service',
                engineCompatibility: ['all'],
                items: [],
            };
            state.catalogNodes.push(targetNode);
        }

        const existingPart = targetNode.items.find(
            (p) => p.article.toLowerCase() === (item.partArticle || '').toLowerCase()
        );

        if (existingPart) {
            existingPart.installationsCount += 1;
        } else {
            targetNode.items.push({
                id: `p_${Date.now()}`,
                brand: item.partBrand || 'OEM',
                article: item.partArticle || '000000',
                name: item.partName || 'Деталь',
                isOem: Boolean(item.isOem),
                isVerified: false,
                installationsCount: item.occurrencesCount || 1,
                compatibilityScore: item.suggestedScore || 50,
                note: item.note,
            });
        }

        state.inbox = state.inbox.filter((i) => i.id !== id);
        this.saveState(state);
    },

    // Одобрить модель автомобиля в Master Catalog
    approveCarModel(id: string) {
        const state = this.getState();
        const item = state.inbox.find((i) => i.id === id);
        if (!item) return;

        const bSlug = normalizeSlug(item.carBrand);
        const mSlug = normalizeSlug(item.carModel);

        const exists = state.masterModels.some(
            (m) => m.brandSlug === bSlug && m.modelSlug === mSlug
        );

        if (!exists) {
            state.masterModels.push({
                brandSlug: bSlug,
                brandName: item.carBrand,
                modelSlug: mSlug,
                modelName: item.carModel,
                years: `${item.year || '2020'} – н.в.`,
                verified: true,
            });
        }

        state.inbox = state.inbox.filter((i) => i.id !== id);
        this.saveState(state);
    },
};