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
                    Марка, модель и двигатель
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