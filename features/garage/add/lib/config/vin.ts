export const VIN_API_URL =
    'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended';

export const VIN_LENGTH = 17;
export const VIN_PREFIX_LENGTH = 11;
const vinCharacters = /^[A-HJ-NPR-Z0-9]+$/;

export function isValidVin(vin: string): boolean {
    const normalized = normalizeVin(vin);
    return normalized.length === VIN_LENGTH && vinCharacters.test(normalized);
}

export function isValidVinPrefix(vin: string): boolean {
    const normalized = normalizeVin(vin);
    return normalized.length === VIN_PREFIX_LENGTH && vinCharacters.test(normalized);
}

export function normalizeVin(vin: string): string {
    return vin.trim().toUpperCase();
}