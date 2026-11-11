'use client';

import { useState, type FormEvent } from 'react';

import { addCatalogModel } from '@/features/admin/lib/system-store/actions/addCatalogModel';
import type { StoredMasterModel } from '@/features/admin/lib/system-store/types';

interface Props {
    onCancel: () => void;
    onCreated: (model: StoredMasterModel) => void;
}

const inputClassName =
    'w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm';

export function AddCatalogModelForm({ onCancel, onCreated }: Props) {
    const [error, setError] = useState('');

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');

        const fields = new FormData(event.currentTarget);
        let model: StoredMasterModel;

        try {
            model = addCatalogModel({
                brandName: String(fields.get('brandName') ?? ''),
                modelName: String(fields.get('modelName') ?? ''),
                years: String(fields.get('years') ?? ''),
            });
        } catch (error: unknown) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Не удалось добавить модель.'
            );
            return;
        }

        onCreated(model);
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
        >
            <h2 className="text-base font-semibold">Добавить модель</h2>

            <div className="grid gap-3 sm:grid-cols-3">
                <label className="block space-y-1 text-sm">
                    <span>Марка</span>
                    <input
                        name="brandName"
                        placeholder="Например, Honda"
                        required
                        className={inputClassName}
                    />
                </label>

                <label className="block space-y-1 text-sm">
                    <span>Модель</span>
                    <input
                        name="modelName"
                        placeholder="Например, Accord"
                        required
                        className={inputClassName}
                    />
                </label>

                <label className="block space-y-1 text-sm">
                    <span>Годы выпуска</span>
                    <input
                        name="years"
                        placeholder="Например, 2008–2012"
                        required
                        className={inputClassName}
                    />
                </label>
            </div>

            {error && (
                <p role="alert" className="text-sm text-[var(--danger)]">
                    {error}
                </p>
            )}

            <div className="flex flex-wrap justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm"
                >
                    Отмена
                </button>
                <button
                    type="submit"
                    className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white"
                >
                    Добавить модель
                </button>
            </div>
        </form>
    );
}