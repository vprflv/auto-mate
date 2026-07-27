import { DecodedCar } from '@/types';
import {VIN_API_URL} from "@/features/garage/add/lib/config/vin";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapNhtsaToDecodedCar(data: any, vinCode: string): DecodedCar | null {
    if (!data?.Make || data.Make === '') {
        return null;
    }

    return {
        vin: vinCode,
        make: data.Make,
        model: data.Model || 'Неизвестно',
        year: parseInt(data.ModelYear) || new Date().getFullYear(),
        bodyClass: data.BodyClass || undefined,
        engine: data.Engine || undefined,
        displacementL: data.DisplacementL || undefined,
        cylinders: data.EngineCylinders || undefined,
        fuel: data.FuelTypePrimary || undefined,
        driveType: data.DriveType || undefined,
        transmission: data.TransmissionStyle || undefined,
        doors: data.Doors || undefined,
        plantCountry: data.PlantCountry || undefined,
    };
}

export async function fetchVinData(vinCode: string) {
    const res = await fetch(`${VIN_API_URL}/${vinCode}?format=json`);
    const data = await res.json();
    return data.Results[0];
}