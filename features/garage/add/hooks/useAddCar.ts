'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { DecodedCar, ManualCarForm } from '@/types';
import {
    createEmptyManualForm,
    isManualFormValid,
    mapDecodedToManualForm,
    mapManualFormToCar
} from "@/features/garage/add/lib/manualForm";
import { fetchVinData, mapNhtsaToDecodedCar } from "@/features/garage/add/lib/decodeVin";
import { isValidVin, normalizeVin } from "@/features/garage/add/lib/config/vin";
import { addCarToGarage } from "@/features/garage/add/lib/storage";

// Импортируем глобальный стор админки
import { systemStore } from '@/features/admin/lib/systemStore';

export function useAddCar() {
    const router = useRouter();

    const [vin, setVin] = useState('');
    const [decoded, setDecoded] = useState<DecodedCar | null>(null);
    const [error, setError] = useState('');
    const [manualMode, setManualMode] = useState(false);
    const [manualForm, setManualForm] = useState<ManualCarForm>(
        createEmptyManualForm()
    );

    const [editingDecoded, setEditingDecoded] = useState(false);

    const editDecodedCar = () => {
        if (!decoded) return;
        setManualForm(mapDecodedToManualForm(decoded));
        setEditingDecoded(true);
        setManualMode(true);
        setError('');
    };

    const cancelManualMode = () => {
        setManualMode(false);
        setEditingDecoded(false);
        setError('');
        setManualForm(createEmptyManualForm());
    };

    const decodeMutation = useMutation({
        mutationFn: fetchVinData,
        onSuccess: (data, vinCode) => {
            const mapped = mapNhtsaToDecodedCar(data, vinCode);

            if (!mapped) {
                setError('Не удалось расшифровать VIN. Можешь добавить автомобиль вручную.');
                setDecoded(null);
                setManualMode(true);
                setManualForm(createEmptyManualForm(vinCode));
                return;
            }

            setError('');
            setManualMode(false);
            setDecoded(mapped);
        },
        onError: () => {
            setError('Ошибка при расшифровке. Можешь добавить автомобиль вручную.');
            setDecoded(null);
            setManualMode(true);
            setManualForm(createEmptyManualForm(normalizeVin(vin)));
        },
    });

    const decodeVin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setDecoded(null);
        setManualMode(false);

        const cleanVin = normalizeVin(vin);

        if (!isValidVin(cleanVin)) {
            setError('VIN должен состоять из 17 символов');
            return;
        }

        decodeMutation.mutate(cleanVin);
    };

    const enableManualMode = () => {
        setEditingDecoded(false);
        setManualMode(true);
        setDecoded(null);
        setManualForm(createEmptyManualForm(normalizeVin(vin)));
        setError('');
    };

    const updateManualField = (field: keyof ManualCarForm, value: string) => {
        setManualForm((prev) => ({ ...prev, [field]: value }));
    };

    // Синхронизация расшифрованного авто с админкой
    const saveDecodedCar = () => {
        if (!decoded) return;

        addCarToGarage({
            ...decoded,
            id: Date.now().toString(),
            addedAt: new Date().toISOString(),
        });

        // Отправляем в админку
        const currentUser = systemStore.getState().users[0]; // Берем текущего юзера
        if (currentUser) {
            systemStore.addCar({
                userId: currentUser.id,
                brand: decoded.make,
                model: decoded.model,
                year: Number(decoded.year),
                vin: decoded.vin,
                mileage: 0,
                engine: decoded.engine || `${decoded.displacementL || ''} ${decoded.fuel || ''}`.trim(),
            });
        }

        router.push('/garage');
    };

    // Синхронизация ручного авто с админкой
    const saveManualCar = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isManualFormValid(manualForm)) {
            setError('Укажи хотя бы марку, модель и год');
            return;
        }

        addCarToGarage(mapManualFormToCar(manualForm));

        // Отправляем в админку
        const currentUser = systemStore.getState().users[0];
        if (currentUser) {
            systemStore.addCar({
                userId: currentUser.id,
                brand: manualForm.make,
                model: manualForm.model,
                year: Number(manualForm.year),
                vin: manualForm.vin,
                mileage: 0,
                engine: manualForm.engine || `${manualForm.displacementL || ''} ${manualForm.fuel || ''}`.trim(),
            });
        }

        router.push('/garage');
    };

    return {
        vin,
        setVin,
        decoded,
        error,
        isDecoding: decodeMutation.isPending,
        editingDecoded,
        editDecodedCar,
        manualMode,
        manualForm,
        decodeVin,
        enableManualMode,
        cancelManualMode,
        updateManualField,
        saveDecodedCar,
        saveManualCar,
    };
}