// features/catalog/lib/providers/ruleBased.ts


import {
    CatalogArticle,
    CatalogNode,
    CatalogProvider,
    CatalogProviderParams,
    VehicleCatalog
} from "@/types/catalog/catalog";

function uid(prefix: string) {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function buildNodes(): CatalogNode[] {
    return [
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
            id: 'maintenance',
            name: 'Расходники ТО',
            hasArticles: true,
            children: [
                { id: 'maintenance-filters', name: 'Фильтры', parentId: 'maintenance', hasArticles: true },
                { id: 'maintenance-ignition', name: 'Зажигание', parentId: 'maintenance', hasArticles: true },
                { id: 'maintenance-other', name: 'Прочее ТО', parentId: 'maintenance', hasArticles: true },
            ],
        },
        {
            id: 'brakes',
            name: 'Тормозная система',
            hasArticles: true,
            children: [
                { id: 'brakes-front', name: 'Передние тормоза', parentId: 'brakes', hasArticles: true },
                { id: 'brakes-rear', name: 'Задние тормоза', parentId: 'brakes', hasArticles: true },
            ],
        },
        {
            id: 'engine',
            name: 'Двигатель',
            hasArticles: true,
            children: [
                { id: 'engine-belts', name: 'Ремни / ГРМ', parentId: 'engine', hasArticles: true },
            ],
        },
        {
            id: 'suspension',
            name: 'Подвеска',
            hasArticles: true,
        },
        {
            id: 'body',
            name: 'Кузов и оптика',
            hasArticles: true,
            children: [
                { id: 'body-wipers', name: 'Стеклоочистители', parentId: 'body', hasArticles: true },
            ],
        },
    ];
}

function buildArticles(params: CatalogProviderParams): CatalogArticle[] {
    const label = `${params.make} ${params.model} ${params.year}`;

    const base: Omit<CatalogArticle, 'id'>[] = [
        { oem: 'FLUID-ENGINE', name: `Моторное масло (${label})`, brand: 'Оригинал / аналог', quantity: 1, note: 'Справочно. Допуск и вязкость сверьте по VIN', nodeId: 'fluids-engine' },
        { oem: 'FLUID-GEARBOX', name: `Масло КПП / АКПП (${label})`, brand: 'Оригинал / аналог', quantity: 1, note: 'Справочно. Тип масла зависит от коробки', nodeId: 'fluids-gearbox' },
        { oem: 'FLUID-TRANSFER', name: `Масло раздаточной коробки (${label})`, brand: 'Оригинал / аналог', quantity: 1, note: 'Если раздатки нет — позицию можно не сохранять', nodeId: 'fluids-transfer' },
        { oem: 'FLUID-DIFF', name: `Масло редуктора (${label})`, brand: 'Оригинал / аналог', quantity: 1, note: 'Справочно. Проверьте по VIN', nodeId: 'fluids-diff' },
        { oem: 'FLUID-COOLANT', name: `Антифриз (${label})`, brand: 'Оригинал / аналог', quantity: 1, note: 'Справочно. Цвет и допуск сверьте по сервисной книге', nodeId: 'fluids-coolant' },
        { oem: 'FLUID-BRAKE', name: `Тормозная жидкость (${label})`, brand: 'Оригинал / аналог', quantity: 1, note: 'Обычно DOT 4. Уточните по VIN', nodeId: 'fluids-brake' },
        { oem: 'FLUID-PSF', name: `Жидкость ГУР (${label})`, brand: 'Оригинал / аналог', quantity: 1, note: 'Если ГУР электрический — позицию можно не сохранять', nodeId: 'fluids-psf' },

        {
            oem: 'УТОЧНИТЬ',
            name: `Фильтр масляный (${label})`,
            brand: 'Оригинал / аналог',
            quantity: 1,
            note: 'Справочно. Проверьте по VIN',
            nodeId: 'maintenance-filters',
        },
        {
            oem: 'УТОЧНИТЬ',
            name: `Фильтр воздушный (${label})`,
            brand: 'Оригинал / аналог',
            quantity: 1,
            note: 'Справочно. Проверьте по VIN',
            nodeId: 'maintenance-filters',
        },
        {
            oem: 'УТОЧНИТЬ',
            name: `Фильтр салонный (${label})`,
            brand: 'Оригинал / аналог',
            quantity: 1,
            note: 'Справочно. Проверьте по VIN',
            nodeId: 'maintenance-filters',
        },
        {
            oem: 'УТОЧНИТЬ',
            name: `Свечи зажигания (${label})`,
            brand: 'Оригинал / аналог',
            quantity: 4,
            note: 'Количество зависит от двигателя',
            nodeId: 'maintenance-ignition',
        },
        {
            oem: 'УТОЧНИТЬ',
            name: `Колодки тормозные передние (${label})`,
            brand: 'Оригинал / аналог',
            quantity: 1,
            note: 'Комплект. Проверьте по VIN',
            nodeId: 'brakes-front',
        },
        {
            oem: 'УТОЧНИТЬ',
            name: `Колодки тормозные задние (${label})`,
            brand: 'Оригинал / аналог',
            quantity: 1,
            note: 'Комплект. Проверьте по VIN',
            nodeId: 'brakes-rear',
        },
        {
            oem: 'УТОЧНИТЬ',
            name: `Диск тормозной передний (${label})`,
            brand: 'Оригинал / аналог',
            quantity: 2,
            note: 'Справочно. Проверьте размер и тип',
            nodeId: 'brakes-front',
        },
        {
            oem: 'УТОЧНИТЬ',
            name: `Ремень навесного оборудования (${label})`,
            brand: 'Оригинал / аналог',
            quantity: 1,
            note: 'Не путать с ремнём/цепью ГРМ',
            nodeId: 'engine-belts',
        },
        {
            oem: 'УТОЧНИТЬ',
            name: `Амортизатор передний (${label})`,
            brand: 'Оригинал / аналог',
            quantity: 2,
            note: 'Левый/правый могут отличаться',
            nodeId: 'suspension',
        },
        {
            oem: 'УТОЧНИТЬ',
            name: `Щётки стеклоочистителя (${label})`,
            brand: 'Оригинал / аналог',
            quantity: 2,
            note: 'Проверьте длину под вашу комплектацию',
            nodeId: 'body-wipers',
        },
    ];

    // Для дизеля можно чуть расширить набор
    // Пока просто базовый список для всех

    return base.map((item) => ({
        ...item,
        id: uid('art'),
    }));
}

export const ruleBasedCatalogProvider: CatalogProvider = {
    async getCatalog(params: CatalogProviderParams): Promise<VehicleCatalog> {
        // Имитация “генерации”
        await new Promise((r) => setTimeout(r, 500));

        return {
            carId: params.carId,
            vin: params.vin,
            make: params.make,
            model: params.model,
            year: params.year,
            source: 'ai', // помечаем как AI/справочный
            fetchedAt: new Date().toISOString(),
            nodes: buildNodes(),
            articles: buildArticles(params),
        };
    },
};