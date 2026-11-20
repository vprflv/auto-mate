import {
    Car,
    ServiceRecord,
} from '@/types';

import {
    getGarageCars,
    saveGarageCars,
} from '@/features/garage/add/lib/storage';

import {
    STORAGE_KEYS,
} from '@/features/garage/add/lib/config/storage';

export function getLatestServiceRecord(
    records: ServiceRecord[],
    carId: string,
): ServiceRecord | undefined {
    return records.filter(record => record.carId === carId).reduce<ServiceRecord | undefined>(
        (latest, record) => !latest || new Date(record.date).getTime() > new Date(latest.date).getTime()
            ? record
            : latest,
        undefined,
    );
}

export function syncCurrentMileageFromLatestService(
    carId: string,
    editedRecordId: string
): Car | null {
    const cars = getGarageCars();

    const carIndex = cars.findIndex(
        (car) => car.id === carId
    );

    if (carIndex < 0) {
        return null;
    }

    const serviceData =
        localStorage.getItem(
            STORAGE_KEYS.service
        );

    if (!serviceData) {
        return cars[carIndex];
    }

    const allRecords: ServiceRecord[] =
        JSON.parse(serviceData);

    const latestRecord = getLatestServiceRecord(allRecords, carId);

    /*
     * Обновляем текущий пробег только тогда,
     * когда именно отредактированное ТО
     * является последним по дате.
     */
    if (
        latestRecord?.id !== editedRecordId
    ) {
        return cars[carIndex];
    }

    /*
     * Если в последнем ТО пробег не указан,
     * текущий пробег автомобиля не меняем.
     */
    if (
        latestRecord.mileage === undefined
    ) {
        return cars[carIndex];
    }

    const updatedCar: Car = {
        ...cars[carIndex],

        currentMileage:
        latestRecord.mileage,

        updatedAt:
            new Date().toISOString(),
    };

    cars[carIndex] =
        updatedCar;

    saveGarageCars(cars);

    if (
        typeof window !== 'undefined'
    ) {
        window.dispatchEvent(
            new Event(
                'automate:garage-updated'
            )
        );
    }

    return updatedCar;
}
