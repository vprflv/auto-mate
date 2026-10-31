import {ManualCarForm, Car, DecodedCar} from '@/types';

export function createEmptyManualForm(vin = ''): ManualCarForm {
    return {
        vin,
        make: '',
        trim: '',
        model: '',
        year: '',
        bodyClass: '',
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
        make: form.make.trim(),
        model: form.model.trim(),
        year: Number(form.year.trim()),
        trim: form.trim.trim() || undefined,
        bodyClass: form.bodyClass.trim() || undefined,
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
        addedAt: new Date().toISOString(),
    };
}


export function mapDecodedToManualForm(car: DecodedCar): ManualCarForm {
    return {
        ...createEmptyManualForm(car.vin),
        make: car.make || '',
        model: car.model || '',
        year: car.year ? String(car.year) : '',
        trim: car.trim || '',
        bodyClass: car.bodyClass || '',
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