import {ManualCarForm, Car, DecodedCar} from '@/types';

export function createEmptyManualForm(vin = ''): ManualCarForm {
    return {
        vin,
        make: '',
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
        year: parseInt(form.year) || new Date().getFullYear(),
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

export function isManualFormValid(form: ManualCarForm): boolean {
    return Boolean(
        form.make.trim() && form.model.trim() && form.year.trim()
    );
}