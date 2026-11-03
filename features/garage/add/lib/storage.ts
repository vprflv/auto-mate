import { Car } from '@/types';
import {STORAGE_KEYS} from "@/features/garage/add/lib/config/storage";


export function getGarageCars(): Car[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.garage);
    return data ? JSON.parse(data) : [];
}

export function saveGarageCars(cars: Car[]) {
    localStorage.setItem(STORAGE_KEYS.garage, JSON.stringify(cars));
    window.dispatchEvent(new Event('garage-updated'));
}

export function addCarToGarage(car: Car) {
    const cars = getGarageCars();
    cars.push(car);
    saveGarageCars(cars);
}