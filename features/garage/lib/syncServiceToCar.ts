import {
    Car,
    CarPartItem,
    CarParts,
    ServicePart,
} from '@/types';

import {
    getGarageCars,
    saveGarageCars,
} from '@/features/garage/add/lib/storage';

import { detectSubcategory } from '@/features/garage/lib/detectSubcategory';

import {
    CarFluidItem,
    CarFluids,
} from '@/types/oil';

import {
    getFluidCategoryLabel,
} from '@/features/garage/lib/getFluidCategories';

function upsertFluid(
    fluids: CarFluids,
    part: ServicePart
): CarFluids {
    /*
     * Для жидкости категория обязательна.
     */
    if (!part.fluidCategory || !part.name.trim()) {
        return fluids;
    }

    const items = [
        ...(fluids.items || []),
    ];

    const category = part.fluidCategory;
    const name = part.name.trim();

    const newItem: CarFluidItem = {
        id: part.id,
        category,
        categoryLabel:
            getFluidCategoryLabel(category),
        name,
        brand:
            part.brand?.trim() || undefined,
        spec:
            part.oemNumber?.trim() || undefined,
        volume:
            part.quantity > 0
                ? String(part.quantity)
                : undefined,
    };

    const normalizedName =
        name.toLowerCase();

    const index = items.findIndex((item) => {
        /*
         * Если это та же запись ТО —
         * обновляем её.
         */
        if (item.id === part.id) {
            return true;
        }

        /*
         * Если такая жидкость уже есть
         * в этой категории — обновляем её.
         */
        return (
            item.category === category &&
            item.name
                .trim()
                .toLowerCase() ===
            normalizedName
        );
    });

    if (index >= 0) {
        items[index] = {
            ...items[index],
            ...newItem,
            categoryLabel:
                newItem.categoryLabel ||
                items[index].categoryLabel,
        };
    } else {
        items.push(newItem);
    }

    return {
        items,
    };
}

function upsertPart(
    parts: CarParts,
    part: ServicePart
): CarParts {
    const category =
        part.partCategory || 'other';

    const name =
        part.name.trim();

    if (!name) {
        return parts;
    }

    const subcategory =
        part.subcategory?.trim() ||
        detectSubcategory(
            category,
            name
        ) ||
        'other';

    const items = [
        ...(parts.items || []),
    ];

    const newItem: CarPartItem = {
        id: part.id,
        category,
        subcategory,
        name,
        brand:
            part.brand?.trim() || undefined,
        oemNumber:
            part.oemNumber?.trim() || undefined,
        quantity:
            part.quantity > 0
                ? part.quantity
                : 1,
    };

    const normalizedName =
        name.toLowerCase();

    const normalizedOem =
        newItem.oemNumber?.toLowerCase();

    const index = items.findIndex(
        (item) => {
            if (
                item.id === newItem.id
            ) {
                return true;
            }

            if (
                normalizedOem &&
                item.oemNumber
            ) {
                return (
                    item.oemNumber
                        .trim()
                        .toLowerCase() ===
                    normalizedOem
                );
            }

            return (
                item.category ===
                category &&
                item.name
                    .trim()
                    .toLowerCase() ===
                normalizedName
            );
        }
    );

    if (index >= 0) {
        items[index] = {
            ...items[index],
            ...newItem,
        };
    } else {
        items.push(newItem);
    }

    return {
        items,
    };
}

export function syncServicePartsToCar(
    carId: string,
    parts: ServicePart[]
): Car | null {
    const cars =
        getGarageCars();

    const carIndex =
        cars.findIndex(
            (car) =>
                car.id === carId
        );

    if (carIndex < 0) {
        return null;
    }

    const currentCar =
        cars[carIndex];

    let fluids: CarFluids = {
        items: [
            ...(currentCar.fluids?.items ||
                []),
        ],
    };

    let partsCatalog: CarParts = {
        items: [
            ...(currentCar.partsCatalog
                ?.items || []),
        ],
    };

    for (const part of parts) {
        /*
         * ВАЖНО:
         * жидкость обрабатываем только здесь.
         */
        if (
            part.itemType === 'fluid'
        ) {
            fluids =
                upsertFluid(
                    fluids,
                    part
                );

            continue;
        }

        /*
         * Запчасть обрабатываем только
         * как part.
         */
        if (
            part.itemType === 'part'
        ) {
            partsCatalog =
                upsertPart(
                    partsCatalog,
                    part
                );
        }
    }

    const updatedCar: Car = {
        ...currentCar,

        fluids,

        partsCatalog,

        updatedAt:
            new Date().toISOString(),
    };

    cars[carIndex] =
        updatedCar;

    saveGarageCars(cars);

    if (
        typeof window !==
        'undefined'
    ) {
        window.dispatchEvent(
            new Event(
                'automate:garage-updated'
            )
        );
    }

    return updatedCar;
}