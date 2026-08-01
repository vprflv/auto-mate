import { CarPartItem } from '@/types';

export function formatPart(item: CarPartItem) {
    return [item.brand, item.oemNumber, item.analogNumber ? `аналог ${item.analogNumber}` : null]
        .filter(Boolean)
        .join(' • ');
}

export function getSub(item: CarPartItem) {
    return item.subcategory?.trim() || '';
}