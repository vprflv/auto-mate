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
                id: 'fluids',
                name: 'Масла и техжидкости',
                hasArticles: true,
                children: [
                    { id: 'fluids-engine', name: 'Моторное масло', parentId: 'fluids', hasArticles: true },
                    { id: 'fluids-gearbox', name: 'Трансмиссия', parentId: 'fluids', hasArticles: true },
                    { id: 'fluids-transfer', name: 'Раздатка', parentId: 'fluids', hasArticles: true },
                    { id: 'fluids-diff', name: 'Редуктор', parentId: 'fluids', hasArticles: true },
                    { id: 'fluids-coolant', name: 'Антифриз', parentId: 'fluids', hasArticles: true },
                    { id: 'fluids-brake', name: 'Тормозная жидкость', parentId: 'fluids', hasArticles: true },
                    { id: 'fluids-psf', name: 'ГУР', parentId: 'fluids', hasArticles: true },
                ],
            },
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
                id: 'art-fluid-1',
                oem: 'FLUID-ENGINE',
                name: 'Моторное масло',
                brand: 'Оригинал / аналог',
                quantity: 1,
                nodeId: 'fluids-engine',
                note: 'Справочно. Допуск и вязкость сверьте по VIN',
            },
            {
                id: 'art-fluid-2',
                oem: 'FLUID-GEARBOX',
                name: 'Масло КПП / АКПП',
                brand: 'Оригинал / аналог',
                quantity: 1,
                nodeId: 'fluids-gearbox',
                note: 'Справочно. Тип масла зависит от коробки',
            },
            {
                id: 'art-fluid-3',
                oem: 'FLUID-TRANSFER',
                name: 'Масло раздаточной коробки',
                brand: 'Оригинал / аналог',
                quantity: 1,
                nodeId: 'fluids-transfer',
                note: 'Если раздатки нет — позицию можно не сохранять',
            },
            {
                id: 'art-fluid-4',
                oem: 'FLUID-DIFF',
                name: 'Масло редуктора',
                brand: 'Оригинал / аналог',
                quantity: 1,
                nodeId: 'fluids-diff',
                note: 'Справочно. Проверьте по VIN',
            },
            {
                id: 'art-fluid-5',
                oem: 'FLUID-COOLANT',
                name: 'Антифриз',
                brand: 'Оригинал / аналог',
                quantity: 1,
                nodeId: 'fluids-coolant',
                note: 'Справочно. Цвет и допуск сверьте по сервисной книге',
            },
            {
                id: 'art-fluid-6',
                oem: 'FLUID-BRAKE',
                name: 'Тормозная жидкость',
                brand: 'Оригинал / аналог',
                quantity: 1,
                nodeId: 'fluids-brake',
                note: 'Обычно DOT 4. Уточните по VIN',
            },
            {
                id: 'art-fluid-7',
                oem: 'FLUID-PSF',
                name: 'Жидкость ГУР',
                brand: 'Оригинал / аналог',
                quantity: 1,
                nodeId: 'fluids-psf',
                note: 'Если ГУР электрический — позицию можно не сохранять',
            },
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