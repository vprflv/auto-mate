import type { AppCar, CarSpecs } from '../types';

import { storage } from '../storage';
import { queueCarCatalogReview } from '../carCatalogReview';

import { getGarageCars } from '@/features/garage/add/lib/storage';
import { resolveCarCatalogIdentity } from '@/features/catalog/lib/carCatalogIdentity';

export interface AddCarParams {
    garageCarId?: string;
    userId: string;
    brand: string;
    model: string;
    year: number;
    vin?: string;
    plateNumber?: string;
    mileage: number;
    engine: string;
    engineCode?: string;
    bodyClass?: string;
    displacementL?: string;
    fuel?: string;
    transmission?: string;
    driveType?: string;
    color?: string;
    carSpecs?: CarSpecs;
}

export function addCar(params: AddCarParams): AppCar {
    const state = storage.getState();

    // Одна личная машина — одна регистрация.
    // Повторный вызов с тем же ID не увеличивает счётчики.
    const existingCar = params.garageCarId
        ? state.cars.find(
            car => car.id === params.garageCarId
        )
        : undefined;

    if (existingCar) {
        return existingCar;
    }

    const garageCar = params.garageCarId
        ? getGarageCars().find(
            car => car.id === params.garageCarId
        )
        : undefined;

    const identity = garageCar
        ? resolveCarCatalogIdentity(
            garageCar,
            state.masterModels
        )
        : null;

    if (
        garageCar?.catalogModificationId &&
        !identity
    ) {
        throw new Error(
            'Не удалось подтвердить выбранную модификацию. Выберите её повторно.'
        );
    }

    const user = state.users.find(
        candidate => candidate.id === params.userId
    );

    const brand = params.brand.trim();
    const model = params.model.trim();

    const carSpecs: CarSpecs = {
        ...params.carSpecs,
        vin: params.vin ?? params.carSpecs?.vin,
        bodyClass:
            params.bodyClass ?? params.carSpecs?.bodyClass,
        displacementL:
            params.displacementL ??
            params.carSpecs?.displacementL,
        fuel: params.fuel ?? params.carSpecs?.fuel,
        transmission:
            params.transmission ??
            params.carSpecs?.transmission,
        driveType:
            params.driveType ?? params.carSpecs?.driveType,
        engineCode:
            params.engineCode ?? params.carSpecs?.engineCode,
        color: params.color ?? params.carSpecs?.color,
    };

    const fallbackEngine = [
        carSpecs.displacementL
            ? `${carSpecs.displacementL} л`
            : '',
        carSpecs.fuel,
    ]
        .filter(Boolean)
        .join(' ');

    const newCar: AppCar = {
        id: params.garageCarId ?? `car_${crypto.randomUUID()}`,
        userId: params.userId,
        ownerName: user?.name || 'Пользователь',
        brand,
        model,
        title: `${brand} ${model}`,
        year: params.year,
        vin: params.vin || `VIN${Date.now().toString().slice(-6)}`,
        plateNumber: params.plateNumber,
        mileage: params.mileage,
        engine: params.engine.trim() || fallbackEngine,
        engineCode: carSpecs.engineCode,
        transmission: carSpecs.transmission,
        drivetrain: carSpecs.driveType,
        carSpecs,
        createdAt: new Date().toLocaleDateString('ru-RU'),
    };

    state.cars.unshift(newCar);

    if (user) {
        user.carsCount = (user.carsCount || 0) + 1;
    }

    if (identity) {
        // Используем существующие записи.
        // Новую модель или модификацию здесь не создаём.
        identity.model.registeredCount =
            (identity.model.registeredCount || 0) + 1;

        identity.modification.registeredCount =
            (identity.modification.registeredCount || 0) + 1;
    }

    // Для готовой модификации существующий обработчик
    // пропустит создание заявки и уберёт старую связь
    // с ожидающей заявкой, если она была.
    queueCarCatalogReview(state, {
        garageCarId: params.garageCarId,
        userId: params.userId,
        brand,
        model,
        year: params.year,
        engine: params.engine,
        carSpecs,
    });

    storage.saveState(state);

    return newCar;
}