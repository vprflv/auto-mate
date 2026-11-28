import type { CatalogModification, CatalogVinRule } from '@/features/admin/lib/system-store/types';
import { formatTransmission } from '@/features/garage/add/lib/config/robotTransmission';
import { catalogVinRuleMatches, isValidCatalogVinRule, vinRuleKey, type getVinRuleConflicts } from '@/features/garage/add/lib/catalogVinRules';

import { isValidVin, normalizeVin } from '@/features/garage/add/lib/config/vin';

type Props = {
    rules: CatalogVinRule[];
    transmission?: string;
    modification: CatalogModification;
    overlaps: ReturnType<typeof getVinRuleConflicts>;
};

function RuleList({ rules, exceptions = [] }: { rules: CatalogVinRule[]; exceptions?: string[] }) {
    const byMaskAndYear = new Map(rules.map(rule => [JSON.stringify([vinRuleKey(rule), rule.modelYear]), rule]));
    if (!byMaskAndYear.size && !exceptions.length) {
        return <p className="text-[var(--text-muted)]">VIN-правила не указаны</p>;
    }
    return (
        <ul className="max-h-48 space-y-1 overflow-y-auto">
            {[...byMaskAndYear].map(([key, rule]) => (
                <li key={key} className="break-words">
                    <code className="break-all">{vinRuleKey(rule)}</code>
                    {rule.modelYear !== undefined && <span className="text-[var(--text-muted)]"> · {rule.modelYear} г.</span>}
                </li>
            ))}
            {exceptions.map(vin => (
                <li key={vin} className="break-words">
                    <code className="break-all">{vin}</code>
                    <span className="text-[var(--text-muted)]"> · исключение</span>
                </li>
            ))}
        </ul>
    );
}

export function VinTrainingRuleComparison({ rules, transmission, modification, overlaps }: Props) {
    const storedRules = (Array.isArray(modification.vinRules) ? modification.vinRules : []).filter(isValidCatalogVinRule);
    const exceptions = Array.isArray(modification.vinExceptions)
        ? [...new Set(modification.vinExceptions.filter(vin => typeof vin === 'string' && isValidVin(vin)).map(normalizeVin))]
        : [];
    const exceptionMatches = exceptions.flatMap(vin =>
        rules.filter(rule => catalogVinRuleMatches(rule, vin)).map(rule => ({ vin, rule }))
    );

    return (
        <section className="mt-3 space-y-2 border-t border-[var(--border)] pt-3 text-xs">
            <h4 className="font-semibold">Сравнение VIN-правил</h4>
            {overlaps.length > 0 ? (
                <div className="space-y-1 rounded-lg border border-[var(--danger)]/40 p-2">
                    <p className="font-semibold text-[var(--danger)]">Пересечения обычных правил</p>
                    <ul className="space-y-1">
                        {overlaps.map(({ incomingMask, storedMask, exampleVin }) => (
                            <li key={JSON.stringify([incomingMask, storedMask])} className="break-words">
                                В заявке <code className="break-all">{incomingMask}</code>
                                {' · '}в каталоге <code className="break-all">{storedMask}</code>
                                {' · '}общий VIN <code className="break-all">{exampleVin}</code>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : storedRules.length > 0 && rules.length > 0 ? (
                <p className="font-medium">Обычные VIN-правила не пересекаются.</p>
            ) : null}

            {exceptionMatches.length > 0 && (
                <div className="space-y-1 rounded-lg border border-amber-500/40 p-2">
                    <p className="font-semibold">Правила заявки охватывают VIN-исключения этой карточки</p>
                    <ul className="space-y-1">
                        {exceptionMatches.map(({ vin, rule }) => (
                            <li key={JSON.stringify([vinRuleKey(rule), vin])}>
                                В заявке <code className="break-all">{vinRuleKey(rule)}</code>
                                {' · '}исключение в каталоге <code className="break-all">{vin}</code>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
                <div className="min-w-0 space-y-1 rounded-lg border border-[var(--border)] p-2">
                    <h5 className="font-semibold">В заявке · {formatTransmission(transmission) || 'КПП не указана'}</h5>
                    <RuleList rules={rules} />
                </div>
                <div className="min-w-0 space-y-1 rounded-lg border border-[var(--border)] p-2">
                    <h5 className="font-semibold">В каталоге · {formatTransmission(modification.attributes?.transmission) || 'КПП не указана'}</h5>
                    <RuleList rules={storedRules} exceptions={exceptions} />
                </div>
            </div>
        </section>
    );
}
