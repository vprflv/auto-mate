// features/catalog/lib/providers/mock.ts


import {CatalogProvider, CatalogProviderParams, VehicleCatalog} from "@/types/catalog/catalog";

const mockCatalogs: Record<string, Omit<VehicleCatalog, 'carId' | 'fetchedAt'>> = {
    // Пример для Toyota Camry
    'toyota-camry': {
        vin: undefined,
        make: 'Toyota',
        model: 'Camry',
        year: 2019,
        source: 'mock',
        nodes: [
            {
                id: 'engine',
                name: 'Двигатель',
                hasArticles: false,
                children: [
                    {
                        id: 'engine-timing',
                        name: 'ГРМ',
                        parentId: 'engine',
                        hasArticles: true,
                    },
                    {
                        id: 'engine-filters',
                        name: 'Фильтры',
                        parentId: 'engine',
                        hasArticles: true,
                    },
                ],
            },
            {
                id: 'brakes',
                name: 'Тормозная система',
                hasArticles: false,
                children: [
                    {
                        id: 'brakes-front',
                        name: 'Передние тормоза',
                        parentId: 'brakes',
                        hasArticles: true,
                    },
                    {
                        id: 'brakes-rear',
                        name: 'Задние тормоза',
                        parentId: 'brakes',
                        hasArticles: true,
                    },
                ],
            },
            {
                id: 'suspension',
                name: 'Подвеска',
                hasArticles: true,
            },
        ],
        articles: [
            {
                id: 'art-1',
                oem: '04152-YZZA1',
                name: 'Фильтр масляный',
                brand: 'Toyota',
                quantity: 1,
                nodeId: 'engine-filters',
            },
            {
                id: 'art-2',
                oem: '04465-33470',
                name: 'Колодки тормозные передние',
                brand: 'Toyota',
                quantity: 1,
                nodeId: 'brakes-front',
                note: 'Комплект',
            },
            {
                id: 'art-3',
                oem: '04466-33450',
                name: 'Колодки тормозные задние',
                brand: 'Toyota',
                quantity: 1,
                nodeId: 'brakes-rear',
            },
            {
                id: 'art-4',
                oem: '13568-09040',
                name: 'Ремень ГРМ',
                brand: 'Toyota',
                nodeId: 'engine-timing',
            },
            {
                id: 'art-5',
                oem: '48510-0K070',
                name: 'Амортизатор передний левый',
                brand: 'Toyota',
                nodeId: 'suspension',
            },
        ],
    },
};

export const mockCatalogProvider: CatalogProvider = {
    async getCatalog(params: CatalogProviderParams): Promise<VehicleCatalog> {
        // Имитируем задержку сети
        await new Promise((r) => setTimeout(r, 600));

        const key = `${params.make.toLowerCase()}-${params.model.toLowerCase()}`;
        const base = mockCatalogs[key] ?? mockCatalogs['toyota-camry']; // fallback

        return {
            ...base,
            carId: params.carId,
            vin: params.vin,
            make: params.make,
            model: params.model,
            year: params.year,
            fetchedAt: new Date().toISOString(),
        };
    },
};