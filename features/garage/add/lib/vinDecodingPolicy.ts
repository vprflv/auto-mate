import policy from '@/features/catalog/lib/vinDecodingPolicy.json';
import { normalizeVin } from './config/vin';

type VinRuleExclusion = { prefix: string; reason: string };
const ruleExclusions: Record<string, VinRuleExclusion> = policy.ruleExclusions;

export function getVinRuleExclusion(id: string): VinRuleExclusion | undefined {
    return ruleExclusions[id];
}

export function vinRulesRequireConfirmation(input: string): boolean {
    const vin = normalizeVin(input);
    return Object.values(ruleExclusions).some(({ prefix }) => vin.startsWith(prefix));
}
