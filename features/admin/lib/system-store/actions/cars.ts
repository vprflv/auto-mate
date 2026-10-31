import type { AppCar, CarSpecs } from '../types';
import { storage } from '../storage';
import { queueCarCatalogReview } from '../carCatalogReview';

export interface AddCarParams {
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

    const user = state.users.find(
        candidate => candidate.id === params.userId
    );

    const brand = params.brand.trim();
    const model = params.model.trim();

    const carSpecs: CarSpecs = {
        ...params.carSpecs,
        vin: params.vin ?? params.carSpecs?.vin,
        bodyClass: params.bodyClass ?? params.carSpecs?.bodyClass,
        displacementL:
            params.displacementL ?? params.carSpecs?.displacementL,
        fuel: params.fuel ?? params.carSpecs?.fuel,
        transmission:
            params.transmission ?? params.carSpecs?.transmission,
        driveType: params.driveType ?? params.carSpecs?.driveType,
        engineCode: params.engineCode ?? params.carSpecs?.engineCode,
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
        id: `car_${crypto.randomUUID()}`,
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
        user.carsCount += 1;
    }

    queueCarCatalogReview(state, {
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