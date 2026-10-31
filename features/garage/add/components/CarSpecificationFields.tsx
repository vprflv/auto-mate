'use client';

import * as React from 'react';

import type { ManualCarForm } from '@/types';
import { useCarSpecificationOptions } from '../hooks/useCarSpecificationOptions';
import { CatalogChoiceField } from './CatalogChoiceField';

interface Props {
    form: ManualCarForm;
    onChange: (
        field: keyof ManualCarForm,
        value: string
    ) => void;
}

type ChoiceField =
    | 'bodyClass'
    | 'fuel'
    | 'transmission'
    | 'driveType';

const choiceFields: {
    key: ChoiceField;
    label: string;
}[] = [
    { key: 'bodyClass', label: 'Тип кузова' },
    { key: 'fuel', label: 'Тип топлива' },
    { key: 'transmission', label: 'КПП' },
    { key: 'driveType', label: 'Привод' },
];

export function CarSpecificationFields({
                                           form,
                                           onChange,
                                       }: Props) {
    const options = useCarSpecificationOptions(form);

    const [customFields, setCustomFields] = React.useState<
        Partial<Record<ChoiceField, boolean>>
    >({});

    function setCustomMode(
        field: ChoiceField,
        enabled: boolean
    ) {
        setCustomFields(previous => ({
            ...previous,
            [field]: enabled,
        }));
    }

    const inputClassName =
        'w-full rounded-xl border border-[var(--border)] ' +
        'bg-[var(--card)] px-4 py-3 text-sm text-[var(--text)] ' +
        'outline-none transition-colors focus:border-[var(--link)]';

    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-sm font-bold text-[var(--text)]">
                    Характеристики автомобиля
                </h2>

                <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Выберите вариант из списка или укажите свой.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {choiceFields.map(field => {
                    const value = form[field.key];
                    const values = options[field.key];

                    const isKnownValue = values.includes(value);

                    const isCustom =
                        Boolean(customFields[field.key]) ||
                        Boolean(value && !isKnownValue);

                    return (
                        <CatalogChoiceField
                            key={field.key}
                            label={field.label}
                            options={values.map(option => ({
                                value: option,
                                label: option,
                            }))}
                            selectedValue={
                                isKnownValue ? value : ''
                            }
                            customValue={value}
                            isCustom={isCustom}
                            placeholder="Выберите вариант"
                            customOptionLabel="Добавить свой"
                            customPlaceholder="Введите свой вариант"
                            onSelect={selected => {
                                setCustomMode(field.key, false);
                                onChange(field.key, selected);
                            }}
                            onCustomMode={() => {
                                setCustomMode(field.key, true);
                            }}
                            onCustomChange={text => {
                                onChange(field.key, text);
                            }}
                        />
                    );
                })}

                <label className="block space-y-2">
                    <span className="text-xs font-medium text-[var(--text-muted)]">
                        Объём двигателя, л
                    </span>

                    <input
                        type="text"
                        inputMode="decimal"
                        value={form.displacementL}
                        onChange={event => {
                            const value = event.target.value;

                            if (!/[-−–—﹣－]/.test(value)) {
                                onChange('displacementL', value);
                            }
                        }}
                        placeholder="Например, 2.0"
                        className={inputClassName}
                    />
                </label>

                <label className="block space-y-2">
                    <span className="text-xs font-medium text-[var(--text-muted)]">
                        Комплектация
                    </span>

                    <input
                        type="text"
                        value={form.trim}
                        onChange={event => {
                            onChange('trim', event.target.value);
                        }}
                        placeholder="Например, Comfort"
                        className={inputClassName}
                    />
                </label>
            </div>
        </section>
    );
}