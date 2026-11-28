'use client';

import { useId } from 'react';
import { FaceliftEditor } from '@/features/catalog/components/FaceliftEditor';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import { isVinMaskSpecific } from '@/features/garage/add/lib/catalogVinRules';
import { isValidVin, isValidVinPrefix, MAX_MODEL_YEAR, MIN_MODEL_YEAR, VIN_LENGTH, normalizeVin } from '@/features/garage/add/lib/config/vin';

import type { useModificationForm } from '../hooks/useModificationForm';

interface Props {
    form: ReturnType<typeof useModificationForm>;
}

const mainFields = [
    {
        key: 'year',
        label: 'Год начала выпуска',
        placeholder: 'Например, 2008',
    },
    {
        key: 'yearEnd',
        label: 'Год окончания выпуска (необязательно)',
        placeholder: 'Например, 2013',
    },
    {
        key: 'trim',
        label: 'Комплектация',
        placeholder: 'Например, Comfort',
    },
    {
        key: 'bodyCode',
        label: 'Номер кузова (необязательно)',
        placeholder: 'Например, CL9',
    },
    {
        key: 'bodyClass',
        label: 'Тип кузова',
        placeholder: 'Например, Седан',
    },
    {
        key: 'fuel',
        label: 'Тип топлива',
        placeholder: 'Например, Бензин',
    },
    {
        key: 'engine',
        label: 'Двигатель',
        placeholder: 'Например, H22A',
    },
    {
        key: 'displacementL',
        label: 'Объём двигателя, л (необязательно)',
        placeholder: 'Например, 2.0',
    },
    {
        key: 'transmission',
        label: 'КПП',
        placeholder: 'Автомат (5AT), Механика (6MT)',
    },
    {
        key: 'drivetrain',
        label: 'Привод',
    },
] as const;

const driveOptions = [
    { value: 'FWD', label: 'FWD — передний' },
    { value: 'RWD', label: 'RWD — задний' },
    { value: 'AWD', label: 'AWD — полный' },
    { value: '4WD', label: '4WD — полный' },
] as const;

const inputClassName =
    'w-full rounded-xl border border-[var(--border)] ' +
    'bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] ' +
    'outline-none transition focus:border-[var(--link)]';

