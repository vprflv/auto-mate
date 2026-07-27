'use client';

import { useEffect, useState } from 'react';
import { Car } from '@/types';
import {getGarageCars, saveGarageCars} from "@/features/garage/add/lib/storage";


function pluralCars(count: number): string {
    if (count === 0) return 'Пока пусто';
    if (count === 1) return '1 автомобиль';
    if (count >= 2 && count <= 4) return `${count} автомобиля`;
    return `${count} автомобилей`;
}

export function useGarage() {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setCars(getGarageCars());
        setLoading(false);
    }, []);

    const removeCar = (id: string) => {
        const confirmed = confirm('Удалить этот автомобиль из гаража?');
        if (!confirmed) return;

        const updated = cars.filter((car) => car.id !== id);
        setCars(updated);
        saveGarageCars(updated);
    };

    return {
        cars,
        loading,
        removeCar,
        carsLabel: pluralCars(cars.length),
    };
}