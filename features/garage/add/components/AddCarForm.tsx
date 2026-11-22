'use client';

import VinDecodeForm from './VinDecodeForm';
import ManualCarForm from './ManualCarForm';
import { useAddCar } from '@/features/garage/add/hooks/useAddCar';
import { Pencil } from 'lucide-react';

export default function AddCarForm() {
    const {
        vin,
        updateVin,
        vinMatches,
        chooseVinMatch,
        error,
        manualMode,
        manualForm,
        decodeVin,
        enableManualMode,
        cancelManualMode,
        updateManualField,
        saveManualCar,
        matchedVin,
    } = useAddCar();

    return (
        <div className="mx-auto max-w-xl">
            <h1 className="mb-2 text-3xl font-bold text-[var(--text)]">
                Добавить автомобиль
            </h1>

            <p className="mb-8 text-[var(--text-muted)]">
                Введите VIN, чтобы найти готовую модификацию в каталоге.
            </p>

            {!manualMode && (
                <>
                    <VinDecodeForm
                        vin={vin}
                        error={error}
                        onVinChange={updateVin}
                        onSubmit={decodeVin}
                    />

                    {vinMatches.length > 1 && (
                        <section className="mb-5 space-y-2">
                            <h2 className="text-sm font-semibold">По VIN найдено несколько модификаций</h2>
                            <p className="text-sm text-[var(--text-muted)]">Выберите вариант для своего автомобиля.</p>
                            {vinMatches.map(match => {
                                const { model, modification } = match;
                                const { year, yearEnd } = modification.attributes;
                                const years = year && yearEnd && year !== yearEnd ? `${year}–${yearEnd}` : year;
                                return (
                                    <button
                                        type="button"
                                        key={JSON.stringify([model.brandSlug, model.modelSlug, modification.id])}
                                        onClick={() => chooseVinMatch(match)}
                                        className="block w-full rounded-xl border border-[var(--border)] px-4 py-3 text-left text-sm hover:border-[var(--link)]"
                                    >
                                        {[model.brandName, model.modelName, modification.name, years].filter(Boolean).join(' · ')}
                                    </button>
                                );
                            })}
                        </section>
                    )}

                    <button
                        type="button"
                        onClick={enableManualMode}
                        className="mb-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-4 text-sm font-medium text-[var(--text-muted)] transition-colors hover:border-[var(--link)]/50 hover:bg-[var(--bg-elevated)] hover:text-[var(--link)]"
                    >
                        <Pencil className="h-4 w-4" />
                        <span>Добавить автомобиль вручную</span>
                    </button>
                </>
            )}

            {manualMode && (
                <ManualCarForm
                    form={manualForm}
                    error={error}
                    fromVinMatch={matchedVin}
                    onChange={updateManualField}
                    onSubmit={saveManualCar}
                    onCancel={cancelManualMode}
                />
            )}
        </div>
    );
}