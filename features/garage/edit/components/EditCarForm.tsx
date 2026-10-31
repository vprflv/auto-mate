'use client';

import Link from 'next/link';

import { useEditCar } from '../hooks/useEditCar';
import { useCatalogCarSelection } from '@/features/garage/add/hooks/useCatalogCarSelection';
import { CarVinField } from '@/features/garage/add/components/CarVinField';
import { CarCatalogFields } from '@/features/garage/add/components/CarCatalogFields';
import { CarBasicsFields } from '@/features/garage/add/components/CarBasicsFields';
import { CarSpecificationFields } from '@/features/garage/add/components/CarSpecificationFields';

export default function EditCarForm() {
    const {
        car,
        loading,
        saving,
        error,
        form,
        updateField,
        handleSave,
    } = useEditCar();

    const selection = useCatalogCarSelection({
        form,
        onChange: updateField,
    });

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-[var(--text-muted)]">
                    Загрузка...
                </p>
            </div>
        );
    }

    if (!car) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <p className="text-[var(--text-muted)]">
                    {error || 'Автомобиль не найден'}
                </p>

                <Link
                    href="/garage"
                    className="text-[var(--link)] underline transition-colors hover:text-[var(--btn-primary-hover)]"
                >
                    Вернуться в гараж
                </Link>
            </div>
        );
    }

    return (
        <main className="mx-auto max-w-3xl px-6 py-10">
            <h1 className="mb-2 text-3xl font-bold text-[var(--text)]">
                Редактировать автомобиль
            </h1>

            <p className="mb-8 text-[var(--text-muted)]">
                {car.make} {car.model} · {car.year}
            </p>

            <form
                onSubmit={event => {
                    if (!selection.loaded) {
                        event.preventDefault();
                        return;
                    }

                    handleSave(event);
                }}
                className="space-y-6"
            >
                <fieldset
                    disabled={saving}
                    className="min-w-0 space-y-6"
                >
                    <CarVinField
                        value={form.vin}
                        onChange={value =>
                            updateField('vin', value)
                        }
                    />

                    <CarCatalogFields selection={selection} />

                    <CarBasicsFields
                        form={form}
                        onChange={updateField}
                    />

                    <CarSpecificationFields
                        form={form}
                        onChange={updateField}
                    />

                    {error && (
                        <p
                            role="alert"
                            className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-500"
                        >
                            {error}
                        </p>
                    )}

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={saving || !selection.loaded}
                            className="flex-1 rounded-2xl bg-[var(--btn-primary)] py-4 font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving
                                ? 'Сохраняем...'
                                : 'Сохранить изменения'}
                        </button>

                        <Link
                            href="/garage"
                            className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] py-4 text-center font-medium text-[var(--text)] transition-colors hover:border-[var(--text-muted)] hover:bg-[var(--border)]"
                        >
                            Отмена
                        </Link>
                    </div>
                </fieldset>
            </form>
        </main>
    );
}