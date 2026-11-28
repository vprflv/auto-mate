'use client';

import { formatFrameRuleLines, readFrameRuleLines } from '@/features/garage/add/lib/catalogFrameRules';
import { compareCatalogModificationAttributes } from '@/features/catalog/lib/sortCatalogModifications';
import { useRef, useState, type FormEvent } from 'react';
import { Settings2, X } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { toast } from 'sonner';

import type { InboxItem, StoredMasterModel, VinTrainingDraft } from '@/features/admin/lib/system-store/types';
import { MergeModificationModal } from '@/features/admin/catalog/components/MergeModificationModal';
import { type CatalogReviewAction, approveVinTraining, findVinTrainingDuplicate, skipDuplicateVinTraining, getVinTrainingComparisons, getVinTrainingTargets, isBlockingVinTrainingConflict, planVinTrainingCatalog } from '@/features/admin/lib/system-store/vinTraining';
import { buildVinTrainingDraft, buildVinTrainingRule, getApplicableVinTrainingRules, vinTrainingInput, vinTrainingRuleLabel } from '@/features/admin/lib/system-store/vinTrainingDraft';
import { isSharedSs11Model, isBelgeeS50SharedVinSample } from '@/features/garage/add/lib/belgeeS50Vin';
import { normalizeFacelift } from '@/features/catalog/lib/facelift';
import { getVinModelYearConflicts, getVinRuleConflicts } from '@/features/garage/add/lib/catalogVinRules';
import { FaceliftEditor } from '@/features/catalog/components/FaceliftEditor';
import { buildModificationName } from '@/features/catalog/lib/buildModificationName';
import { VinTrainingProbe } from './VinTrainingProbe';
import { VinTrainingConflicts } from './VinTrainingConflicts';
import { VinTrainingRuleComparison } from './VinTrainingRuleComparison';
import { isValidModelYear, isValidVin, isValidVinPrefix, MAX_MODEL_YEAR, MIN_MODEL_YEAR, normalizeVin } from '@/features/garage/add/lib/config/vin';

const editableFields = [
    ['brand', 'Марка'],
    ['model', 'Модель'],
    ['name', 'Название модификации'],
    ['year', 'Год начала выпуска'],
    ['yearEnd', 'Год окончания выпуска'],
    ['bodyCode', 'Код кузова'],
    ['bodyClass', 'Тип кузова'],
    ['facelift', 'Версия кузова'],
    ['engine', 'Двигатель'],
    ['displacementL', 'Объём двигателя, л'],
    ['transmission', 'КПП'],
    ['drivetrain', 'Привод'],
    ['fuel', 'Топливо'],
    ['trim', 'Комплектация'],
    ['source', 'Источник'],
] as const;

const comparisonLabels = new Map<string, string>([...editableFields, ['years', 'Годы выпуска']]);

const fieldClass = 'w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--link)]';

interface Props {
    item: InboxItem;
    models: StoredMasterModel[];
    onReject: (id: string) => void;
}

