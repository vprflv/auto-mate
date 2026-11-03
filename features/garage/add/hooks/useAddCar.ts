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
import { submitCarCatalogReview } from '@/features/admin/lib/system-store/carCatalogReview';
import {resolveCarCatalogIdentity} from "@/features/catalog/lib/carCatalogIdentity";

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
        setManualForm(prev => ({
            ...prev,
            ...(['make', 'model', 'engine', 'transmission', 'driveType',
                'trim', 'displacementL', 'fuel', 'bodyClass'].includes(field) &&
                prev[field] !== value
                ? { catalogModificationId: '', modificationName: '' }
                : {}),
            [field]: value,
        }));
    };

    // Синхронизация расшифрованного авто с админкой
    // 1. Сохранение декодированного авто
    const saveDecodedCar = editDecodedCar;

    // 2. Сохранение авто из ручной формы
    const saveManualCar = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isManualFormValid(manualForm)) {
            setError('Укажи хотя бы марку, модель и год');
            return;
        }

        const savedCar = {
            ...mapManualFormToCar(manualForm),

            id: crypto.randomUUID(),

            catalogBrandSlug:
                manualForm.catalogBrandSlug || undefined,

            catalogModelSlug:
                manualForm.catalogModelSlug || undefined,

            catalogModificationId:
                manualForm.catalogModificationId || undefined,

            modificationName:
                manualForm.modificationName || undefined,
        };

        const state = systemStore.getState();

        // Выбранную готовую модификацию нельзя молча
        // отправлять на проверку как неизвестную.
        if (
            savedCar.catalogModificationId &&
            !resolveCarCatalogIdentity(
                savedCar,
                state.masterModels
            )
        ) {
            setError(
                'Характеристики не соответствуют выбранной модификации. Выбери её повторно или укажи свой вариант.'
            );
            return;
        }

        try {
            addCarToGarage(savedCar);

            const currentUser = state.users[0];

            // Единственная точка регистрации и отправки на проверку.
            systemStore.addCar({
                userId: currentUser?.id ?? '',
                garageCarId: savedCar.id,
                brand: savedCar.make,
                model: savedCar.model,
                year: savedCar.year,
                vin: savedCar.vin,
                mileage: savedCar.currentMileage ?? 0,
                engine: savedCar.engine ?? '',
                displacementL: savedCar.displacementL,
                fuel: savedCar.fuel,
                transmission: savedCar.transmission,
                driveType: savedCar.driveType,
                bodyClass: savedCar.bodyClass,
                color: savedCar.color,
                carSpecs: {
                    trim: savedCar.trim,
                },
            });

            router.push('/garage');
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Не удалось завершить сохранение автомобиля.'
            );
        }
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