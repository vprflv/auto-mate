'use client';

import Link from 'next/link';

import { useEditCar } from '../hooks/useEditCar';
import EditCarBasics from './EditCarBasics';
import EditCarExtra from './EditCarExtra';
import EditCarSpecs from './EditCarSpecs';

export default function EditCarForm() {
    const { car, loading, saving, form, handleChange, handleSave } = useEditCar();

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-[var(--text-muted)]">Загрузка...</p>
            </div>
        );
    }

    if (!car) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <p className="text-[var(--text-muted)]">
                    Автомобиль не найден
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
                {car.make} {car.model}
            </h1>

            <p className="mb-8 text-[var(--text-muted)]">
                {car.year} • {car.vin}
            </p>

            <form onSubmit={handleSave} className="space-y-8">
                <EditCarBasics form={form} onChange={handleChange} />
                <EditCarExtra form={form} onChange={handleChange} />
                <EditCarSpecs form={form} onChange={handleChange} />

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 rounded-2xl bg-[var(--btn-primary)] py-4 font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)] disabled:opacity-50"
                    >
                        {saving ? 'Сохраняем...' : 'Сохранить изменения'}
                    </button>

                    <Link
                        href="/garage"
                        className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] py-4 text-center font-medium text-[var(--text)] transition-colors hover:border-[var(--text-muted)] hover:bg-[var(--border)]"
                    >
                        Отмена
                    </Link>
                </div>
            </form>
        </main>
    );
}