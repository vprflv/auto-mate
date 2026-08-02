'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Car, ServiceRecord } from '@/types';

export function useCar(id: string) {
    const router = useRouter();

    const [car, setCar] = useState<Car | null>(null);
    const [records, setRecords] = useState<ServiceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const carsData = localStorage.getItem('automate-garage');
        if (carsData) {
            const cars: Car[] = JSON.parse(carsData);
            setCar(cars.find((c) => c.id === id) || null);
        } else {
            setCar(null);
        }

        const serviceData = localStorage.getItem('automate-service');
        if (serviceData) {
            const allRecords: ServiceRecord[] = JSON.parse(serviceData);
            setRecords(allRecords.filter((r) => r.carId === id));
        } else {
            setRecords([]);
        }

        setLoading(false);
    }, [id]);

    const updateCar = (updated: Car) => {
        const carsData = localStorage.getItem('automate-garage');
        if (!carsData) return;

        const cars: Car[] = JSON.parse(carsData);
        const next = cars.map((c) => (c.id === updated.id ? updated : c));
        localStorage.setItem('automate-garage', JSON.stringify(next));
        setCar(updated); // сразу обновляем UI
    };

    const deleteCar = () => {
        if (!car) return;

        const confirmed = confirm(
            `Удалить ${car.make} ${car.model} из гаража? Это действие нельзя отменить.`
        );
        if (!confirmed) return;

        const carsData = localStorage.getItem('automate-garage');
        if (carsData) {
            const cars: Car[] = JSON.parse(carsData);
            localStorage.setItem(
                'automate-garage',
                JSON.stringify(cars.filter((c) => c.id !== id))
            );
        }



        const serviceData = localStorage.getItem('automate-service');
        if (serviceData) {
            const allRecords: ServiceRecord[] = JSON.parse(serviceData);
            localStorage.setItem(
                'automate-service',
                JSON.stringify(allRecords.filter((r) => r.carId !== id))
            );
        }

        router.push('/garage');
    };

    const updateRecord = (updated: ServiceRecord) => {
        const serviceData = localStorage.getItem('automate-service');
        if (!serviceData) return;

        const allRecords: ServiceRecord[] = JSON.parse(serviceData);
        const next = allRecords.map((r) => (r.id === updated.id ? updated : r));
        localStorage.setItem('automate-service', JSON.stringify(next));
        setRecords(next.filter((r) => r.carId === id));
    };

    const deleteRecord = (recordId: string) => {
        if (!confirm('Удалить эту запись ТО?')) return;

        const serviceData = localStorage.getItem('automate-service');
        if (!serviceData) return;

        const allRecords: ServiceRecord[] = JSON.parse(serviceData);
        const next = allRecords.filter((r) => r.id !== recordId);
        localStorage.setItem('automate-service', JSON.stringify(next));
        setRecords(next.filter((r) => r.carId === id));
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