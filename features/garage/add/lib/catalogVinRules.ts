import type { CatalogModification, CatalogVinRule, StoredMasterModel } from '@/features/admin/lib/system-store/types';
import { isValidModelYear, isValidVin, isValidVinPrefix, normalizeVin, VIN_LENGTH } from './config/vin';
import { isBelgeeS50SharedVin } from './belgeeS50Vin';

export function isVinMaskSpecific(positions: readonly number[]): boolean {
    const unique = new Set(positions);
    return [0, 1, 2].every(position => unique.has(position)) &&
        [3, 4, 5, 6, 7].filter(position => unique.has(position)).length >= 3;
}

export function hasValidCatalogVinRuleShape(rule: CatalogVinRule): boolean {
    if (!rule || typeof rule.sample !== 'string' || !Array.isArray(rule.positions)) return false;
    const sample = normalizeVin(rule.sample);
    const validPositions = rule.positions.every(position =>
        Number.isInteger(position) && position >= 0 && position < sample.length
    );
    return validPositions && (rule.modelYear == null || isValidModelYear(rule.modelYear)) && (isValidVinPrefix(rule.sample) ||
        (isValidVin(rule.sample) && rule.positions.length > 0));
}

export function isValidCatalogVinRule(rule: CatalogVinRule): boolean {
    return hasValidCatalogVinRuleShape(rule) && (isValidVinPrefix(rule.sample) && rule.positions.length === 0 || isVinMaskSpecific(rule.positions));
}

export function vinRuleKey(rule: CatalogVinRule): string {
    const sample = normalizeVin(rule.sample);
    const positions = rule.positions.length ? rule.positions : Array.from({ length: sample.length }, (_, index) => index).filter(index => index !== 8);
    return Array.from({ length: VIN_LENGTH }, (_, index) => positions.includes(index) ? sample[index] : '*').join('');
}

function overlappingVin(leftMask: string, rightMask: string): string | undefined {
    let example = '';
    for (let position = 0; position < VIN_LENGTH; position += 1) {
        const left = leftMask[position];
        const right = rightMask[position];
        if (left !== '*' && right !== '*' && left !== right) return undefined;
        example += left !== '*' ? left : right !== '*' ? right : '0';
    }
    return example;
}

export function getVinModelYearConflicts(rules: readonly CatalogVinRule[], existing: readonly CatalogVinRule[] = []) {
    const confirmed = rules.filter(rule => isValidCatalogVinRule(rule) && isValidModelYear(rule.modelYear));
    const stored = existing.filter(rule => isValidCatalogVinRule(rule) && isValidModelYear(rule.modelYear));
    return confirmed.flatMap((incomingRule, index) =>
        [...confirmed.slice(index + 1).map(rule => ({ rule, inCatalog: false })),
            ...stored.map(rule => ({ rule, inCatalog: true }))].flatMap(({ rule, inCatalog }) => {
            if (incomingRule.modelYear === rule.modelYear || vinMaskSize(incomingRule) !== vinMaskSize(rule)) return [];
            const exampleVin = overlappingVin(vinRuleKey(incomingRule), vinRuleKey(rule));
            return exampleVin ? [{ incomingRule, otherRule: rule, inCatalog, exampleVin }] : [];
        })
    );
}

export function assertConsistentVinModelYears(rules: readonly CatalogVinRule[], existing: readonly CatalogVinRule[] = []): void {
    const [conflict] = getVinModelYearConflicts(rules, existing);
    if (!conflict) return;

    const { incomingRule, otherRule, exampleVin } = conflict;
    throw new Error(`Разные модельные годы у VIN-правил ${vinRuleKey(incomingRule)} (${incomingRule.modelYear}) и ${vinRuleKey(otherRule)} (${otherRule.modelYear}). Пример: ${exampleVin}.`);
}

export function getVinRuleConflicts(
    rules: CatalogVinRule[],
    models: StoredMasterModel[],
    destination?: CatalogModification
) {
    const rulesByMask = (values: CatalogVinRule[] | undefined) => new Map(
        (Array.isArray(values) ? values : []).filter(isValidCatalogVinRule).map(rule => [vinRuleKey(rule), rule])
    );
    const existing = rulesByMask(destination?.vinRules);
    const incoming = [...rulesByMask(rules)].filter(([mask]) => !existing.has(mask));
    if (incoming.length === 0) return [];

    return models.flatMap(model => (Array.isArray(model.modifications) ? model.modifications : []).flatMap(modification => {
        if (modification === destination) return [];
        const stored = [...rulesByMask(modification.vinRules)];
        return incoming.flatMap(([incomingMask, incomingRule]) => stored.flatMap(([storedMask, storedRule]) => {
            const exampleVin = overlappingVin(incomingMask, storedMask);
            return exampleVin ? [{ model, modification, incomingMask, storedMask, incomingRule, storedRule, exampleVin }] : [];
        }));
    }));
}

