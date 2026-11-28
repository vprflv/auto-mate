export const VIN_API_URL =
    'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended';

export const VIN_LENGTH = 17;
export const MIN_MODEL_YEAR = 1886;
export const MAX_MODEL_YEAR = 9999;

export function isValidModelYear(year: unknown): year is number {
    return typeof year === 'number' && Number.isInteger(year) && year >= MIN_MODEL_YEAR && year <= MAX_MODEL_YEAR;
}
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

const lookalikes: Record<string, string> = Object.fromEntries(
    Array.from('АВЕКМНОРСТУХ', (character, index) => [character, 'ABEKMHOPCTYX'[index]])
);

export function normalizeIdentifierLetters(value: string): string {
    return value.toUpperCase().replace(/[АВЕКМНОРСТУХ]/g, character => lookalikes[character]);
}

export function normalizeVin(vin: string): string {
    const value = normalizeIdentifierLetters(vin).replace(/\s+/g, '');
    return /^[A-Z0-9]{17}$/.test(value) ? value.replace(/[OIQ]/g, character => character === 'I' ? '1' : '0') : value;
}