'use client';

import { toast } from 'sonner';

import type {
    Car,
    CarPartItem,
    CarParts,
} from '@/types';

import type {
    CarFluidItem,
    CarFluids,
} from '@/types/oil';

import type { CarSummaryInfo } from '@/features/garage/components/CarPartsCard';

type Params = {
    car: Car;
    onUpdateCar: (car: Car) => void;
    onDeleteRecord: (id: string) => void;
    onDeleteCar: () => void;
};

// Поддерживаем текущий формат { items: [] }
// и старый формат каталога в виде массива.
function getSafeCatalog<T>(
    data: unknown
): { items: T[] } {
    if (Array.isArray(data)) {
        return { items: data as T[] };
    }

    if (
        data &&
        typeof data === 'object' &&
        'items' in data &&
        Array.isArray(data.items)
    ) {
        return data as { items: T[] };
    }

    return { items: [] };
}

function getCarInfo(car: Car): CarSummaryInfo {
    const rawCar = car as Record<string, any>;

    const nestedSpecs =
        rawCar.specs ||
        rawCar.characteristics ||
        rawCar.details ||
        {};

    const nestedExtra =
        rawCar.extra ||
        rawCar.extraInfo ||
        {};

    const mergedSpecs: Record<string, any> = {
        ...nestedExtra,
        ...nestedSpecs,
        ...rawCar,
    };

    // Исключаем тяжёлые данные из характеристик.
    delete mergedSpecs.photos;
    delete mergedSpecs.parts;
    delete mergedSpecs.partsCatalog;
    delete mergedSpecs.fluids;
    delete mergedSpecs.records;

    return {
        id: car.id,

        brand:
            car.make ||
            rawCar.brand ||
            'Неизвестная марка',

        model:
            car.model ||
            'Неизвестная модель',

        year:
            car.year ||
            mergedSpecs.year,

        vin:
            car.vin ||
            mergedSpecs.vinCode ||
            mergedSpecs.vin ||
            '',

        engine:
            mergedSpecs.engine ||
            mergedSpecs.engineVolume ||
            mergedSpecs.engineCapacity ||
            mergedSpecs.displacement ||
            mergedSpecs.motor ||
            mergedSpecs.modification ||
            '',

        engineCode:
            mergedSpecs.engineCode ||
            mergedSpecs.engine_code ||
            mergedSpecs.engineModel ||
            '',

        drivetrain:
            mergedSpecs.drive ||
            mergedSpecs.drivetrain ||
            mergedSpecs.driveType ||
            mergedSpecs.wheelDrive ||
            mergedSpecs.privod ||
            '',

        transmission:
            mergedSpecs.transmission ||
            mergedSpecs.gearbox ||
            mergedSpecs.transmissionType ||
            mergedSpecs.kpp ||
            '',

        carSpecs: mergedSpecs,
    };
}

export function useCarSectionContent({
                                         car,
                                         onUpdateCar,
                                         onDeleteRecord,
                                         onDeleteCar,
                                     }: Params) {
    const carTitle =
        car.nickname || `${car.make} ${car.model}`;

    const carInfo = getCarInfo(car);

    const legacyParts = (
        car as Car & { parts?: unknown }
    ).parts;

    const partsCatalog = getSafeCatalog<CarPartItem>(
        car.partsCatalog || legacyParts
    );

    const fluidsCatalog = getSafeCatalog<CarFluidItem>(
        car.fluids
    );

    const updateCar = (changes: Partial<Car>) => {
        onUpdateCar({
            ...car,
            ...changes,
            updatedAt: new Date().toISOString(),
        });
    };

    const updatePhotos = (photos: string[]) => {
        updateCar({ photos });
    };

    const updateParts = (partsCatalog: CarParts) => {
        updateCar({ partsCatalog });
    };

    const updateFluids = (fluids: CarFluids) => {
        updateCar({ fluids });
    };

    const requestDeleteCar = () => {
        toast.warning(`Удалить ${carTitle}?`, {
            description:
                'Машина и связанные данные пропадут из гаража. Это нельзя отменить.',

            duration: Infinity,

            action: {
                label: 'Удалить',
                onClick: () => {
                    onDeleteCar();

                    toast.success(
                        `${carTitle} удалена из гаража`
                    );
                },
            },

            cancel: {
                label: 'Отмена',
                onClick: () => {},
            },
        });
    };

    const requestDeleteRecord = (id: string) => {
        toast.warning('Удалить запись ТО?', {
            description:
                'История обслуживания по этой записи будет удалена.',

            duration: Infinity,

            action: {
                label: 'Удалить',
                onClick: () => {
                    onDeleteRecord(id);
                    toast.success('Запись ТО удалена');
                },
            },

            cancel: {
                label: 'Отмена',
                onClick: () => {},
            },
        });
    };

    return {
        carInfo,
        partsCatalog,
        fluidsCatalog,
        updatePhotos,
        updateParts,
        updateFluids,
        requestDeleteCar,
        requestDeleteRecord,
    };
}