'use client';

import VinDecodeForm from './VinDecodeForm';
import DecodedCarCard from './DecodedCarCard';
import ManualCarForm from './ManualCarForm';
import { useAddCar } from '@/features/garage/add/hooks/useAddCar';
import {Pencil} from "lucide-react";

export default function AddCarForm() {
    const {
        vin,
        setVin,
        decoded,
        error,
        isDecoding,
        manualMode,
        manualForm,
        decodeVin,
        enableManualMode,
        cancelManualMode,
        updateManualField,
        saveDecodedCar,
        saveManualCar,
        editingDecoded,
        editDecodedCar,
    } = useAddCar();

    return (
        <div className="mx-auto max-w-xl">
            <h1 className="mb-2 text-3xl font-bold text-[var(--text)]">
                Добавить автомобиль
            </h1>

            <p className="mb-8 text-[var(--text-muted)]">
                Введи VIN — расшифруем автоматически. Если не найдём — добавишь вручную.
            </p>

            {!manualMode && (
                <>
                    <VinDecodeForm
                        vin={vin}
                        error={error}
                        isDecoding={isDecoding}
                        onVinChange={setVin}
                        onSubmit={decodeVin}
                    />

                    {!decoded && (
                        <button
                            type="button"
                            onClick={enableManualMode}
                            className="mb-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-4 text-sm font-medium text-[var(--text-muted)] transition-colors hover:border-[var(--link)]/50 hover:bg-[var(--bg-elevated)] hover:text-[var(--link)]"
                        >
                            <Pencil className="h-4 w-4" />
                            <span>Добавить автомобиль вручную</span>
                        </button>
                    )}
                </>
            )}

            {decoded && !manualMode && (
                <DecodedCarCard
                    car={decoded}
                    onSave={saveDecodedCar}
                    onEdit={editDecodedCar}
                />
            )}

            {manualMode && (
                <ManualCarForm
                    form={manualForm}
                    error={error}
                    fromDecode={editingDecoded}
                    onChange={updateManualField}
                    onSubmit={saveManualCar}
                    onCancel={cancelManualMode}
                />
            )}
        </div>
    );
}