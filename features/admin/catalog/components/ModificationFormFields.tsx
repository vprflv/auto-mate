'use client';

import { useId } from 'react';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';

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
        placeholder: 'Введите тип КПП',
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
                {mainFields.map(field => {
                    const inputId = `${idPrefix}-${field.key}`;
                    const optionsId = `${inputId}-options`;
                    const isYearField = field.key === 'year' || field.key === 'yearEnd';
                    const options =
                        field.key === 'drivetrain' ||
                        field.key === 'transmission' ||
                        field.key === 'yearEnd'
                            ? []
                            : form.suggestions[field.key];

                    return (
                        <div key={field.key} className="space-y-1.5">
                            <label
                                htmlFor={inputId}
                                className="block text-xs font-bold text-[var(--text-muted)]"
                            >
                                {field.label}
                            </label>

                            {field.key === 'drivetrain' ? (
                                <select
                                    id={inputId}
                                    value={form.fields.drivetrain}
                                    onChange={event =>
                                        form.setField('drivetrain', event.target.value)
                                    }
                                    className={inputClassName}
                                >
                                    <option value="">Выберите привод</option>
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
                                        value={form.fields[field.key]}
                                        onChange={event =>
                                            form.setField(field.key, event.target.value)
                                        }
                                        placeholder={field.placeholder}
                                        required={field.key === 'year'}
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