import { z } from 'zod';
import type { CatalogFrameRule, StoredMasterModel } from '@/features/admin/lib/system-store/types';
import type { CatalogVinMatch } from './catalogVinRules';
import { isValidVin, MAX_MODEL_YEAR, MIN_MODEL_YEAR, normalizeIdentifierLetters, normalizeVin } from './config/vin';

export const EXACT_FRAME_SPECIFICITY = 10;

const frameCode = /^(?=[A-Z0-9]*\d)[A-Z][A-Z0-9]{1,7}$/;

export function normalizeFrameNumber(value: string): string {
    const normalized = normalizeIdentifierLetters(value).trim();
    const separated = normalized.replace(/^([A-Z][A-Z0-9]{1,7})\s+(\d{5,8})$/, '$1-$2');
    return separated.replace(/\s+/g, '').replace(/[‐‑–—−]/g, '-');
}

export function getFrameCode(value: string): string | undefined {
    const [code, serial, extra] = normalizeFrameNumber(value).split('-');
    return extra === undefined && frameCode.test(code) && /^\d{5,8}$/.test(serial ?? '') ? code : undefined;
}

const frameMask = z.object({
    sample: z.string().transform(normalizeFrameNumber),
    positionBasis: z.enum(['serial', 'sample']).optional(),
    positions: z.array(z.number().int().min(0)),
    modelYear: z.number().int().min(MIN_MODEL_YEAR).max(MAX_MODEL_YEAR).nullish().transform(year => year ?? undefined),
}).strict();

const legacyFrameRule = z.string().transform(normalizeFrameNumber).transform((value, ctx): CatalogFrameRule => {
    const [code, serial, extra] = value.split('-');
    if (!frameCode.test(code) || extra !== undefined || (serial !== undefined && !/^\d{1,8}$/.test(serial))) {
        ctx.addIssue({ code: 'custom', message: 'Некорректное правило Frame.' });
        return z.NEVER;
    }
    const sample = serial === undefined ? code : `${code}-${serial.padEnd(5, '0')}`;
    const positions = Array.from(serial ?? '', (_, index) => index);
    return { sample, positions, positionBasis: 'serial' };
});

function frameRuleWithBasis(defaultBasis: 'serial' | 'sample') {
    return z.union([frameMask, legacyFrameRule]).transform((rule, ctx): CatalogFrameRule => {
        const { sample, positions, modelYear } = rule;
        const [code, serial = ''] = sample.split('-');
        if (!getFrameCode(sample) && !frameCode.test(sample)) {
            ctx.addIssue({ code: 'custom', path: ['sample'], message: 'Укажите код кузова или полный номер с дефисом и 5–8 цифрами после него.' });
            return z.NEVER;
        }

        const basis = rule.positionBasis ?? defaultBasis;
        const limit = basis === 'serial' ? serial.length : sample.length;
        if (positions.some(index => index >= limit)) {
            const message = limit === 0 ? 'Для одного кода кузова укажите positions: [].' :
                basis === 'serial' ? `Позиции считаются после дефиса: от 0 до ${limit - 1}.` :
                    `Допустимые позиции в полном образце: от 0 до ${limit - 1}.`;
            ctx.addIssue({ code: 'custom', path: ['positions'], message });
            return z.NEVER;
        }

        let serialPositions = positions;
        if (basis === 'sample') {
            const selected = new Set(positions);
            serialPositions = positions.filter(index => index > code.length).map(index => index - code.length - 1);
            if (Array.from(code).some((_, index) => !selected.has(index)) || (serial && !serialPositions.length)) {
                ctx.addIssue({ code: 'custom', path: ['positions'], message: 'В старой маске укажите все позиции кода кузова и хотя бы одну серийную цифру для полного номера.' });
                return z.NEVER;
            }
        }

        return { sample, positions: [...new Set(serialPositions)].sort((a, b) => a - b), modelYear, positionBasis: 'serial' };
    });
}

export const frameRuleSchema = frameRuleWithBasis('serial');
// Старые правила в каталоге и его выгрузках хранят позиции от начала sample.
export const storedFrameRuleSchema = frameRuleWithBasis('sample');

export function frameRuleKey({ sample, positions, modelYear }: CatalogFrameRule): string {
    const [code, serial = ''] = sample.split('-');
    const exact = serial.length > 0 && positions.length === serial.length;
    const mask = positions.map(position => [position, serial[position]]);
    return JSON.stringify([code, mask, exact ? serial.length : null, modelYear]);
}

export function uniqueFrameRules(rules: (CatalogFrameRule | string)[]): CatalogFrameRule[] {
    const unique = new Map<string, CatalogFrameRule>();
    for (const rule of rules) {
        const parsed = storedFrameRuleSchema.safeParse(rule);
        if (parsed.success) unique.set(frameRuleKey(parsed.data), parsed.data);
    }
    return [...unique.values()];
}

