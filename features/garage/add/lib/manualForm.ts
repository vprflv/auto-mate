import {ManualCarForm, Car, DecodedCar} from '@/types';

import { knownFacelift } from '@/features/catalog/lib/facelift';
import { getFrameCode, normalizeFrameNumber } from './catalogFrameRules';

export function createEmptyManualForm(vin = '', frameNumber = ''): ManualCarForm {
    return {
        vin,
        frameNumber,
        make: '',
        trim: '',
        model: '',
        year: '',
        bodyCode: '',
        bodyClass: '',
        facelift: '',
        displacementL: '',
        cylinders: '',
        engine: '',
        fuel: '',
        driveType: '',
        transmission: '',
        doors: '',
        plantCountry: '',
        color: '',
        nickname: '',
    };
}

export function mapManualFormToCar(form: ManualCarForm): Car {
    return {
        id: Date.now().toString(),
        vin: form.vin.trim().toUpperCase() || 'UNKNOWN',
        frameNumber: normalizeFrameNumber(form.frameNumber) || undefined,
        make: form.make.trim(),
        model: form.model.trim(),
        year: Number(form.year.trim()),
        bodyCode: form.bodyCode?.trim().toUpperCase() || undefined,
        trim: form.trim.trim() || undefined,
        bodyClass: form.bodyClass.trim() || undefined,
        facelift: knownFacelift(form.facelift),
        displacementL: form.displacementL.trim() || undefined,
        cylinders: form.cylinders.trim() || undefined,
        engine: form.engine.trim() || undefined,
        fuel: form.fuel.trim() || undefined,
        driveType: form.driveType.trim() || undefined,
        transmission: form.transmission.trim() || undefined,
        doors: form.doors.trim() || undefined,
        plantCountry: form.plantCountry.trim() || undefined,
        color: form.color.trim() || undefined,
        nickname: form.nickname.trim() || undefined,
        catalogBrandSlug: form.catalogBrandSlug || undefined,
        catalogModelSlug: form.catalogModelSlug || undefined,
        catalogModificationId: form.catalogModificationId || undefined,
        modificationName: form.modificationName || undefined,
        addedAt: new Date().toISOString(),
    };
}


export function mapDecodedToManualForm(car: DecodedCar): ManualCarForm {
    return {
        ...createEmptyManualForm(car.vin === 'UNKNOWN' ? '' : car.vin, car.frameNumber),
        make: car.make || '',
        model: car.model || '',
        year: car.year ? String(car.year) : '',
        bodyCode: car.bodyCode ?? '',
        trim: car.trim || '',
        bodyClass: car.bodyClass || '',
        facelift: knownFacelift(car.facelift) ?? '',
        displacementL: car.displacementL || '',
        cylinders: car.cylinders || '',
        engine: car.engine || '',
        fuel: car.fuel || '',
        driveType: car.driveType || '',
        transmission: car.transmission || '',
        doors: car.doors || '',
        plantCountry: car.plantCountry || '',
    };
}

export function getManualFormError(
    form: ManualCarForm
): string | null {
    if (form.frameNumber.trim() && !getFrameCode(form.frameNumber)) {
        return 'Проверьте номер кузова. Пример формата — NZE141-1234567.';
    }

    if (!form.make.trim()) {
        return 'Укажите марку автомобиля.';
    }

    if (!form.model.trim()) {
        return 'Укажите модель автомобиля.';
    }

    const yearText = form.year.trim();
    const year = Number(yearText);
    const maxYear = new Date().getFullYear() + 1;

    if (
        !/^\d{4}$/.test(yearText) ||
        !Number.isInteger(year) ||
        year < 1886 ||
        year > maxYear
    ) {
        return `Укажите год выпуска от 1886 до ${maxYear}.`;
    }

    return null;
}

export function isManualFormValid(
    form: ManualCarForm
): boolean {
    return getManualFormError(form) === null;
}
