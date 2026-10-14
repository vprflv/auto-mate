import { AppServiceItem, AppServiceRecord } from '../types';
import { storage } from '../storage';
import { addUserPart } from './parts';

export interface AddServiceParams {
    carId: string;
    title: string;
    date: string;
    mileage: number;
    items: AppServiceItem[];
}

export function addServiceRecord(params: AddServiceParams): AppServiceRecord {
    const state = storage.getState();
    const car = state.cars.find((c) => c.id === params.carId);

    const newRecord: AppServiceRecord = {
        id: `rec_${Date.now().toString().slice(-4)}`,
        carId: params.carId,
        title: params.title,
        date: params.date,
        mileage: params.mileage,
        items: params.items,
    };

    state.serviceRecords.unshift(newRecord);

    if (car && params.mileage > car.mileage) {
        car.mileage = params.mileage;
    }

    storage.saveState(state);

    // Каждую деталь из ТО отправляем в общую валидацию
    params.items.forEach((item) => {
        addUserPart({
            carId: params.carId,
            partName: item.name,
            partBrand: item.brand,
            partArticle: item.article,
            isOem: item.isOem,
            quantity: item.quantity,
            price: item.price,
            source: 'user_service',
            note: `Запись ТО: "${params.title}" на ${params.mileage.toLocaleString('ru-RU')} км`,
        });
    });

    return newRecord;
}