export function formatFrameRuleLines(rules: (CatalogFrameRule | string)[] = []): string {
    return rules.map(rule => {
        const parsed = storedFrameRuleSchema.safeParse(rule);
        return parsed.success ? JSON.stringify(parsed.data) : String(rule);
    }).join('\n');
}

export function readFrameRuleLines(text: string): unknown[] {
    return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
        if (!line.startsWith('{')) return line;
        try { return JSON.parse(line); } catch { return line; }
    });
}

function* verifiedModifications(models: StoredMasterModel[]) {
    for (const model of models) {
        if (!model.verified || !Array.isArray(model.modifications)) continue;
        for (const modification of model.modifications) yield { model, modification };
    }
}

function normalizedRules(modification: CatalogVinMatch['modification']): CatalogFrameRule[] {
    return Array.isArray(modification.frameRules) ? uniqueFrameRules(modification.frameRules) : [];
}

function ruleBodyCode(rule: CatalogFrameRule): string {
    return rule.sample.split('-')[0];
}

function resolveCompactFrame(input: string, models: StoredMasterModel[]): string {
    if (!/^[A-Z][A-Z0-9]+[0-9]{5}$/.test(input)) return input;

    const codes = new Map<string, Set<StoredMasterModel>>();
    const addCode = (code: string, model: StoredMasterModel) => {
        const owners = codes.get(code) ?? new Set<StoredMasterModel>();
        owners.add(model);
        codes.set(code, owners);
    };
    for (const { model, modification } of verifiedModifications(models)) {
        const bodyCode = normalizeFrameNumber(modification.attributes?.bodyCode ?? '');
        if (frameCode.test(bodyCode)) addCode(bodyCode, model);
        for (const rule of normalizedRules(modification)) addCode(ruleBodyCode(rule), model);
    }
    if (codes.has(input)) return input;

    const candidates = [...codes.keys()].filter(code => input.startsWith(code) && /^\d{5,8}$/.test(input.slice(code.length)))
        .sort((first, second) => second.length - first.length);
    const [code, ...alternatives] = candidates;
    if (!code) return input;
    const owners = codes.get(code)!;
    if (alternatives.some(other => {
        const otherOwners = codes.get(other)!;
        return owners.size !== otherOwners.size || [...otherOwners].some(owner => !owners.has(owner));
    })) return '';
    return `${code}-${input.slice(code.length)}`;
}

export function splitVehicleIdentifier(value: string, models: StoredMasterModel[] = []): {
    vin: string;
    frameNumber: string;
    frameCode?: string;
} {
    if (isValidVin(value)) return { vin: normalizeVin(value), frameNumber: '' };
    const frameNumber = resolveCompactFrame(normalizeFrameNumber(value), models);
    if (frameCode.test(frameNumber)) return { vin: '', frameNumber: '', frameCode: frameNumber };
    return { vin: '', frameNumber: getFrameCode(frameNumber) ? frameNumber : '' };
}

type CatalogFrameMatch = CatalogVinMatch & { requiresConfirmation?: true };

export function findCatalogFrameMatches(input: string, models: StoredMasterModel[]): CatalogFrameMatch[] {
    const { frameCode: codeOnly, frameNumber } = splitVehicleIdentifier(input, models);
    const code = codeOnly ?? getFrameCode(frameNumber);
    if (!code) return [];

    const serial = frameNumber.split('-')[1] ?? '';
    const matches: CatalogFrameMatch[] = [];
    const broadMatches: CatalogFrameMatch[] = [];
    const bodyMatches: CatalogFrameMatch[] = [];
    for (const match of verifiedModifications(models)) {
        const { modification } = match;
        const rules = normalizedRules(modification);
        if (normalizeFrameNumber(modification.attributes?.bodyCode ?? '') === code ||
            rules.some(rule => ruleBodyCode(rule) === code)) {
            bodyMatches.push({ ...match, requiresConfirmation: true });
        }
        if (codeOnly) continue;

        let score = 0;
        const years = new Set<number>();
        for (const { sample, positions, modelYear } of rules) {
            const [sampleCode, sampleSerial = ''] = sample.split('-');
            if (sampleCode !== code || !positions.every(index => sampleSerial[index] === serial[index])) continue;
            const exact = sampleSerial.length > 0 && positions.length === sampleSerial.length;
            if (exact && sampleSerial !== serial) continue;

            const priority = exact ? EXACT_FRAME_SPECIFICITY : positions.length + 1;
            if (priority < score) continue;
            if (priority > score) years.clear();
            score = priority;
            if (modelYear !== undefined) years.add(modelYear);
        }
        if (score === 1) broadMatches.push({ ...match, specificity: 1, requiresConfirmation: true });
        if (score > 1) matches.push({ ...match, specificity: score, modelYear: years.size === 1 ? [...years][0] : undefined });
    }
    if (codeOnly) return bodyMatches;
    const ranked = matches.sort((first, second) => (second.specificity ?? 0) - (first.specificity ?? 0));
    if (ranked.length) return [...ranked, ...broadMatches];
    return bodyMatches;
}
