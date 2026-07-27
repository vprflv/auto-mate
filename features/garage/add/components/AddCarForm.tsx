'use client';


import VinDecodeForm from './VinDecodeForm';
import DecodedCarCard from './DecodedCarCard';
import ManualCarForm from './ManualCarForm';
import {useAddCar} from "@/features/garage/add/hooks/useAddCar";

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
        updateManualField,
        saveDecodedCar,
        saveManualCar,
    } = useAddCar();

    return (
        <div className="max-w-xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Добавить автомобиль</h1>
            <p className="text-zinc-400 mb-8">
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

                    {/* Если ещё не декодили — можно сразу уйти в ручной режим */}
                    {!decoded && (
                        <button
                            type="button"
                            onClick={enableManualMode}
                            className="w-full text-sm text-zinc-400 hover:text-white transition mb-8"
                        >
                            Добавить вручную без расшифровки
                        </button>
                    )}
                </>
            )}

            {decoded && !manualMode && (
                <DecodedCarCard car={decoded} onSave={saveDecodedCar} />
            )}

            {manualMode && (
                <ManualCarForm
                    form={manualForm}
                    error={error}
                    onChange={updateManualField}
                    onSubmit={saveManualCar}
                    onCancel={() => window.location.reload()}
                />
            )}
        </div>
    );
}