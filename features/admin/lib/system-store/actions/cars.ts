import {AppCar, CarSpecs, InboxItem} from '../types';
import { storage } from '../storage';
import { normalizeSlug } from '../utils';

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
    const user = state.users.find((u) => u.id === params.userId);

    const newCar: AppCar = {
        id: `car_${Date.now().toString().slice(-4)}`,
        userId: params.userId,
        ownerName: user?.name || 'Пользователь',
        brand: params.brand,
        model: params.model,
        title: `${params.brand} ${params.model}`,
        year: params.year,
        vin: params.vin || `VIN${Date.now().toString().slice(-6)}`,
        plateNumber: params.plateNumber,
        mileage: params.mileage,
        engine: params.engine || `${params.displacementL ? params.displacementL + ' л' : ''} ${params.fuel || ''}`.trim(),
        engineCode: params.engineCode,
        createdAt: new Date().toLocaleDateString('ru-RU'),
    };

    state.cars.unshift(newCar);
    if (user) {
        user.carsCount += 1;
    }

    const bSlug = normalizeSlug(params.brand);
    const mSlug = normalizeSlug(params.model);

    const isExactMatch = state.masterModels.some(
        (m) => m.brandSlug === bSlug && m.modelSlug === mSlug
    );

    if (!isExactMatch) {
        const alreadyInInbox = state.inbox.some(
            (i) => i.type === 'car_model' && normalizeSlug(i.carBrand) === bSlug && normalizeSlug(i.carModel) === mSlug
        );

        if (!alreadyInInbox) {
            const carInboxTicket: InboxItem = {
                id: `inbox_car_${Date.now()}`,
                type: 'car_model',
                source: 'user_manual', // <-- ИСПРАВЛЕНО (было 'user_garage')
                carBrand: params.brand,
                carModel: params.model,
                engine: params.engine || params.displacementL || '',
                carYear: params.year,
                carSpecs: {
                    vin: params.vin,
                    bodyClass: params.bodyClass,
                    displacementL: params.displacementL,
                    fuel: params.fuel,
                    transmission: params.transmission,
                    driveType: params.driveType,
                    engineCode: params.engineCode,
                    color: params.color,
                    trim: params.carSpecs?.trim,
                },
                submittedBy: user?.email || 'Пользователь',
                submittedAt: 'Только что',
                note: `Пользователь добавил авто в гараж. Требуется подтвердить включение модели в общий каталог.`,
            };
            state.inbox.unshift(carInboxTicket);
        }
    }

    storage.saveState(state);
    return newCar;
}