function VinTrainingReviewForm({ item, models, onReject, draft }: Props & { draft: VinTrainingDraft }) {
    const [fields, setFields] = useState<Record<string, string | undefined>>(() => ({
        ...draft.attributes,
        facelift: normalizeFacelift(draft.attributes.facelift),
        brand: item.carBrand,
        model: item.carModel,
        source: draft.source,
        vin: draft.vinRules.map(vinTrainingRuleLabel).join('\n'),
        frame: formatFrameRuleLines(draft.frameRules),
    }));
    const [vinYears, setVinYears] = useState<Record<string, string>>(() => Object.fromEntries(
        draft.vinRules.flatMap(rule => rule.modelYear === undefined ? [] : [[vinTrainingRuleLabel(rule), String(rule.modelYear)]])
    ));
    const importedMasks = new Map(draft.vinRules.filter(rule => vinTrainingRuleLabel(rule).includes('*'))
        .map(rule => [vinTrainingRuleLabel(rule), rule]));
    const sampleFor = (label: string) => importedMasks.get(label)?.sample ?? label;
    const vinSamples = (fields.vin ?? '').split(/\s+/).filter(Boolean).map(normalizeVin);
    const sharedModel = isSharedSs11Model(fields.brand ?? '', fields.model ?? '');
    const sharedSamples = sharedModel && vinSamples.some(label => isBelgeeS50SharedVinSample(sampleFor(label)));
    const yearSamples = [...new Set(vinSamples)].filter(label => {
        const sample = sampleFor(label);
        return (isValidVin(sample) || isValidVinPrefix(sample)) && !(sharedModel && isBelgeeS50SharedVinSample(sample));
    });
    const [customName, setCustomName] = useState<string | null>(null);
    const sourceName = draft.name?.trim();
    const generatedName = buildModificationName(fields);
    const name = customName ?? generatedName;
    const [selectedId, setSelectedId] = useState('');
    const [mergeCard, setMergeCard] = useState<{ model: StoredMasterModel; source: NonNullable<StoredMasterModel['modifications']>[number]; targetIds: string[] }>();
    const [editAction, setEditAction] = useState<'update' | 'replace' | ''>('');
    const advanced = useRef<HTMLDetailsElement>(null);
    const vinField = useRef<HTMLTextAreaElement>(null);
    const yearFields = useRef(new Map<string, HTMLInputElement>());
    const [removed, setRemoved] = useState<{ vin: string; years: Record<string, string> }>();
    const [error, setError] = useState('');
    const specs = item.carSpecs;
    const garageFields = [
        ['VIN автомобиля', item.carVin],
        ['Код двигателя', specs?.engineCode],
        ['Количество цилиндров', specs?.cylinders],
        ['Количество дверей', specs?.doors],
        ['Страна сборки', specs?.plantCountry],
        ['Цвет', specs?.color],
    ].filter(([, value]) => typeof value === 'string' && value.trim());

    const frameRules = readFrameRuleLines(fields.frame ?? '');
    const parsed = vinTrainingInput.safeParse({
        frame: frameRules,
        ...Object.fromEntries(editableFields.map(([key]) => [key, fields[key]?.trim() || undefined])),
        name: customName ?? sourceName ?? undefined,
        year: fields.year?.trim() ? Number(fields.year) : undefined,
        yearEnd: fields.yearEnd?.trim() ? Number(fields.yearEnd) : undefined,
        vin: vinSamples.map(label => ({
            sample: sampleFor(label),
            modelYear: vinYears[label]?.trim() ? Number(vinYears[label]) : undefined,
            positions: importedMasks.get(label)?.positions,
        })),
    });
    const editedDraft = parsed.success ? buildVinTrainingDraft(parsed.data) : undefined;
    const reviewItem = parsed.success ? {
        ...item,
        carBrand: parsed.data.brand,
        carModel: parsed.data.model,
        vinTraining: editedDraft,
    } : undefined;
    const duplicate = reviewItem && !item.garageCarVersions ? findVinTrainingDuplicate(reviewItem, models) : undefined;
    const comparisons = reviewItem ? getVinTrainingComparisons(reviewItem, models) : [];
    const targets = getVinTrainingTargets(comparisons);
    const rules = yearSamples.map(label => {
        const year = Number(vinYears[label]);
        return buildVinTrainingRule(sampleFor(label), isValidModelYear(year) ? year : undefined, undefined, importedMasks.get(label)?.positions);
    });
    const overlaps = getVinRuleConflicts(rules, models);
    const overlappingCards = new Set(overlaps.map(conflict => conflict.modification));
    comparisons.sort((first, second) => Number(overlappingCards.has(second.modification)) - Number(overlappingCards.has(first.modification)) ||
        Number(second.exact) - Number(first.exact) || compareCatalogModificationAttributes(first.modification.attributes, second.modification.attributes));
    const suggestedTarget = targets.exact.length === 1 ? targets.exact[0] : undefined;
    const selectedTarget = targets.available.find(candidate => candidate.modification.id === selectedId);
    const candidate = selectedId === 'separate' ? undefined : selectedTarget ?? suggestedTarget;
    const target = candidate?.modification;
    const targetId = target?.id ?? '';
    const hasCollision = comparisons.length > 0;
    const canCreate = targets.exact.length === 0;
    const showTargetPicker = targets.available.length > 1 || (hasCollision && canCreate);
    const action: CatalogReviewAction | undefined = selectedId === 'separate' && canCreate ? 'separate'
        : candidate && !candidate.exact ? editAction || undefined : undefined;
    const needsTarget = hasCollision && (!target ? action !== 'separate' : !candidate?.exact && !action);
    const conflicts = (target ? getVinRuleConflicts(rules, models, target) : [...overlaps]).sort((first, second) =>
        compareCatalogModificationAttributes(first.modification.attributes, second.modification.attributes)
    );
    const yearConflicts = getVinModelYearConflicts(rules, target?.vinRules);
    const blocked = conflicts.some(conflict => isBlockingVinTrainingConflict(conflict, reviewItem, action)) || yearConflicts.length > 0;

    function chooseTarget(id: string) {
        setSelectedId(id);
        setEditAction('');
        setError('');
    }

    function editVin(sample: string) {
        if (advanced.current) advanced.current.open = true;
        const field = vinField.current;
        const token = [...(field?.value ?? '').matchAll(/\S+/g)].find(match => normalizeVin(match[0]) === sample);
        field?.scrollIntoView({ block: 'center' });
        field?.focus({ preventScroll: true });
        if (field && token) field.setSelectionRange(token.index, token.index + token[0].length);
    }

    function editVinYear(sample: string) {
        if (advanced.current) advanced.current.open = true;
        const field = yearFields.current.get(sample);
        field?.scrollIntoView({ block: 'center' });
        field?.focus({ preventScroll: true });
        field?.select();
    }

    function removeVin(sample: string) {
        setRemoved({ vin: fields.vin ?? '', years: vinYears });
        setFields(previous => ({ ...previous, vin: vinSamples.filter(value => value !== sample).join('\n') }));
        setVinYears(previous => Object.fromEntries(Object.entries(previous).filter(([value]) => value !== sample)));
        setError('');
    }

    function restoreVin() {
        if (!removed) return;
        setFields(previous => ({ ...previous, vin: removed.vin }));
        setVinYears(removed.years);
        setRemoved(undefined);
        setError('');
    }

    function changeVinYear(sample: string, year: string) {
        setRemoved(undefined);
        setVinYears(previous => ({ ...previous, [sample]: year }));
        setError('');
    }

    function updateField(key: string, value: string) {
        if (key !== 'vin' && key !== 'frame') setEditAction('');
        if (key === 'name') setCustomName(value);
        else setFields(previous => ({ ...previous, [key]: value }));
        if (key === 'vin') {
            setRemoved(undefined);
            const retained = new Set(value.split(/\s+/).filter(Boolean).map(normalizeVin));
            setVinYears(previous => Object.fromEntries(Object.entries(previous).filter(([sample]) => retained.has(sample))));
        }
        setError('');
    }

    function approve(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!duplicate && (blocked || needsTarget)) return;
        setError('');
        if (!parsed.success) {
            if (advanced.current) advanced.current.open = true;
            const issue = parsed.error.issues[0];
            const key = issue.path[0];
            const label = key === 'frame' ? 'Правила Frame' : key === 'vin' ? 'VIN-правила' : editableFields.find(([name]) => name === key)?.[1];
            setError(label ? `Проверьте поле «${label}». ${issue.message}` : issue.message);
            return;
        }
        try {
            if (duplicate) {
                skipDuplicateVinTraining(item.id, parsed.data);
                toast.success('Дубль пропущен. Данные уже есть в каталоге.');
                return;
            }
            const linked = approveVinTraining(item.id, parsed.data, targetId || undefined, action);
            toast.success(frameRules.length && !rules.length ? 'Правила Frame сохранены в каталоге.' : !rules.length ? 'Модификация одобрена.' : linked
                ? `VIN-правила сохранены. Привязано машин: ${linked}.` : frameRules.length ? 'Правила VIN и Frame сохранены в каталоге.' : 'VIN-правила сохранены в каталоге.');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Не удалось одобрить заявку.');
        }
    }

    return (
        <>
        <form noValidate onSubmit={approve} className="flex min-h-0 flex-col">
            <div className="min-h-0 space-y-5 overflow-y-auto p-5">
                <section className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                    <h3 className="font-semibold">
                        {duplicate ? 'Данные уже есть в каталоге' : blocked ? 'Проверьте пересечения VIN'
                            : target ? (rules.length || frameRules.length ? 'Добавить правила к существующей модификации' : 'Подтвердить существующую модификацию')
                                : needsTarget ? 'Выберите модификацию' : 'Создать новую модификацию'}
                    </h3>
                    <p className="break-words text-sm">{candidate ? [candidate.model.brandName, candidate.model.modelName, target?.name].join(' · ') : [fields.brand, fields.model, name].filter(Boolean).join(' · ')}</p>
                    <p className="text-xs text-[var(--text-muted)]">VIN-правил в заявке: {rules.length}</p>
                    {frameRules.length > 0 && (
                        <p className="break-words text-sm">Правила Frame: {frameRules.length}</p>
                    )}
                    {sharedSamples && (
                        <p className="text-sm text-[var(--text-muted)]">
                            Сверьте характеристики модификации перед одобрением.
                        </p>
                    )}
                    {duplicate && (
                        <p role="status" className="text-sm text-[var(--text-muted)]">
                            Характеристики и правила уже есть в карточке «{duplicate.modification.name}».
                        </p>
                    )}
                    {!duplicate && hasCollision && canCreate && action !== 'separate' && (
                        <button type="button" onClick={() => chooseTarget('separate')}
                            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--bg)]">
                            Сохранить как отдельную модификацию
                        </button>
                    )}
                    {!duplicate && showTargetPicker && (
                        <label className="block space-y-1 text-sm">
                            <span>{rules.length || frameRules.length ? 'Куда добавить правила' : 'Модификация в каталоге'}</span>
                            <select value={targetId || (action === 'separate' ? 'separate' : '')} onChange={event => chooseTarget(event.target.value)} className={fieldClass}>
                                {!target && <option value="">Выберите действие или карточку</option>}
                                {canCreate && <option value="separate">Сохранить как отдельную модификацию</option>}
                                {targets.available.map(({ model, modification }) => <option key={modification.id} value={modification.id}>{model.modelName} · {modification.name}</option>)}
                            </select>
                        </label>
                    )}
                    {!duplicate && candidate && !candidate.exact && (
                        <label className="block space-y-1 text-sm">
                            <span>Действие с карточкой {candidate.model.modelName}</span>
                            <select value={editAction} onChange={event => {
                                const value = event.target.value;
                                setEditAction(value === 'update' || value === 'replace' ? value : '');
                                setError('');
                            }} className={fieldClass}>
                                <option value="">Выберите действие</option>
                                <option value="update">Объединить с карточкой: добавить правила и заполнить пустые поля</option>
                                <option value="replace">Заменить: применить данные из заявки</option>
                            </select>
                            <span className="block text-xs text-[var(--text-muted)]">
                                Правила добавятся к карточке в модели {candidate.model.modelName}. Для модели {fields.model} можно сохранить отдельную карточку.
                            </span>
                        </label>
                    )}
                </section>

                {comparisons.length > 0 && (
                    <section className="space-y-2">
                        <h3 className="text-sm font-semibold">Сравнение с каталогом</h3>
                        {comparisons.map(({ model, modification, exact, fields }, index) => (
                            <details open={index === 0 || target === modification} key={modification.id} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 text-xs">
                                <summary className="cursor-pointer break-words font-medium">
                                    {model.modelName} · {modification.name} · {exact ? 'Характеристики совпадают' : `Различий: ${fields.filter(field => !field.matches).length}`}
                                    {fields.some(field => field.field === 'transmission' && !field.compatible) && ' · КПП различается'}
                                    {overlaps.some(conflict => conflict.modification === modification) && ' · Есть пересечение VIN'}
                                </summary>
                                <div className="mt-2 overflow-x-auto">
                                    <table className="w-full border-collapse text-left">
                                        <thead className="text-[var(--text-muted)]">
                                            <tr>
                                                <th scope="col" className="p-1">Поле</th>
                                                <th scope="col" className="p-1">В заявке</th>
                                                <th scope="col" className="p-1">В каталоге</th>
                                                <th scope="col" className="p-1">Сравнение</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...fields].sort((first, second) => Number(first.matches) - Number(second.matches)).map(({ field, entered, stored, matches }) => (
                                                <tr key={field} className="border-t border-[var(--border)]">
                                                    <th scope="row" className="p-1 font-medium">{comparisonLabels.get(field)}</th>
                                                    <td className="break-words p-1">{entered}</td>
                                                    <td className="break-words p-1">{stored || '—'}</td>
                                                    <td className={matches ? 'p-1 font-medium text-emerald-700 dark:text-emerald-300' : 'p-1 font-semibold text-[var(--danger)]'}>
                                                        {matches ? 'Совпадает' : stored ? 'Различается' : 'Не заполнено'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <VinTrainingRuleComparison
                                    rules={rules}
                                    transmission={fields.find(field => field.field === 'transmission')?.entered}
                                    modification={modification}
                                    overlaps={overlaps.filter(conflict => conflict.modification === modification)}
                                />
                                {targets.available.some(candidate => candidate.modification === modification) && target !== modification && (
                                    <button type="button" onClick={() => { chooseTarget(modification.id); if (!exact) setEditAction('update'); }}
                                        className="mt-2 text-sm font-medium text-[var(--link)] hover:underline">
                                        {exact ? 'Использовать эту карточку' : 'Объединить заявку с карточкой'}
                                    </button>
                                )}
                                {overlappingCards.has(modification) && overlaps.some(other => other.model === model && other.modification !== modification) && (
                                    <button type="button" className="mt-3 block rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium" onClick={() => {
                                        const targetIds = [...new Set(overlaps.filter(other => other.model === model && other.modification !== modification)
                                            .map(other => other.modification.id))];
                                        setMergeCard({ model, source: modification, targetIds });
                                    }}>
                                        Объединить карточки каталога
                                    </button>
                                )}
                            </details>
                        ))}
                    </section>
                )}

                {(conflicts.length > 0 || yearConflicts.length > 0) && (
                    <VinTrainingConflicts
                        blocking={blocked}
                        conflicts={conflicts}
                        yearConflicts={yearConflicts}
                        target={target}
                        selectable={targets.available.map(candidate => candidate.modification)}
                        onSelect={chooseTarget}
                        onEdit={editVin}
                        onEditYear={editVinYear}
                        onRemove={removeVin}
                        onUseCatalogYear={(sample, year) => changeVinYear(sample, String(year))}
                    />
                )}
                {removed && (
                    <button type="button" onClick={restoreVin} className="text-sm font-medium text-[var(--link)] hover:underline">
                        Отменить удаление VIN-правила
                    </button>
                )}
                <details ref={advanced} className="rounded-xl border border-[var(--border)] p-3">
                    <summary className="cursor-pointer text-sm font-semibold">Дополнительно</summary>
                    <div className="mt-4 space-y-4">
                        <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
                            {editableFields.map(([key, label]) => (
                                <div key={key} className={key === 'name' ? 'min-w-0 sm:col-span-2' : 'min-w-0'}>
                                    {key === 'facelift' ? (
                                        <FaceliftEditor value={fields.facelift} onChange={value => updateField(key, value)} className={fieldClass} />
                                    ) : (
                                        <label className="block space-y-1">
                                            <span className="text-xs text-[var(--text-muted)]">{label}</span>
                                            <input
                                                value={key === 'name' ? name : fields[key] ?? ''}
                                                placeholder={key === 'name' ? generatedName : undefined}
                                                onChange={event => updateField(key, event.target.value)}
                                                inputMode={key === 'year' || key === 'yearEnd' ? 'numeric' : key === 'displacementL' ? 'decimal' : undefined}
                                                className={fieldClass}
                                            />
                                        </label>
                                    )}
                                    {key === 'name' && (
                                        <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-[var(--link)]">
                                            {customName !== null && (
                                                <button type="button" onClick={() => { setCustomName(null); setError(''); }} className="hover:underline">
                                                    Собрать автоматически
                                                </button>
                                            )}
                                            {sourceName && sourceName !== name && (
                                                <button type="button" onClick={() => updateField('name', sourceName)} className="break-all text-left hover:underline">
                                                    Взять из заявки: {sourceName}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <label className="block space-y-2 text-sm">
                            <span className="font-semibold">VIN-правила</span>
                            <textarea ref={vinField} value={fields.vin ?? ''} onChange={event => updateField('vin', event.target.value)}
                                rows={3} spellCheck={false} className={`${fieldClass} font-mono`} />
                            <span className="block text-xs text-[var(--text-muted)]">
                                По одному правилу на строку. Импортированные маски показаны со звёздочками.
                            </span>
                        </label>

                        <label className="block space-y-1 text-sm">
                            <span className="block font-medium">Правила Frame</span>
                            <span className="block text-xs text-[var(--text-muted)]">Один объект на строку. Отсчёт позиций с нуля после дефиса.</span>
                            <textarea value={fields.frame ?? ''} rows={3} className={fieldClass}
                                onChange={event => updateField('frame', event.target.value)}
                                placeholder={'{"sample":"GD1-1234567","positions":[0]}'} />
                        </label>

                        {yearSamples.length > 0 && (
                            <fieldset className="space-y-2 rounded-xl border border-[var(--border)] p-3">
                                <legend className="px-1 text-sm font-medium">Подтверждённый модельный год</legend>
                                <p className="text-xs text-[var(--text-muted)]">Укажите год для тех VIN-правил, для которых он подтверждён источником.</p>
                                {yearSamples.map(sample => (
                                    <label key={sample} className="grid items-center gap-2 text-sm sm:grid-cols-2">
                                        <code className="break-all">{sample}</code>
                                        <input type="number" min={MIN_MODEL_YEAR} max={MAX_MODEL_YEAR} step={1}
                                            ref={field => {
                                                if (field) yearFields.current.set(sample, field);
                                                else yearFields.current.delete(sample);
                                            }}
                                            aria-label={`Модельный год для ${sample}`}
                                            value={vinYears[sample] ?? ''}
                                            onChange={event => changeVinYear(sample, event.target.value)}
                                            placeholder="Не указан" className={fieldClass} />
                                    </label>
                                ))}
                            </fieldset>
                        )}

                        <VinTrainingProbe
                            models={models}
                            initialVin={item.carVin}
                            conflicts={blocked}
                            afterUnavailable={!parsed.success
                                ? 'Чтобы увидеть результат после одобрения, заполните поля заявки и VIN-правила.'
                                : 'Выберите модификацию, к которой будут добавлены правила.'}
                            buildPreview={parsed.success && editedDraft && !needsTarget
                                ? () => planVinTrainingCatalog(
                                    { carBrand: parsed.data.brand, carModel: parsed.data.model },
                                    editedDraft, models, target, `preview_${item.id}`, action
                                ).masterModels
                                : undefined}
                        />

                        {garageFields.length > 0 && (
                            <section className="space-y-2">
                                <h3 className="text-sm font-semibold">Исходные данные из гаража</h3>
                                <dl className="grid gap-2 sm:grid-cols-2">
                                    {garageFields.map(([label, value]) => (
                                        <div key={label} className="border-b border-[var(--border)] pb-2">
                                            <dt className="text-xs text-[var(--text-muted)]">{label}</dt>
                                            <dd className="break-words text-sm">{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>
                        )}

                    </div>
                </details>
            </div>

            <footer className="shrink-0 space-y-2 border-t border-[var(--border)] p-4">
                {error && <p role="alert" className="text-sm text-[var(--danger)]">{error}</p>}
                <div className="flex flex-wrap justify-end gap-2">
                    <button type="button" onClick={() => onReject(item.id)} className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--danger)]">
                        Отклонить
                    </button>
                    <Dialog.Close asChild>
                        <button type="button" className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm">
                            Закрыть без сохранения
                        </button>
                    </Dialog.Close>
                    <button type="submit" disabled={!duplicate && (blocked || needsTarget)}
                        className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
                        {duplicate ? 'Пропустить дубль' : blocked ? 'Исправьте пересечения' : needsTarget ? 'Выберите действие' : action === 'update' ? 'Объединить с карточкой'
                            : action === 'replace' ? 'Заменить данные карточки' : action === 'separate' ? 'Сохранить отдельно' : target
                            ? (rules.length || frameRules.length ? 'Добавить правила' : 'Подтвердить модификацию') : 'Создать модификацию'}
                    </button>
                </div>
            </footer>
        </form>
        {mergeCard && (
            <MergeModificationModal {...mergeCard} onClose={() => setMergeCard(undefined)} onMerged={id => {
                setMergeCard(undefined);
                chooseTarget(id);
                setEditAction('update');
            }} />
        )}
        </>
    );
}

export function VinTrainingInboxCard({ item, models, onReject }: Props) {
    const draft = item.vinTraining;
    if (!draft) return null;

    const { year, yearEnd, bodyCode, engine, transmission, drivetrain } = draft.attributes;
    const hasFrameRules = Boolean(draft.frameRules?.length);
    const modificationOnly = !hasFrameRules && !getApplicableVinTrainingRules(item.carBrand, item.carModel, draft.vinRules).length;
    const origin = hasFrameRules ? (item.carSpecs?.frameNumber ? 'Предложение по Frame из гаража' : 'Правила Frame из JSON') : modificationOnly ? 'Модификация из JSON' : item.carVin ? 'Предложение по VIN из гаража' : 'Обучение VIN-декодера';

    return (
        <Dialog.Root>
            <article className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                <p className="text-xs font-medium text-[var(--text-muted)]">{origin}</p>
                <h3 className="break-words font-semibold">
                    {item.carBrand} {item.carModel} · {buildModificationName(draft.attributes) || draft.name}
                </h3>
                <p className="text-sm text-[var(--text-muted)]">
                    {[year === yearEnd ? year : `${year}–${yearEnd}`, bodyCode, engine, transmission, drivetrain].filter(Boolean).join(' · ')}
                </p>
                <Dialog.Trigger asChild>
                    <button type="button" className="mt-auto inline-flex w-fit items-center gap-2 rounded-xl bg-[var(--link)] px-3 py-2 text-sm font-semibold text-[var(--btn-primary-text)]">
                        <Settings2 className="h-4 w-4" aria-hidden="true" />
                        Модерировать
                    </button>
                </Dialog.Trigger>
            </article>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[300] bg-black/60" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-[301] flex max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--text)] shadow-2xl">
                    <header className="flex shrink-0 justify-between gap-4 border-b border-[var(--border)] p-5">
                        <div>
                            <Dialog.Title className="text-lg font-bold">{modificationOnly ? 'Модерация модификации' : hasFrameRules ? 'Модерация правил поиска' : 'Модерация VIN-заявки'}</Dialog.Title>
                            <Dialog.Description className="mt-1 text-sm text-[var(--text-muted)]">
                                {origin}{item.submittedBy ? ` · ${item.submittedBy}` : ''}
                            </Dialog.Description>
                        </div>
                        <Dialog.Close asChild>
                            <button type="button" aria-label="Закрыть заявку" className="h-fit rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]">
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </Dialog.Close>
                    </header>
                    <VinTrainingReviewForm item={item} models={models} onReject={onReject} draft={draft} />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
