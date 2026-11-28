'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
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
    correctedVin?: string;
    error: string;
    fromVinMatch?: boolean;
    isDecoding: boolean;
    vinMatchOptions: ReactNode;

    onChange: (
        field: keyof ManualCarFormValues,
        value: string
    ) => void;

    onFrameCommit: () => boolean;
    onSubmit: () => void;
    onCancel: () => void;
}

const optionalFields = [
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
                                          correctedVin,
                                          error,
                                          fromVinMatch = false,
                                          isDecoding,
                                          vinMatchOptions,
                                          onChange,
                                          onFrameCommit,
                                          onSubmit,
                                          onCancel
                                      }: Props) {
    const selection = useCatalogCarSelection({
        form,
        onChange,
        allowAllModifications: true,
    });
    const [confirmOpen, setConfirmOpen] = useState(false);
    const missingFields = optionalFields
        .filter(([key]) => !form[key]?.trim())
        .map(([, label]) => label);
    const hasVin = Boolean(form.vin.trim());
    const hasFrame = Boolean(form.frameNumber.trim());
    const missing = hasVin || hasFrame ? missingFields : ['VIN или номер кузова', ...missingFields];

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        if (!selection.loaded || isDecoding) return;
        if (onFrameCommit()) return;

        if (isManualFormValid(form) && missing.length > 0) {
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
                            Не заполнены: {missing.join(', ')}.
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

            {(hasVin || !hasFrame) && (
                <CarVinField value={form.vin} onChange={value => onChange('vin', value)} />
            )}
            {(hasFrame || !hasVin) && (
                <CarVinField frame value={form.frameNumber} onChange={value => onChange('frameNumber', value)} onBlur={onFrameCommit} />
            )}

            {hasVin && correctedVin === form.vin && (
                <p role="status" className="text-sm text-[var(--text-muted)]">Проверьте исправленный VIN · {correctedVin}</p>
            )}

            {isDecoding && (
                <p role="status" className="text-sm text-[var(--text-muted)]">Проверяем VIN…</p>
            )}

            {vinMatchOptions}

            {fromVinMatch && (
                <p className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm leading-relaxed text-[var(--text-muted)]">
                    Проверьте данные и укажите год автомобиля, если поле пустое.
                </p>
            )}

            <fieldset disabled={isDecoding} className="min-w-0 space-y-6">
                <CarCatalogFields selection={selection} fromVinMatch={fromVinMatch} />

                <CarBasicsFields
                    form={form}
                    onChange={onChange}
                />

                <fieldset disabled={!!form.catalogModificationId} className="min-w-0">
                    <CarSpecificationFields form={form} onChange={onChange} />
                </fieldset>
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
                    disabled={!selection.loaded || isDecoding}
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
