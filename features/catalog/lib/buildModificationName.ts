import { formatTransmission } from '@/features/garage/add/lib/config/robotTransmission';
import { formatFacelift, knownFacelift } from './facelift';

type NameField = 'year' | 'yearEnd' | 'bodyCode' | 'displacementL' | 'engine' |
    'transmission' | 'drivetrain' | 'fuel' | 'bodyClass' | 'facelift' | 'trim';

export function buildModificationName(fields: Partial<Record<NameField, string>>, extraValues: string[] = []) {
    const startYear = fields.year?.trim();
    const endYear = fields.yearEnd?.trim();
    const volume = fields.displacementL?.trim().replace(',', '.');
    const engine = fields.engine?.trim();
    const facelift = knownFacelift(fields.facelift);

    return [
        startYear && endYear && startYear !== endYear ? `${startYear}–${endYear}` : startYear,
        fields.bodyCode?.trim(),
        facelift ? formatFacelift(facelift) : '',
        volume ? `${volume} л` : '',
        engine ? `(${engine})` : '',
        formatTransmission(fields.transmission),
        fields.drivetrain?.trim(),
        fields.fuel?.trim(),
        fields.bodyClass?.trim(),
        ...extraValues.map(value => value.trim()),
        fields.trim?.trim(),
    ].filter(Boolean).join(' / ');
}