export function ModificationFormFields({ form }: Props) {
    const idPrefix = useId();

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FaceliftEditor value={form.fields.facelift} onChange={value => form.setField('facelift', value)} className={inputClassName} />
                {mainFields.map(field => {
                    const inputId = `${idPrefix}-${field.key}`;
                    const optionsId = `${inputId}-options`;
                    const isYearField = field.key === 'year' || field.key === 'yearEnd';
                    const required = (field.key === 'year' && form.requiresStartYear) ||
                        ((field.key === 'fuel' || field.key === 'bodyClass') && form.requiresFuelAndBodyClass);
                    const options =
                        field.key === 'drivetrain'
                            ? []
                            : form.suggestions[field.key];

                    return (
                        <div key={field.key} className="space-y-1.5">
                            <label
                                htmlFor={inputId}
                                className="block text-xs font-bold text-[var(--text-muted)]"
                            >
                                {field.label}{required ? ' *' : ''}
                            </label>

                            {field.key === 'drivetrain' ? (
                                <select
                                    id={inputId}
                                    value={form.fields.drivetrain ?? ''}
                                    onChange={event =>
                                        form.setField('drivetrain', event.target.value)
                                    }
                                    className={inputClassName}
                                >
                                    <option value="">Выберите привод</option>
                                    {form.fields.drivetrain &&
                                        !driveOptions.some(option => option.value === form.fields.drivetrain) && (
                                            <option value={form.fields.drivetrain}>{form.fields.drivetrain}</option>
                                        )}
                                    {driveOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <>
                                    <input
                                        id={inputId}
                                        type="text"
                                        value={form.fields[field.key] ?? ''}
                                        onChange={event =>
                                            form.setField(field.key, event.target.value)
                                        }
                                        placeholder={field.placeholder}
                                        required={required}
                                        maxLength={isYearField ? 4 : undefined}
                                        inputMode={
                                            isYearField
                                                ? 'numeric'
                                                : field.key === 'displacementL'
                                                    ? 'decimal'
                                                    : undefined
                                        }
                                        list={options.length > 0 ? optionsId : undefined}
                                        className={inputClassName}
                                    />

                                    {options.length > 0 && (
                                        <datalist id={optionsId}>
                                            {options.map(option => (
                                                <option key={option} value={option} />
                                            ))}
                                        </datalist>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            <fieldset className="space-y-3 border-t border-[var(--border)]/40 pt-4">
                <legend className="text-xs font-bold text-[var(--text)]">Поиск модификации по VIN</legend>
                <p className="text-xs text-[var(--text-muted)]">
                    Введите первые 11 символов VIN для сверки по префиксу. Для полного VIN из 17 символов отметьте нужные позиции или выберите сверку по всему номеру.
                </p>

                {form.vinExceptions.length > 0 && (
                    <div className="space-y-2 rounded-xl border border-[var(--border)] p-3">
                        <h3 className="text-xs font-semibold">Подтверждённые VIN-исключения</h3>
                        <ul className="space-y-1 font-mono text-xs">
                            {form.vinExceptions.map(vin => <li key={vin} className="break-all">{vin}</li>)}
                        </ul>
                    </div>
                )}
                {form.vinRules.map((rule, index) => {
                    const sampleId = `${idPrefix}-vin-${index}`;
                    const isPrefix = isValidVinPrefix(rule.sample);
                    const updateRule = (updated: typeof rule, resetConfirmation = true) => form.setVinRules(rules =>
                        rules.map((item, itemIndex) => itemIndex === index
                            ? resetConfirmation ? { ...updated, source: undefined, modelYear: undefined } : updated
                            : item)
                    );

                    return (
                        <div key={sampleId} className="space-y-2 rounded-xl border border-[var(--border)] p-3">
                            <div className="flex items-end gap-2">
                                <label htmlFor={sampleId} className="block flex-1 space-y-1 text-xs text-[var(--text-muted)]">
                                    <span>Префикс или полный VIN {index + 1}</span>
                                    <input
                                        id={sampleId}
                                        value={rule.sample}
                                        onChange={event => updateRule({
                                            ...rule, sample: normalizeVin(event.target.value),
                                        })}
                                        maxLength={VIN_LENGTH}
                                        placeholder="Например, SHHFK28607U"
                                        spellCheck={false}
                                        autoComplete="off"
                                        required
                                        className={`${inputClassName} font-mono uppercase`}
                                    />
                                </label>
                                <button
                                    type="button"
                                    aria-label={`Удалить образец VIN ${index + 1}`}
                                    onClick={() => form.setVinRules(rules => rules.filter((_, itemIndex) => itemIndex !== index))}
                                    className="rounded-lg p-2.5 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            {rule.source && <p className="break-words text-xs text-[var(--text-muted)]">Источник — {rule.source}</p>}
                            <label className="block space-y-1 text-xs text-[var(--text-muted)]">
                                <span>Подтверждённый модельный год</span>
                                <input
                                    type="number" min={MIN_MODEL_YEAR} max={MAX_MODEL_YEAR} step={1}
                                    value={rule.modelYear ?? ''}
                                    onChange={event => updateRule({
                                        ...rule,
                                        modelYear: event.target.value === '' ? undefined : Number(event.target.value),
                                    }, false)}
                                    className={inputClassName}
                                    placeholder="Укажите, если подтверждён источником"
                                />
                            </label>
                            {isPrefix && (
                                <p className="text-xs text-[var(--text-muted)]">Сверяем все 11 символов префикса.</p>
                            )}
                            {isValidVin(rule.sample) && (
                                <div className="space-y-2">
                                    {!isVinMaskSpecific(rule.positions) && (
                                        <p className="text-xs text-[var(--danger)]">
                                            Маска не используется при подборе. Отметьте позиции 1–3 и минимум три из позиций 4–8.
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-1.5">
                                        {Array.from({ length: VIN_LENGTH }, (_, position) => {
                                            const selected = rule.positions.includes(position);
                                            return (
                                                <button
                                                    key={position}
                                                    type="button"
                                                    aria-label={`Позиция ${position + 1}${rule.sample[position] ? `, ${rule.sample[position]}` : ''}`}
                                                    aria-pressed={selected}
                                                    onClick={() => updateRule({
                                                        ...rule,
                                                        positions: selected
                                                            ? rule.positions.filter(item => item !== position)
                                                            : [...rule.positions, position],
                                                    })}
                                                    className={`flex w-8 flex-col items-center rounded-lg border py-1 font-mono text-sm ${selected
                                                        ? 'border-[var(--link)] bg-[var(--link)] text-[var(--btn-primary-text)]'
                                                        : 'border-[var(--border)] text-[var(--text)]'}`}
                                                >
                                                    <span className="text-[10px] opacity-75">{position + 1}</span>
                                                    {rule.sample[position] || '·'}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => updateRule({ ...rule, positions: Array.from({ length: VIN_LENGTH }, (_, position) => position) })}
                                        className="text-xs font-medium text-[var(--link)] hover:underline"
                                    >
                                        Сверять весь VIN
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}

                <button
                    type="button"
                    onClick={() => form.setVinRules(rules => [...rules, { sample: '', positions: [] }])}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-[var(--link)] hover:bg-[var(--bg-elevated)]"
                >
                    <Plus className="h-4 w-4" />
                    Добавить образец VIN
                </button>
            </fieldset>

            <label className="block space-y-2 border-t border-[var(--border)]/40 pt-4">
                <span className="block text-xs font-bold text-[var(--text)]">Поиск по номеру кузова (Frame)</span>
                <textarea value={form.frameRulesText} onChange={event => form.setFrameRulesText(event.target.value)}
                    rows={2} placeholder={'{"sample":"GD1-1234567","positions":[0]}'} spellCheck={false} autoComplete="off"
                    className={`${inputClassName} font-mono uppercase`} />
                <span className="block text-xs text-[var(--text-muted)]">
                    Один JSON-объект с sample и positions на строку. Отсчёт начинается с нуля после дефиса. Пустой массив проверяет только код кузова.
                </span>
            </label>

            <div className="space-y-3 border-t border-[var(--border)]/40 pt-4">
                <div>
                    <h3 className="text-xs font-bold text-[var(--text)]">
                        Дополнительные характеристики
                    </h3>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Например, рынок, рестайлинг или код кузова.
                    </p>
                </div>

                {form.customAttributes.map((attribute, index) => (
                    <div key={attribute.id} className="flex items-start gap-2">
                        <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                            <input
                                type="text"
                                aria-label={`Название характеристики ${index + 1}`}
                                value={attribute.key}
                                onChange={event =>
                                    form.updateAttribute(
                                        attribute.id,
                                        'key',
                                        event.target.value
                                    )
                                }
                                placeholder="Название характеристики"
                                className={inputClassName}
                            />

                            <input
                                type="text"
                                aria-label={`Значение характеристики ${index + 1}`}
                                value={attribute.value}
                                onChange={event =>
                                    form.updateAttribute(
                                        attribute.id,
                                        'value',
                                        event.target.value
                                    )
                                }
                                placeholder="Значение"
                                className={inputClassName}
                            />
                        </div>

                        <button
                            type="button"
                            aria-label={`Удалить характеристику ${index + 1}`}
                            onClick={() => form.removeAttribute(attribute.id)}
                            className="shrink-0 rounded-lg p-2.5 text-[var(--text-muted)] transition hover:bg-red-500/10 hover:text-red-500"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={form.addAttribute}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-[var(--link)] transition hover:bg-[var(--bg-elevated)]"
                >
                    <Plus className="h-4 w-4" />
                    Добавить характеристику
                </button>
            </div>

            <div className="space-y-2 border-t border-[var(--border)]/40 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <label
                        htmlFor={`${idPrefix}-name`}
                        className="text-xs font-bold text-[var(--text)]"
                    >
                        Название модификации
                    </label>

                    {form.isNameEdited && (
                        <button
                            type="button"
                            onClick={form.resetName}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[var(--link)] hover:underline"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Собрать автоматически
                        </button>
                    )}
                </div>

                <input
                    id={`${idPrefix}-name`}
                    type="text"
                    value={form.name}
                    onChange={event => form.setName(event.target.value)}
                    placeholder="Например, SiR (H22A) MT FWD"
                    className={inputClassName}
                />

                <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                    Название собирается из характеристик. Его можно изменить вручную.
                </p>
            </div>
        </div>
    );
}
