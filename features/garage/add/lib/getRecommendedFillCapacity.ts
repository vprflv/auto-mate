import type { ServiceRecord } from '@/types';
import type { PartForm } from '../types/serviceForm';

const formatLiters = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 3,
});

function parseLiters(value?: string): number | undefined {
    const match = value?.trim().match(/^(\d+(?:[.,]\d+)?)\s*(мл|ml|л|l)?$/i);
    if (!match) return undefined;

    const amount = Number(match[1].replace(',', '.'));
    const unit = match[2]?.toLowerCase();
    const liters = unit === 'мл' || unit === 'ml' ? amount / 1000 : amount;

    return Number.isFinite(liters) && liters > 0 ? liters : undefined;
}

function normalize(value?: string): string {
    return value?.trim().replace(/\s+/g, ' ').toLowerCase() ?? '';
}

export function getRecommendedFillCapacity(
    part: PartForm,
    records: ServiceRecord[],
    serviceDate: string,
    excludedRecordId?: string,
): string | undefined {
    if (part.itemType !== 'fluid' || !serviceDate) return undefined;

    const article = normalize(part.oemNumber);
    const name = normalize(part.name);
    const brand = normalize(part.brand);
    const spec = normalize(part.spec);
    if (!name && !article) return undefined;

    const volumes: number[] = [];
    for (const record of records) {
        if (record.id === excludedRecordId || !record.date || record.date > serviceDate) continue;

        for (const item of record.parts ?? []) {
            if (item.itemType !== 'fluid' || item.fluidCategory !== part.fluidCategory) continue;
            if (article ? normalize(item.oemNumber) !== article : normalize(item.name) !== name) continue;
            if (brand && normalize(item.brand) !== brand) continue;
            if (spec && normalize(item.spec) !== spec) continue;

            const liters = parseLiters(item.fillCapacity);
            if (liters !== undefined) volumes.push(liters);
        }
    }

    if (!volumes.length) return undefined;
    const average = volumes.reduce((sum, liters) => sum + liters / volumes.length, 0);
    return `${formatLiters.format(average)} л`;
}
