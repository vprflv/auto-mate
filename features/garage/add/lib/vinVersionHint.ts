import { z } from 'zod';
import type { StoredMasterModel } from '@/features/admin/lib/system-store/types';
import { normalizeCode, matchesModificationField } from '@/features/catalog/lib/carCatalogIdentity';
import { matchesFacelift } from '@/features/catalog/lib/facelift';
import type { CatalogVinMatch } from './catalogVinRules';
import { isValidVin, normalizeVin } from './config/vin';
import bmwTypeCodes from './bmwTypeCodes.json';

export const vinVersionHintSchema = z.object({
    typeCode: z.string().regex(/^[A-HJ-NPR-Z0-9]{4}$/),
    version: z.string().min(1),
    bodyCode: z.string().min(1),
    facelift: z.enum(['pre_facelift', 'facelift']),
    engineFamily: z.string().min(1),
    drivetrain: z.enum(['RWD', 'AWD']),
    displacementL: z.string().regex(/^\d+\.\d+$/),
    fuel: z.enum(['Бензин', 'Дизель']),
});

export type VinVersionHint = z.infer<typeof vinVersionHintSchema>;

export function getLocalVinVersionHint(input: string): VinVersionHint | undefined {
    const vin = normalizeVin(input);
    if (!isValidVin(vin)) return undefined;

    const prefix = vin.slice(0, 8);
    if (!Object.hasOwn(bmwTypeCodes, prefix)) return undefined;
    const result = vinVersionHintSchema.safeParse({
        typeCode: vin.slice(3, 7), ...bmwTypeCodes[prefix as keyof typeof bmwTypeCodes],
    });
    return result.success ? result.data : undefined;
}

export function findVinVersionCandidates(hint: VinVersionHint, models: StoredMasterModel[]): CatalogVinMatch[] {
    return models.filter(model => model.verified && model.brandSlug === 'bmw').flatMap(model =>
        (model.modifications ?? []).flatMap(modification => {
            const attributes = modification.attributes;
            const explicitVersion = attributes.trim?.match(/\b\d{3}[id](?:\s*xdrive)?\b/i)?.[0];
            if (normalizeCode(attributes.bodyCode) !== normalizeCode(hint.bodyCode) ||
                !normalizeCode(attributes.engine).startsWith(normalizeCode(hint.engineFamily)) ||
                !matchesModificationField('driveType', hint.drivetrain, attributes.drivetrain) ||
                !matchesFacelift(hint.facelift, attributes.facelift) ||
                (attributes.fuel && !matchesModificationField('fuel', hint.fuel, attributes.fuel)) ||
                (attributes.displacementL && !matchesModificationField('displacementL', hint.displacementL, attributes.displacementL)) ||
                (attributes.bodyClass && !matchesModificationField('bodyClass', 'Седан', attributes.bodyClass)) ||
                (explicitVersion && normalizeCode(explicitVersion.replace(/\s*xdrive$/i, '')) !== normalizeCode(hint.version.replace(/\s*xdrive$/i, '')))) {
                return [];
            }
            return [{ model, modification }];
        })
    );
}
