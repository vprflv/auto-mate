import { z } from 'zod';

import type { Car } from '@/types';
import { BELGEE_S50_SHARED_PREFIX, isSharedSs11Model, isBelgeeS50SharedVin, isBelgeeS50SharedVinSample } from '@/features/garage/add/lib/belgeeS50Vin';
import { frameRuleSchema, getFrameCode, normalizeFrameNumber, uniqueFrameRules } from '@/features/garage/add/lib/catalogFrameRules';
import { isVinMaskSpecific, vinRuleKey } from '@/features/garage/add/lib/catalogVinRules';
import { formatTransmission } from '@/features/garage/add/lib/config/robotTransmission';
import { parseFacelift } from '@/features/catalog/lib/facelift';
import { buildModificationName } from '@/features/catalog/lib/buildModificationName';
import { isValidVin, isValidVinPrefix, MAX_MODEL_YEAR, MIN_MODEL_YEAR, normalizeVin, VIN_LENGTH } from '@/features/garage/add/lib/config/vin';
import type { CatalogVinRule, VinTrainingDraft } from './types';
import { normalizeSlug } from './utils';

const requiredText = z.string().trim().min(1, 'Укажите значение.');
const year = z.number().int().min(MIN_MODEL_YEAR).max(MAX_MODEL_YEAR);
const vinSample = z.string().transform(normalizeVin).refine(
    value => isValidVinPrefix(value) || isValidVin(value) || value === BELGEE_S50_SHARED_PREFIX,
    'Введите 11 символов префикса или 17 символов VIN.'
);
const vinTrainingRule = z.object({
    sample: vinSample,
    modelYear: year.nullish().transform(value => value ?? undefined),
    positions: z.array(z.number().int().min(0).max(VIN_LENGTH - 1)).optional(),
}).strict().refine(({ sample, positions }) => positions === undefined ||
    (isValidVinPrefix(sample) && positions.length === 0 ||
        (isValidVin(sample) || isValidVinPrefix(sample)) && positions.every(index => index < sample.length) && isVinMaskSpecific(positions)), {
    path: ['positions'],
    message: 'Для маски укажите полный VIN и позиции 0–2 плюс хотя бы три позиции из 3–7.',
});
export const vinTrainingInput = z.object({
    source: z.string().trim().optional().transform(source => source || undefined),
    brand: requiredText.refine(value => Boolean(normalizeSlug(value)), 'Укажите марку.'),
    model: requiredText.refine(value => Boolean(normalizeSlug(value)), 'Укажите модель.'),
    name: z.string().trim().optional().transform(name => name || undefined),
    year,
    yearEnd: year.optional(),
    bodyCode: requiredText,
    bodyClass: requiredText,
    facelift: z.string({ error: 'Укажите версию кузова текстом.' }).trim().nullish().transform((value, ctx) => {
        if (!value) return undefined;
        const version = parseFacelift(value);
        if (version === undefined) {
            ctx.addIssue({
                code: 'custom',
                message: 'Укажите «Дорестайлинг», «Рестайлинг», «Рестайлинг 2» или «Не определено».',
            });
            return z.NEVER;
        }
        return version === 'unknown' ? undefined : version;
    }),
    engine: requiredText,
    transmission: requiredText.transform(formatTransmission),
    fuel: requiredText,
    trim: requiredText.optional(),
    drivetrain: requiredText.optional(),
    displacementL: z.union([z.string(), z.number()])
        .transform(value => String(value).trim().replace(',', '.'))
        .pipe(z.string().regex(/^\d+(?:\.\d+)?$/)
            .refine(value => Number(value) > 0, 'Укажите положительный объём двигателя.'))
        .optional(),
    frame: z.array(frameRuleSchema).optional(),
    vin: z.array(z.union([
        vinSample.transform(sample => ({ sample, modelYear: undefined, positions: undefined })),
        vinTrainingRule,
    ])).refine(rules => {
        const yearsByMask = new Map<string, number>();
        for (const { sample, modelYear, positions } of rules) {
            if (modelYear === undefined) continue;
            const mask = vinRuleKey(buildVinTrainingRule(sample, modelYear, undefined, positions));
            const existing = yearsByMask.get(mask);
            if (existing !== undefined && existing !== modelYear) return false;
            yearsByMask.set(mask, modelYear);
        }
        return true;
    }, 'У одного VIN-правила должны совпадать модельные годы.').default([]),
}).strict().refine(input => input.yearEnd === undefined || input.yearEnd >= input.year, {
    path: ['yearEnd'],
    message: 'Год окончания выпуска должен быть не раньше года начала.',
}).refine(input => isSharedSs11Model(input.brand, input.model) ||
    input.vin.every(rule => rule.sample !== BELGEE_S50_SHARED_PREFIX), {
    path: ['vin'],
    message: 'Введите 11 символов префикса или 17 символов VIN.',
});

