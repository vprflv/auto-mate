const knownBrands = new Map([
    ['bmw', 'BMW'],
    ['denso', 'DENSO'],
    ['febi', 'febi'],
    ['filtron', 'FILTRON'],
    ['ina', 'INA'],
    ['kyb', 'KYB'],
    ['mann-filter', 'MANN-FILTER'],
    ['ngk', 'NGK'],
    ['nsk', 'NSK'],
    ['ntn', 'NTN'],
    ['skf', 'SKF'],
    ['trw', 'TRW'],
    ['vic', 'VIC'],
]);

export function formatPartBrand(value: string): string {
    const key = value.trim().replace(/\s+/g, ' ').toLowerCase();
    return knownBrands.get(key) ?? key.replace(/(^|[\s-])(\p{L})/gu,
        (_, separator: string, letter: string) => separator + letter.toUpperCase()
    );
}
