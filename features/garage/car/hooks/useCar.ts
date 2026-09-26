'use client';

import {
    useCallback,
    useEffect,
    useState,
} from 'react';

import { useRouter } from 'next/navigation';

import {
    Car,
    ServiceRecord,
} from '@/types';

import { STORAGE_KEYS } from '@/features/garage/add/lib/config/storage';

export function useCar(id: string) {
    const router = useRouter();

    const [car, setCar] =
        useState<Car | null>(null);

    const [records, setRecords] =
        useState<ServiceRecord[]>([]);

    const [loading, setLoading] =
        useState(true);

    const reload = useCallback(() => {
        const carsData =
            localStorage.getItem(
                STORAGE_KEYS.garage
            );

        if (carsData) {
            const cars: Car[] =
                JSON.parse(carsData);

            setCar(
                cars.find(
                    (item) =>
                        item.id === id
                ) || null
            );
        } else {
            setCar(null);
        }

        const serviceData =
            localStorage.getItem(
                STORAGE_KEYS.service
            );

        if (serviceData) {
            const allRecords:
                ServiceRecord[] =
                JSON.parse(serviceData);

            setRecords(
                allRecords.filter(
                    (record) =>
                        record.carId === id
                )
            );
        } else {
            setRecords([]);
        }

        setLoading(false);
    }, [id]);

    useEffect(() => {
        reload();

        const handleGarageUpdated =
            () => {
                reload();
            };

        const handleStorage = (
            event: StorageEvent
        ) => {
            if (
                event.key ===
                STORAGE_KEYS.garage ||
                event.key ===
                STORAGE_KEYS.service
            ) {
                reload();
            }
        };

        window.addEventListener(
            'automate:garage-updated',
            handleGarageUpdated
        );

        window.addEventListener(
            'storage',
            handleStorage
        );

        window.addEventListener(
            'pageshow',
            reload
        );

        return () => {
            window.removeEventListener(
                'automate:garage-updated',
                handleGarageUpdated
            );

            window.removeEventListener(
                'storage',
                handleStorage
            );

            window.removeEventListener(
                'pageshow',
                reload
            );
        };
    }, [reload]);

    const updateCar = (
        updated: Car
    ) => {
        const carsData =
            localStorage.getItem(
                STORAGE_KEYS.garage
            );

        if (!carsData) return;

        const cars: Car[] =
            JSON.parse(carsData);

        const next = cars.map(
            (item) =>
                item.id === updated.id
                    ? updated
                    : item
        );

        localStorage.setItem(
            STORAGE_KEYS.garage,
            JSON.stringify(next)
        );

        setCar(updated);

        window.dispatchEvent(
            new Event(
                'automate:garage-updated'
            )
        );
    };

    const deleteCar = () => {
        if (!car) return;

        const carsData =
            localStorage.getItem(
                STORAGE_KEYS.garage
            );

        if (carsData) {
            const cars: Car[] =
                JSON.parse(carsData);

            localStorage.setItem(
                STORAGE_KEYS.garage,
                JSON.stringify(
                    cars.filter(
                        (item) =>
                            item.id !== id
                    )
                )
            );
        }

        const serviceData =
            localStorage.getItem(
                STORAGE_KEYS.service
            );

        if (serviceData) {
            const allRecords:
                ServiceRecord[] =
                JSON.parse(serviceData);

            localStorage.setItem(
                STORAGE_KEYS.service,
                JSON.stringify(
                    allRecords.filter(
                        (record) =>
                            record.carId !== id
                    )
                )
            );
        }

        router.push('/garage');
    };

    const updateRecord = (
        updated: ServiceRecord
    ) => {
        const serviceData =
            localStorage.getItem(
                STORAGE_KEYS.service
            );

        if (!serviceData) return;

        const allRecords:
            ServiceRecord[] =
            JSON.parse(serviceData);

        const next =
            allRecords.map(
                (record) =>
                    record.id === updated.id
                        ? updated
                        : record
            );

        localStorage.setItem(
            STORAGE_KEYS.service,
            JSON.stringify(next)
        );

        setRecords(
            next.filter(
                (record) =>
                    record.carId === id
            )
        );
    };

    const deleteRecord = (
        recordId: string
    ) => {
        const serviceData =
            localStorage.getItem(
                STORAGE_KEYS.service
            );

        if (!serviceData) return;

        const allRecords:
            ServiceRecord[] =
            JSON.parse(serviceData);

        const next =
            allRecords.filter(
                (record) =>
                    record.id !== recordId
            );

        localStorage.setItem(
            STORAGE_KEYS.service,
            JSON.stringify(next)
        );

        setRecords(
            next.filter(
                (record) =>
                    record.carId === id
            )
        );
    };

    return {
        car,
        records,
        loading,

        updateCar,
        deleteCar,

        updateRecord,
        deleteRecord,
    };
}