'use client';

import { CatalogAutocompleteField } from './CatalogAutocompleteField';

import type { useCatalogCarSelection } from '../hooks/useCatalogCarSelection';

interface Props {
    selection: ReturnType<typeof useCatalogCarSelection>;
    fromVinMatch?: boolean;
}

export function CarCatalogFields({ selection, fromVinMatch = false }: Props) {
    const { start, end } = selection.productionYears ?? {};
    const yearRange = start === end ? start : [start, end].filter(Boolean).join('–');
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

            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                    <span className="block text-sm font-medium text-[var(--text)]">Год выпуска по документам *</span>
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        pattern="[0-9]{4}"
                        required
                        value={selection.year.value}
                        onChange={event => selection.year.onChange(event.target.value)}
                        placeholder="Например, 2008"
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--link)]"
                    />
                    {selection.modelYear === undefined && yearRange && (
                        <span className="block text-xs text-[var(--text-muted)]">Годы выпуска по каталогу · {yearRange}</span>
                    )}
                    {selection.modelYear !== undefined && (
                        <span className="block text-xs text-[var(--text-muted)]">Модельный год по VIN · {selection.modelYear}</span>
                    )}
                </label>
                <CatalogAutocompleteField
                    {...selection.bodyCode}
                    label="Код кузова (необязательно)"
                    placeholder="Например, CL9"
                    showOnEmpty
                />
            </div>

            {selection.facelift.options.length > 0 && (
                <label className="block space-y-2">
                    <span className="text-sm font-medium text-[var(--text)]">Версия кузова (необязательно)</span>
                    <select value={selection.facelift.value} onChange={event => selection.facelift.onChange(event.target.value)}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-[var(--text)]">
                        <option value="">Не определено</option>
                        {selection.facelift.legacyValue && (
                            <option value={selection.facelift.legacyValue.value} disabled>{selection.facelift.legacyValue.label}</option>
                        )}
                        {selection.facelift.options.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    {fromVinMatch && selection.modification.value && !selection.facelift.value && (
                        <span className="block text-xs text-[var(--text-muted)]">
                            Укажите версию кузова, если знаете.
                        </span>
                    )}
                </label>
            )}

            <label className="block space-y-2">
                <span className="text-sm font-medium text-[var(--text)]">
                    Проверенная модификация
                </span>
                <select
                    value={selection.modification.value}
                    disabled={selection.modification.disabled}
                    required={selection.modification.required}
                    onChange={event => selection.modification.onChange(event.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-[var(--text)]"
                >
                    <option value="">
                        {selection.modification.required
                            ? 'Выберите одну из совпавших модификаций'
                            : 'Моей модификации нет / укажу характеристики'}
                    </option>
                    {selection.modification.options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {selection.modification.total > 0 && (
                    <span className="block text-xs text-[var(--text-muted)]">
                        Найдено модификаций: {selection.modification.options.length} из {selection.modification.total}
                    </span>
                )}
                <span role="status" className="block text-sm text-[var(--text-muted)]">
                    {selection.modification.selectionNeedsReview
                        ? 'Год или код кузова отличаются от выбранной карточки. Каталог откроется по вашему выбору, а расхождение попадёт на проверку.'
                        : selection.modification.value
                            ? 'ИИ-каталог будет доступен сразу после сохранения автомобиля.'
                        : selection.modification.required
                            ? 'Подходят несколько модификаций. Укажите код кузова или выберите вариант из списка.'
                            : 'Укажите характеристики. Пока автомобиль на проверке, в ИИ-каталоге можно выбрать готовую модификацию или посмотреть ближайшую.'}
                </span>
            </label>

            {selection.modification.canShowAll && (
                <label className="flex items-center gap-2 text-sm text-[var(--text)]">
                    <input type="checkbox" checked={selection.modification.showAll}
                        onChange={event => selection.modification.onShowAllChange(event.target.checked)}
                        className="size-4 accent-[var(--link)]" />
                    Показать все модификации модели
                </label>
            )}

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