export function isExactVinRuleConflict({ incomingMask, storedMask }: ReturnType<typeof getVinRuleConflicts>[number]): boolean {
    return !incomingMask.includes('*') && !storedMask.includes('*');
}

export function assertNoVinRuleConflicts(
    rules: CatalogVinRule[],
    models: StoredMasterModel[],
    destination?: CatalogModification,
    isBlocking = isExactVinRuleConflict,
): void {
    const conflict = getVinRuleConflicts(rules, models, destination).find(isBlocking);
    if (!conflict) return;

    const { model, modification, incomingMask, storedMask, exampleVin } = conflict;
    throw new Error(
        `VIN-правило ${incomingMask} пересекается с ${storedMask} у ${model.brandName} ${model.modelName} · ${modification.name}. ` +
        `Пример совпадения: ${exampleVin}.`
    );
}

export function hasCatalogVinException(modification: CatalogModification, vin: string): boolean {
    return Array.isArray(modification.vinExceptions) &&
        modification.vinExceptions.some(sample => typeof sample === 'string' && normalizeVin(sample) === vin);
}

export function catalogVinRuleMatches(rule: CatalogVinRule, vin: string): boolean {
    if (!isValidCatalogVinRule(rule)) return false;
    const mask = vinRuleKey(rule);
    return Array.from(mask).every((character, index) => character === '*' || character === vin[index]);
}

function vinMaskSize(rule: CatalogVinRule): number {
    return vinRuleKey(rule).replace(/\*/g, '').length;
}

function matchingVinRules(modification: CatalogModification, vin: string) {
    const matched = (Array.isArray(modification.vinRules) ? modification.vinRules : [])
        .filter(rule => catalogVinRuleMatches(rule, vin));
    const specificity = Math.max(0, ...matched.map(vinMaskSize));
    const years = new Set(matched.filter(rule => vinMaskSize(rule) === specificity)
        .map(rule => rule.modelYear).filter(isValidModelYear));
    return { specificity, modelYear: years.size === 1 ? years.values().next().value : undefined };
}

export function getCatalogVinModelYear(modification: CatalogModification, input: string): number | undefined {
    const vin = normalizeVin(input);
    if (!isValidVin(vin) || hasCatalogVinException(modification, vin)) return undefined;
    return matchingVinRules(modification, vin).modelYear;
}

export function getConfirmedVinMatch(vin: string, models: StoredMasterModel[]): CatalogVinMatch | undefined {
    const matches = findCatalogVinMatches(vin, models);
    const [first, second] = matches;
    return !second || (first?.specificity === VIN_LENGTH + 1 && second.specificity !== first.specificity) ? first : undefined;
}

export type CatalogVinMatch = { model: StoredMasterModel; modification: CatalogModification; modelYear?: number; specificity?: number };

// The VIN has no full rule match. Samples can still suggest a model or a modification.
export function findCatalogVinSuggestions(input: string, models: StoredMasterModel[]): CatalogVinMatch[] {
    const vin = normalizeVin(input);
    if (!isValidVin(vin)) return [];
    const byPrefix: CatalogVinMatch[] = [];
    const byManufacturer: CatalogVinMatch[] = [];
    for (const model of models) {
        if (!model.verified || !Array.isArray(model.modifications)) continue;
        let knownManufacturer = false;
        for (const modification of model.modifications) {
            const samples = [...(modification.vinExceptions ?? []),
                ...(modification.vinRules ?? []).filter(isValidCatalogVinRule).map(rule => rule.sample)]
                .filter(sample => isValidVin(sample) || isValidVinPrefix(sample)).map(normalizeVin);
            if (samples.some(sample => sample.slice(0, 3) === vin.slice(0, 3))) knownManufacturer = true;
            if (samples.some(sample => sample.slice(0, 8) === vin.slice(0, 8))) {
                byPrefix.push({ model, modification });
            }
        }
        if (knownManufacturer) {
            byManufacturer.push(...model.modifications.map(modification => ({ model, modification })));
        }
    }
    return byPrefix.length ? byPrefix : byManufacturer;
}

export function findCatalogVinMatches(input: string, models: StoredMasterModel[]): CatalogVinMatch[] {
    const vin = normalizeVin(input);
    if (!isValidVin(vin)) return [];
    const sharedVin = isBelgeeS50SharedVin(vin);
    return models.filter(model => model.verified).flatMap(model =>
        (Array.isArray(model.modifications) ? model.modifications : []).flatMap((modification): CatalogVinMatch[] => {
            if (hasCatalogVinException(modification, vin)) return [{ model, modification, specificity: VIN_LENGTH + 1 }];
            if (sharedVin) return [];
            const matched = matchingVinRules(modification, vin);
            return matched.specificity ? [{ model, modification, ...matched }] : [];
        })
    ).sort((first, second) => (second.specificity ?? 0) - (first.specificity ?? 0));
}
