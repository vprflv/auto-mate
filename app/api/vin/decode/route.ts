import { execFile } from 'node:child_process';
import { join } from 'node:path';
import { z } from 'zod';

import { isValidVin, MAX_MODEL_YEAR, MIN_MODEL_YEAR, normalizeVin, VIN_LENGTH } from '@/features/garage/add/lib/config/vin';

import { isValidCatalogVinRule } from '@/features/garage/add/lib/catalogVinRules';
import { isBelgeeS50SharedVin } from '@/features/garage/add/lib/belgeeS50Vin';
import { vinVersionHintSchema } from '@/features/garage/add/lib/vinVersionHint';

export const runtime = 'nodejs';

const modelYear = z.number().int().min(MIN_MODEL_YEAR).max(MAX_MODEL_YEAR).nullish().transform(year => year ?? undefined);

const matchSchema = z.object({
    brandSlug: z.string(),
    modelSlug: z.string(),
    modificationId: z.string(),
    specificity: z.number().int().positive(),
    modelYear,
});

const vinRuleSchema = z.object({
    sample: z.string().transform(normalizeVin),
    modelYear,
    positions: z.array(z.number().int().min(0).max(VIN_LENGTH - 1)).default([]),
}).refine(isValidCatalogVinRule);

const requestSchema = z.object({
    vin: z.string().transform(normalizeVin).refine(isValidVin),
    masterModels: z.array(z.object({
        brandSlug: z.string(),
        brandName: z.string(),
        modelSlug: z.string(),
        modelName: z.string(),
        verified: z.literal(true),
        modifications: z.array(z.object({
            id: z.string(),
            name: z.string(),
            attributes: z.record(z.string(), z.string()),
            vinRules: z.array(z.unknown()).transform(rules => rules.flatMap(rule => {
                const parsed = vinRuleSchema.safeParse(rule);
                return parsed.success ? [parsed.data] : [];
            })).optional(),
            vinExceptions: z.array(z.string().transform(normalizeVin).refine(isValidVin)).optional(),
        })),
    })),
});

const resultSchema = z.object({
    status: z.enum(['matched', 'ambiguous', 'no_match']),
    matches: z.array(matchSchema),
    hint: vinVersionHintSchema.optional(),
});

function runDecoder(input: z.infer<typeof requestSchema>, signal: AbortSignal) {
    return new Promise<string>((resolve, reject) => {
        const python = process.env.AUTO_MATE_PYTHON_EXECUTABLE || 'python';
        const script = join(process.cwd(), 'scripts', 'decode_vin.py');
        const child = execFile(python, [script, '--stdin'], {
            signal,
            timeout: 5_000,
            windowsHide: true,
            encoding: 'utf8',
        }, (error, stdout) => {
            if (error) reject(error);
            else resolve(stdout);
        });

        child.stdin?.on('error', reject);
        child.stdin?.end(JSON.stringify({ schemaVersion: 1, ...input }), 'utf8');
    });
}

export async function POST(request: Request) {
    const body: unknown = await request.json().catch(() => null);
    const input = requestSchema.safeParse(body);
    if (!input.success) {
        return Response.json({ error: 'Некорректные данные для проверки VIN.' }, { status: 400 });
    }

    try {
        const { vin, masterModels } = input.data;
        const models = isBelgeeS50SharedVin(vin) ? masterModels.map(model => ({
            ...model,
            modifications: model.modifications.map(modification => ({ ...modification, vinRules: undefined })),
        })) : masterModels;
        const stdout = await runDecoder({ vin, masterModels: models }, request.signal);
        return Response.json(resultSchema.parse(JSON.parse(stdout)));
    } catch {
        return Response.json({ error: 'Python-декодер недоступен.' }, { status: 503 });
    }
}
