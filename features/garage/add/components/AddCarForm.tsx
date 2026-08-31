'use client';

import VinDecodeForm from './VinDecodeForm';
import DecodedCarCard from './DecodedCarCard';
import ManualCarForm from './ManualCarForm';
import { useAddCar } from '@/features/garage/add/hooks/useAddCar';

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
        <div className="max-w-xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 text-[#F5F5F5]">Добавить автомобиль</h1>
            <p className="text-[#A3A3A3] mb-8">
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
                            className="w-full text-sm text-[#666666] hover:text-[#39FF14] transition mb-8"
                        >
                            Добавить вручную без расшифровки
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