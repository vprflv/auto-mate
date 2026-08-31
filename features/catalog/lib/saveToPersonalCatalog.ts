// features/catalog/lib/saveToPersonalCatalog.ts
import { Car, CarPartItem, CarParts, PartCategory } from '@/types';
import {CatalogArticle} from "@/types/catalog/catalog";


const STORAGE_KEY = 'automate-garage';

/**
 * Простое определение категории по названию узла / детали
 * (потом можно сделать умнее)
 */
export function detectCategory(article: CatalogArticle, nodeName?: string): PartCategory {
    const text = `${article.name} ${nodeName || ''} ${article.oem}`.toLowerCase();

    // Тормоза
    if (
        text.includes('тормоз') ||
        text.includes('колодк') ||
        text.includes('диск торм') ||
        text.includes('суппорт') ||
        text.includes('тормозной') ||
        text.includes('abs') ||
        text.includes('барабан')
    ) {
        return 'brakes';
    }

    // Фильтры
    if (
        text.includes('фильтр') ||
        text.includes('filter') ||
        text.includes('масляный') ||
        text.includes('воздушный') ||
        text.includes('салонный') ||
        text.includes('топливный фильтр')
    ) {
        return 'filters';
    }

    // Подвеска
    if (
        text.includes('амортизатор') ||
        text.includes('стойка') ||
        text.includes('пружина') ||
        text.includes('рычаг') ||
        text.includes('сайлент') ||
        text.includes('шаровая') ||
        text.includes('подвеск') ||
        text.includes('стабилизатор') ||
        text.includes('втулка') ||
        text.includes('опора')
    ) {
        return 'suspension';
    }

    // Двигатель
    if (
        text.includes('грм') ||
        text.includes('ремень') ||
        text.includes('цепь') ||
        text.includes('поршень') ||
        text.includes('клапан') ||
        text.includes('прокладк') ||
        text.includes('двигател') ||
        text.includes('гбц') ||
        text.includes('маслосъём') ||
        text.includes('натяжитель') ||
        text.includes('ролик')
    ) {
        return 'engine';
    }

    // Трансмиссия
    if (
        text.includes('коробк') ||
        text.includes('сцеплен') ||
        text.includes('трансмисс') ||
        text.includes('шрус') ||
        text.includes('привод') ||
        text.includes('дифференциал') ||
        text.includes('мкпп') ||
        text.includes('акпп')
    ) {
        return 'transmission';
    }

    // Электрика
    if (
        text.includes('датчик') ||
        text.includes('генератор') ||
        text.includes('стартер') ||
        text.includes('провод') ||
        text.includes('катушка') ||
        text.includes('свеча') ||
        text.includes('реле') ||
        text.includes('блок управления') ||
        text.includes('электри')
    ) {
        return 'electrical';
    }

    // Кузов
    if (
        text.includes('бампер') ||
        text.includes('крыло') ||
        text.includes('дверь') ||
        text.includes('капот') ||
        text.includes('зеркало') ||
        text.includes('фара') ||
        text.includes('фонарь') ||
        text.includes('кузов') ||
        text.includes('решетка')
    ) {
        return 'body';
    }

    // Расходники / ТО
    if (
        text.includes('масло') ||
        text.includes('антифриз') ||
        text.includes('жидкость') ||
        text.includes('свеча зажигания') ||
        text.includes('щётк') ||
        text.includes('дворник')
    ) {
        return 'maintenance';
    }

    return 'other';
}

/**
 * Преобразуем артикул из API-каталога в элемент личного каталога
 */
export function catalogArticleToCarPart(
    article: CatalogArticle,
    options?: {
        category?: PartCategory;
        subcategory?: string;
        nodeName?: string;
    }
): CarPartItem {
    const category =
        options?.category || detectCategory(article, options?.nodeName);

    return {
        id: crypto.randomUUID(),
        category,
        subcategory: options?.subcategory || 'other',
        name: article.name,
        brand: article.brand,
        oemNumber: article.oem,
        quantity: article.quantity || 1,
        notes: article.note,
    };
}

/**
 * Сохраняем запчасть в личный каталог машины
 */
export function saveArticleToPersonalCatalog(
    carId: string,
    article: CatalogArticle,
    options?: {
        category?: PartCategory;
        subcategory?: string;
        nodeName?: string;
    }
): { success: boolean; message: string } {

    try {

        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return { success: false, message: 'Гараж не найден' };
        }



        const cars: Car[] = JSON.parse(raw);
        const carIndex = cars.findIndex((c) => c.id === carId);

        if (carIndex === -1) {
            return { success: false, message: 'Машина не найдена' };
        }

        const car = cars[carIndex];
        const currentItems = car.partsCatalog?.items || [];

        // Проверяем, нет ли уже такого артикула
        const alreadyExists = currentItems.some(
            (item) =>
                item.oemNumber &&
                item.oemNumber.toLowerCase() === article.oem.toLowerCase()
        );

        if (alreadyExists) {
            return {
                success: false,
                message: 'Эта запчасть уже есть в вашем каталоге',
            };
        }

        const newItem = catalogArticleToCarPart(article, options);

        const updatedParts: CarParts = {
            items: [...currentItems, newItem],
        };

        cars[carIndex] = {
            ...car,
            partsCatalog: updatedParts,
            updatedAt: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));

        return {
            success: true,
            message: `«${article.name}» добавлена в ваш каталог`,
        };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Ошибка при сохранении' };
    }
}

export function removeArticleFromPersonalCatalog(
    carId: string,
    oem: string
): { success: boolean; message: string } {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return { success: false, message: 'Гараж не найден' };
        }

        const cars: Car[] = JSON.parse(raw);
        const carIndex = cars.findIndex((c) => c.id === carId);

        if (carIndex === -1) {
            return { success: false, message: 'Машина не найдена' };
        }

        const car = cars[carIndex];
        const currentItems = car.partsCatalog?.items || [];
        const nextItems = currentItems.filter(
            (item) => item.oemNumber?.toLowerCase() !== oem.toLowerCase()
        );

        if (nextItems.length === currentItems.length) {
            return { success: false, message: 'Запчасть не найдена в каталоге' };
        }

        cars[carIndex] = {
            ...car,
            partsCatalog: { items: nextItems },
            updatedAt: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));

        return { success: true, message: 'Запчасть убрана из вашего каталога' };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Ошибка при удалении' };
    }
}