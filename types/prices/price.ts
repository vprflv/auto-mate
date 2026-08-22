// types/price.ts

export type PriceOffer = {
    id: string;
    shop: string;              // "Exist", "Emex", "Avito", "Яндекс"
    title: string;             // что ищем / подпись
    price?: number;            // пока часто не будет
    currency?: 'RUB';
    url: string;
    inStock?: boolean;
    deliveryDays?: number;
    note?: string;             // "Поиск по артикулу", "Проверьте применимость"
    source: 'web' | 'api' | 'mock' | 'ai';
};

export type PartSearchRequest = {
    carId: string;
    make: string;
    model: string;
    year: number;
    vin?: string;
    name: string;
    brand?: string;
    oemNumber?: string;
    analogNumber?: string;
};

export interface PriceProvider {
    search(request: PartSearchRequest): Promise<PriceOffer[]>;
}