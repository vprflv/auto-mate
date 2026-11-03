'use client';

import type { FormEvent } from 'react';
import type { ManualCarForm as ManualCarFormValues } from '@/types';

import { useCatalogCarSelection } from '../hooks/useCatalogCarSelection';

import { CarVinField } from './CarVinField';
import { CarCatalogFields } from './CarCatalogFields';
import { CarBasicsFields } from './CarBasicsFields';
import { CarSpecificationFields } from './CarSpecificationFields';

interface Props {
    form: ManualCarFormValues;
    error: string;
    fromDecode?: boolean;

    onChange: (
        field: keyof ManualCarFormValues,
        value: string
    ) => void;

    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
}

export default function ManualCarForm({
                                          form,
                                          error,
                                          fromDecode = false,
                                          onChange,
                                          onSubmit,
                                          onCancel
                                      }: Props) {
    const selection = useCatalogCarSelection({
        form,
        onChange
    });

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>
    ) => {
        if (!selection.loaded) {
            event.preventDefault();
            return;
        }

        onSubmit(event);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <CarVinField
                value={form.vin}
                onChange={value => onChange('vin', value)}
            />

            {fromDecode && (
                <p className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm leading-relaxed text-[var(--text-muted)]">
                    Данные из VIN уже подставлены.
                    Проверьте их и дополните перед сохранением.
                </p>
            )}

            <CarCatalogFields selection={selection} />

            <CarBasicsFields
                form={form}
                onChange={onChange}
            />

            <fieldset disabled={!!form.catalogModificationId} className="min-w-0">
                <CarSpecificationFields form={form} onChange={onChange} />
            </fieldset>

            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3"
                >
                    <p className="text-sm text-[var(--danger)]">
                        {error}
                    </p>
                </div>
            )}

            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={!selection.loaded}
                    className="flex-1 rounded-2xl bg-[var(--btn-primary)] py-4 font-medium text-[var(--btn-primary-text)] transition hover:bg-[var(--btn-primary-hover)] disabled:cursor-wait disabled:opacity-50"
                >
                    Сохранить в гараж
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] py-4 font-medium text-[var(--text)] transition hover:border-[var(--text-muted)]"
                >
                    Отмена
                </button>
            </div>
        </form>
    );
}