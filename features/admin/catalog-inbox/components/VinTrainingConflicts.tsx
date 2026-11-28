import type { CatalogModification } from '@/features/admin/lib/system-store/types';
import { vinRuleKey, type getVinModelYearConflicts, type getVinRuleConflicts } from '@/features/garage/add/lib/catalogVinRules';
import { vinTrainingRuleLabel } from '@/features/admin/lib/system-store/vinTrainingDraft';

type Props = {
    blocking: boolean;
    conflicts: ReturnType<typeof getVinRuleConflicts>;
    yearConflicts: ReturnType<typeof getVinModelYearConflicts>;
    target?: CatalogModification;
    selectable: CatalogModification[];
    onSelect: (id: string) => void;
    onEdit: (sample: string) => void;
    onEditYear: (sample: string) => void;
    onRemove: (sample: string) => void;
    onUseCatalogYear: (sample: string, year: number) => void;
};

const linkClass = 'font-medium text-[var(--link)] hover:underline';

export function VinTrainingConflicts({
    blocking, conflicts, yearConflicts, target, selectable, onSelect, onEdit, onEditYear, onRemove, onUseCatalogYear,
}: Props) {
    const grouped = new Map<string, typeof conflicts>();
    for (const conflict of conflicts) {
        const sample = vinTrainingRuleLabel(conflict.incomingRule);
        grouped.set(sample, [...(grouped.get(sample) ?? []), conflict]);
    }

    return (
        <section className={`space-y-3 rounded-2xl border bg-[var(--bg)] p-4 text-sm ${blocking ? 'border-[var(--danger)]/50' : 'border-[var(--border)]'}`}>
            <h3 className="font-semibold">Пересечения VIN-правил</h3>
            <p className="text-[var(--text-muted)]">
                {blocking ? 'Совпадают точные правила или расходятся модельные годы. Исправьте данные перед одобрением.' : 'Пересечение масок допустимо. При поиске пользователь сможет выбрать одну из подходящих карточек.'}
            </p>
            {grouped.size > 0 && (
                <p className="font-medium">Правил заявки с пересечениями: {grouped.size}</p>
            )}
            {[...grouped].map(([sample, matches], index) => (
                <details key={sample} open={index === 0} className="rounded-xl border border-[var(--border)] p-3">
                    <summary className="cursor-pointer break-words font-semibold">
                        <code>{sample}</code> · {matches.length === 1 ? matches[0].modification.name : `пересечений: ${matches.length}`}
                    </summary>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs">
                        <button type="button" onClick={() => onEdit(sample)} className={linkClass}>Исправить VIN в заявке</button>
                        <button type="button" onClick={() => onRemove(sample)} className="font-medium text-[var(--danger)] hover:underline">
                            Убрать из заявки
                        </button>
                    </div>
                    <ul className="mt-3 space-y-3">
                        {matches.map(({ model, modification, incomingMask, storedMask, incomingRule, storedRule, exampleVin }) => {
                            const common = [...incomingMask].map((char, index) =>
                                char !== '*' && char === storedMask[index] ? char : '·'
                            ).join('');
                            const path = `/admin/catalog/${encodeURIComponent(model.brandSlug)}/${encodeURIComponent(model.modelSlug)}`;
                            return (
                                <li key={JSON.stringify([model.brandSlug, model.modelSlug, modification.id, storedMask])}
                                    className="space-y-2 border-t border-[var(--border)] pt-3">
                                    <p className="break-words font-semibold">{model.brandName} {model.modelName} · {modification.name}</p>
                                    <details>
                                        <summary className="cursor-pointer text-xs font-medium">Показать маски и общий VIN</summary>
                                        <dl className="mt-1 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
                                        <dt>Маска заявки</dt><dd className="break-all"><code>{incomingMask}</code>{incomingRule.modelYear && ` · ${incomingRule.modelYear} г.`}</dd>
                                        <dt>Маска в каталоге</dt><dd className="break-all"><code>{storedMask}</code>{storedRule.modelYear && ` · ${storedRule.modelYear} г.`}</dd>
                                        <dt>Совпавшие символы</dt><dd className="break-all"><code>{common}</code></dd>
                                        <dt>Пример общего VIN</dt><dd className="break-all"><code>{exampleVin}</code></dd>
                                        </dl>
                                    </details>
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                                        <a href={`${path}?editModification=${encodeURIComponent(modification.id)}`}
                                            target="_blank" rel="noreferrer" className={linkClass}>Открыть карточку каталога</a>
                                        {selectable.includes(modification) && (
                                            <button type="button" onClick={() => onSelect(modification.id)} className={linkClass}>
                                                Выбрать эту карточку
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </details>
            ))}
            {yearConflicts.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-semibold">Для одного VIN указаны разные модельные годы</h4>
                    {yearConflicts.map(({ incomingRule, otherRule, inCatalog, exampleVin }) => {
                        const sample = vinTrainingRuleLabel(incomingRule);
                        const catalogYear = inCatalog ? otherRule.modelYear : undefined;
                        return (
                            <div key={JSON.stringify([sample, incomingRule.modelYear, vinRuleKey(otherRule), otherRule.modelYear, inCatalog])}
                                className="space-y-2 rounded-xl border border-[var(--border)] p-3">
                                <p className="break-words">
                                    В заявке <code>{sample}</code> · {incomingRule.modelYear} г.
                                </p>
                                <p className="break-words">
                                    {inCatalog ? 'В каталоге' : 'Другое правило заявки'} <code>{vinRuleKey(otherRule)}</code> · {otherRule.modelYear} г.
                                    {inCatalog && target && ` · ${target.name}`}
                                </p>
                                <p className="text-xs">Пример общего VIN <code className="break-all">{exampleVin}</code></p>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                                    <button type="button" onClick={() => onEditYear(sample)} className={linkClass}>
                                        Исправить модельный год
                                    </button>
                                    {catalogYear !== undefined && (
                                        <button type="button" onClick={() => onUseCatalogYear(sample, catalogYear)} className={linkClass}>
                                            Взять год из каталога ({catalogYear})
                                        </button>
                                    )}
                                    <button type="button" onClick={() => onRemove(sample)} className="font-medium text-[var(--danger)] hover:underline">
                                        Убрать из заявки
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
