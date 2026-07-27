export const VIN_API_URL =
    'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended';

export const VIN_LENGTH = 17;

export function isValidVin(vin: string): boolean {
    return vin.trim().length === VIN_LENGTH;
}

export function normalizeVin(vin: string): string {
    return vin.trim().toUpperCase();
}