export type VinTrainingInput = z.input<typeof vinTrainingInput>;

export function buildVinTrainingRule(sample: string, modelYear?: number, source?: string, positions?: number[]): CatalogVinRule {
    return { sample, source, modelYear,
        positions: positions ?? (isValidVinPrefix(sample) ? [] : Array.from({ length: VIN_LENGTH }, (_, index) => index)),
    };
}

export function vinTrainingRuleLabel(rule: CatalogVinRule): string {
    return isValidVin(rule.sample) || rule.positions.length > 0 ? vinRuleKey(rule) : normalizeVin(rule.sample);
}

export function buildVinTrainingDraft({
    source, name, year, yearEnd, vin, frame, bodyCode, bodyClass, engine, transmission, fuel,
    trim, drivetrain, displacementL, facelift,
}: z.output<typeof vinTrainingInput>): VinTrainingDraft {
    const rules = new Map<string, CatalogVinRule>();
    for (const { sample, modelYear, positions } of vin) {
        const rule = buildVinTrainingRule(sample, modelYear, source, positions);
        const key = vinRuleKey(rule);
        const existing = rules.get(key);
        if (!existing || modelYear !== undefined) rules.set(key, rule);
    }
    return {
        source,
        name,
        attributes: {
            year: String(year),
            yearEnd: String(yearEnd ?? year),
            bodyCode, bodyClass, facelift, engine, transmission, fuel, trim, drivetrain, displacementL,
        },
        vinRules: [...rules.values()],
        frameRules: frame?.length ? uniqueFrameRules(frame) : undefined,
    };
}

export function getVinTrainingModificationName(draft: VinTrainingDraft): string {
    return draft.name?.trim() || buildModificationName(draft.attributes);
}

export function getApplicableVinTrainingRules(brand: string, model: string, rules: CatalogVinRule[]): CatalogVinRule[] {
    return isSharedSs11Model(brand, model)
        ? rules.filter(rule => !isBelgeeS50SharedVinSample(rule.sample))
        : rules;
}

export function buildVinTrainingDraftForCar(car: Car) {
    const validVin = isValidVin(car.vin) && !isBelgeeS50SharedVin(car.vin);
    const frame = normalizeFrameNumber(car.frameNumber ?? '');
    const frameCode = getFrameCode(frame);
    if (!validVin && !frameCode) return undefined;
    const attributes = {
        year: String(car.year),
        bodyCode: car.bodyCode?.trim() || frameCode,
        bodyClass: car.bodyClass?.trim() || undefined,
        facelift: car.facelift,
        engine: car.engine?.trim() || undefined,
        transmission: car.transmission?.trim() || undefined,
        fuel: car.fuel?.trim() || undefined,
        trim: car.trim?.trim() || undefined,
        drivetrain: car.driveType?.trim() || undefined,
        displacementL: car.displacementL?.trim() || undefined,
    };
    const input = vinTrainingInput.safeParse({
        ...attributes,
        brand: car.make,
        model: car.model,
        year: car.year,
        vin: validVin ? [car.vin] : [],
        frame: !validVin && frameCode ? [{ sample: frame, positions: Array.from(frame.slice(frameCode.length + 1), (_, index) => index) }] : undefined,
        name: car.modificationName,
    });
    return input.success ? buildVinTrainingDraft(input.data) : undefined;
}
