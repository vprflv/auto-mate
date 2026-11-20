'use client';

import { useState, type FormEvent } from 'react';
import { AlertDialog } from 'radix-ui';
import type { ManualCarForm as ManualCarFormValues } from '@/types';

import { useCatalogCarSelection } from '../hooks/useCatalogCarSelection';
import { isManualFormValid } from '../lib/manualForm';

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

    onSubmit: () => void;
    onCancel: () => void;
}

const optionalFields = [
    ['vin', 'VIN'],
    ['bodyCode', 'Код кузова'],
    ['engine', 'Двигатель'],
    ['bodyClass', 'Тип кузова'],
    ['fuel', 'Тип топлива'],
    ['transmission', 'КПП'],
    ['driveType', 'Привод'],
    ['displacementL', 'Объём двигателя'],
    ['trim', 'Комплектация'],
    ['color', 'Цвет'],
    ['nickname', 'Прозвище'],
] as const;

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
    const [confirmOpen, setConfirmOpen] = useState(false);
    const missingFields = optionalFields
        .filter(([key]) => !form[key]?.trim())
        .map(([, label]) => label);

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        if (!selection.loaded) return;

        if (isManualFormValid(form) && missingFields.length > 0) {
            setConfirmOpen(true);
            return;
        }

        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <AlertDialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialog.Portal>
                    <AlertDialog.Overlay className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm" />
                    <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[301] max-h-[90vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 space-y-4 overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl">
                        <AlertDialog.Title className="text-lg font-bold text-[var(--text)]">
                            Сохранить автомобиль без этих данных?
                        </AlertDialog.Title>
                        <AlertDialog.Description className="text-sm text-[var(--text-muted)]">
                            Не заполнены: {missingFields.join(', ')}.
                        </AlertDialog.Description>
                        <div className="flex flex-wrap justify-end gap-2">
                            <AlertDialog.Cancel type="button" className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium">
                                Вернуться к форме
                            </AlertDialog.Cancel>
                            <AlertDialog.Action type="button" onClick={onSubmit} className="rounded-xl bg-[var(--btn-primary)] px-4 py-2 text-sm font-medium text-[var(--btn-primary-text)]">
                                Всё равно сохранить
                            </AlertDialog.Action>
                        </div>
                    </AlertDialog.Content>
                </AlertDialog.Portal>
            </AlertDialog.Root>

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
