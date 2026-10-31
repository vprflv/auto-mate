'use client';

import { useId } from 'react';

interface Option {
    value: string;
    label: string;
}

interface Props {
    label: string;
    options: Option[];

    selectedValue: string;
    customValue: string;
    isCustom: boolean;

    onSelect: (value: string) => void;
    onCustomMode: () => void;
    onCustomChange: (value: string) => void;

    placeholder?: string;
    customOptionLabel?: string;
    customPlaceholder?: string;

    required?: boolean;
    disabled?: boolean;
}

const CUSTOM_VALUE = '__custom__';

const fieldClassName =
    'w-full rounded-xl border border-[var(--border)] ' +
    'bg-[var(--bg-elevated)] px-4 py-3 text-[var(--text)] ' +
    'outline-none transition focus:border-[var(--link)] ' +
    'focus:ring-2 focus:ring-[var(--link)]/10 ' +
    'disabled:cursor-not-allowed disabled:opacity-50';

export function CatalogChoiceField({
                                       label,
                                       options,
                                       selectedValue,
                                       customValue,
                                       isCustom,
                                       onSelect,
                                       onCustomMode,
                                       onCustomChange,
                                       placeholder = 'Выберите вариант',
                                       customOptionLabel = 'Добавить свой вариант',
                                       customPlaceholder = 'Введите свой вариант',
                                       required = false,
                                       disabled = false
                                   }: Props) {
    const id = useId();

    return (
        <div className="space-y-2">
            <label
                htmlFor={`${id}-select`}
                className="block text-sm font-medium text-[var(--text)]"
            >
                {label}
                {required && ' *'}
            </label>

            <select
                id={`${id}-select`}
                value={isCustom ? CUSTOM_VALUE : selectedValue}
                disabled={disabled}
                required={required}
                onChange={event => {
                    const value = event.target.value;

                    if (value === CUSTOM_VALUE) {
                        onCustomMode();
                    } else {
                        onSelect(value);
                    }
                }}
                className={fieldClassName}
            >
                <option value="">
                    {placeholder}
                </option>

                {options.map(option => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}

                <option value={CUSTOM_VALUE}>
                    + {customOptionLabel}
                </option>
            </select>

            {isCustom && (
                <>
                    <label
                        htmlFor={`${id}-custom`}
                        className="sr-only"
                    >
                        {label}: свой вариант
                    </label>

                    <input
                        id={`${id}-custom`}
                        type="text"
                        value={customValue}
                        disabled={disabled}
                        required={required}
                        placeholder={customPlaceholder}
                        onChange={event =>
                            onCustomChange(event.target.value)
                        }
                        className={fieldClassName}
                    />
                </>
            )}
        </div>
    );
}