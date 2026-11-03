'use client';

import { CatalogAutocompleteField } from './CatalogAutocompleteField';

import type { useCatalogCarSelection } from '../hooks/useCatalogCarSelection';

interface Props {
    selection: ReturnType<typeof useCatalogCarSelection>;
}

export function CarCatalogFields({ selection }: Props) {
    return (
        <section className="space-y-5 rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
            <div>
                <h2 className="text-lg font-semibold text-[var(--text)]">
                    Автомобиль и модификация
                </h2>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Начните вводить название и выберите подсказку.
                    Если нужного варианта нет — укажите свой.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <CatalogAutocompleteField
                    {...selection.brand}
                    label="Марка"
                    placeholder="Начните вводить марку"
                    required
                />

                <CatalogAutocompleteField
                    {...selection.model}
                    label="Модель"
                    placeholder="Начните вводить модель"
                    required
                />
            </div>

            <label className="block space-y-2">
                <span className="text-sm font-medium text-[var(--text)]">
                    Проверенная модификация
                </span>
                <select
                    value={selection.modification.value}
                    disabled={selection.modification.disabled}
                    onChange={event => selection.modification.onChange(event.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-[var(--text)]"
                >
                    <option value="">Моей модификации нет / укажу характеристики</option>
                    {selection.modification.options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <span role="status" className="block text-sm text-[var(--text-muted)]">
                    {selection.modification.value
                        ? 'ИИ-каталог будет доступен сразу после сохранения автомобиля.'
                        : 'Укажите характеристики. ИИ-каталог откроется после подтверждения модификации администратором.'}
                </span>
            </label>

            <CatalogAutocompleteField
                {...selection.engine}
                label="Двигатель"
                placeholder="Например, H22A"
            />

            {!selection.loaded && (
                <p
                    role="status"
                    className="text-xs text-[var(--text-muted)]"
                >
                    Загружаем подсказки из каталога…
                </p>
            )}
        </section>
    );
}