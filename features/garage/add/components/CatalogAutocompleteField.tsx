'use client';

import { useId, useState } from 'react';

export interface CatalogOption {
    value: string;
    label: string;
}

interface Props {
    label: string;
    value: string;
    options: CatalogOption[];

    onChange: (value: string) => void;
    onSelect: (value: string) => void;

    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
}

export function CatalogAutocompleteField({
                                             label,
                                             value,
                                             options,
                                             onChange,
                                             onSelect,
                                             placeholder,
                                             required = false,
                                             disabled = false
                                         }: Props) {
    const id = useId();

    // null — закрыто, -1 — открыто без выделенного варианта.
    const [activeIndex, setActiveIndex] =
        useState<number | null>(null);

    const query = value.trim().toLowerCase();

    const suggestions = options
        .filter(option =>
            option.label.toLowerCase().includes(query)
        )
        .sort((a, b) =>
            Number(b.label.toLowerCase().startsWith(query)) -
            Number(a.label.toLowerCase().startsWith(query)) ||
            a.label.localeCompare(b.label)
        )
        .slice(0, 5);

    const open = activeIndex !== null && query.length > 0;

    const activeOption = activeIndex !== null
        ? suggestions[activeIndex]
        : undefined;

    const select = (option: CatalogOption) => {
        onSelect(option.value);
        setActiveIndex(null);
    };

    return (
        <div className="space-y-2">
            <label
                htmlFor={id}
                className="block text-sm font-medium text-[var(--text)]"
            >
                {label}{required && ' *'}
            </label>

            <div className="relative">
                <input
                    id={id}
                    type="text"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={open}
                    aria-controls={open ? `${id}-results` : undefined}
                    aria-activedescendant={
                        open && activeOption
                            ? `${id}-option-${activeIndex}`
                            : undefined
                    }
                    value={value}
                    required={required}
                    disabled={disabled}
                    placeholder={placeholder}
                    autoComplete="off"
                    onFocus={() => setActiveIndex(-1)}
                    onBlur={() => setActiveIndex(null)}
                    onChange={event => {
                        onChange(event.target.value);
                        setActiveIndex(-1);
                    }}
                    onKeyDown={event => {
                        if (
                            suggestions.length > 0 &&
                            (
                                event.key === 'ArrowDown' ||
                                event.key === 'ArrowUp'
                            )
                        ) {
                            event.preventDefault();

                            const direction =
                                event.key === 'ArrowDown' ? 1 : -1;

                            setActiveIndex(current =>
                                current === null || current < 0
                                    ? direction === 1
                                        ? 0
                                        : suggestions.length - 1
                                    : (
                                    current + direction +
                                    suggestions.length
                                ) % suggestions.length
                            );
                        } else if (
                            event.key === 'Enter' &&
                            open &&
                            activeOption
                        ) {
                            event.preventDefault();
                            select(activeOption);
                        } else if (event.key === 'Escape' && open) {
                            event.preventDefault();
                            event.stopPropagation();
                            setActiveIndex(null);
                        }
                    }}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--link)] disabled:cursor-not-allowed disabled:opacity-50"
                />

                {open && (
                    <div
                        id={`${id}-results`}
                        role="listbox"
                        aria-label={label}
                        className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 shadow-xl"
                    >
                        {suggestions.map((option, index) => (
                            <button
                                key={option.value}
                                id={`${id}-option-${index}`}
                                type="button"
                                role="option"
                                aria-selected={activeIndex === index}
                                tabIndex={-1}
                                onMouseDown={event =>
                                    event.preventDefault()
                                }
                                onClick={() => select(option)}
                                className={`block w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--text)] hover:bg-[var(--bg-elevated)] ${
                                    activeIndex === index
                                        ? 'bg-[var(--bg-elevated)]'
                                        : ''
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}

                        {suggestions.length === 0 && (
                            <p className="px-3 py-2 text-xs text-[var(--text-muted)]">
                                Совпадений нет. Можно оставить свой вариант.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}