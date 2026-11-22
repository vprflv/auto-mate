'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ManualCarForm } from '@/types';
import {
    createEmptyManualForm,
    isManualFormValid,
    mapManualFormToCar
} from "@/features/garage/add/lib/manualForm";
import { findCatalogVinMatches } from '@/features/garage/add/lib/catalogVinRules';
import { isValidVin, normalizeVin } from "@/features/garage/add/lib/config/vin";
import { addCarToGarage, getGarageCars, saveGarageCars } from '@/features/garage/add/lib/storage';
import { captureInitialPartCategories } from '@/features/garage/lib/getCategories';

// Импортируем глобальный стор админки
import { systemStore } from '@/features/admin/lib/systemStore';
import { getCarReviewSpecs } from '@/features/admin/lib/system-store/carCatalogReview';
import { linkMatchingCatalogModification, matchesVehicleDetails, modificationValues, resolveCarCatalogIdentity } from '@/features/catalog/lib/carCatalogIdentity';

export function useAddCar() {
    const router = useRouter();
    const savingManualCar = useRef(false);

    const [vin, setVin] = useState('');
    const [vinMatches, setVinMatches] = useState<ReturnType<typeof findCatalogVinMatches>>([]);
    const [error, setError] = useState('');
    const [manualMode, setManualMode] = useState(false);
    const [manualForm, setManualForm] = useState<ManualCarForm>(
        createEmptyManualForm()
    );

    const [matchedVin, setMatchedVin] = useState(false);

    const openManualForm = (form: ManualCarForm, fromVinMatch = false) => {
        setManualForm(form);
        setVinMatches([]);
        setMatchedVin(fromVinMatch);
        setManualMode(true);
        setError('');
    };

    const chooseVinMatch = ({ model, modification }: (typeof vinMatches)[number]) => {
        const startYear = modification.attributes?.year ?? '';
        const endYear = modification.attributes?.yearEnd;
        openManualForm({
            ...createEmptyManualForm(normalizeVin(vin)),
            ...modificationValues(modification),
            make: model.brandName,
            model: model.modelName,
            year: startYear === endYear ? startYear : '',
            bodyCode: modification.attributes?.bodyCode ?? '',
            catalogBrandSlug: model.brandSlug,
            catalogModelSlug: model.modelSlug,
            catalogModificationId: modification.id,
            modificationName: modification.name,
        }, true);
    };

    const cancelManualMode = () => {
        setManualMode(false);
        setMatchedVin(false);
        setError('');
        setManualForm(createEmptyManualForm());
    };

    const updateVin = (value: string) => {
        setVin(value);
        setVinMatches([]);
        setError('');
    };

    const decodeVin = (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setVinMatches([]);

        const cleanVin = normalizeVin(vin);
        if (!isValidVin(cleanVin)) {
            setError('Введите VIN из 17 цифр и латинских букв. Буквы I, O и Q в VIN не используются.');
            return;
        }

        const matches = findCatalogVinMatches(cleanVin, systemStore.getState().masterModels);
        if (matches.length === 1) {
            chooseVinMatch(matches[0]);
        } else if (matches.length > 1) {
            setVinMatches(matches);
        } else {
            setError('В нашем каталоге пока нет совпадений по этому VIN. Автомобиль можно добавить вручную.');
        }
    };

    const enableManualMode = () => {
        openManualForm(createEmptyManualForm(normalizeVin(vin)));
    };

    const updateManualField = (field: keyof ManualCarForm, value: string) => {
        if (field === 'vin' && normalizeVin(value) !== normalizeVin(manualForm.vin)) setMatchedVin(false);
        setManualForm(prev => ({
            ...prev,
            ...(['make', 'model', 'vin', 'bodyCode', 'engine', 'transmission', 'driveType',
                'trim', 'displacementL', 'fuel', 'bodyClass'].includes(field) &&
                prev[field] !== value
                ? { catalogModificationId: '', modificationName: '' }
                : {}),
            [field]: value,
        }));
    };

    const saveManualCar = () => {
        if (savingManualCar.current) return;
        setError('');

        if (!isManualFormValid(manualForm)) {
            setError('Укажи хотя бы марку, модель и год');
            return;
        }

        const state = systemStore.getState();
        const enteredCar = {
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
        const selectedModel = state.masterModels.find(model =>
            model.brandSlug === enteredCar.catalogBrandSlug && model.modelSlug === enteredCar.catalogModelSlug
        );
        const selectedModification = selectedModel?.modifications?.find(item => item.id === enteredCar.catalogModificationId);
        const needsReview = selectedModification !== undefined &&
            !matchesVehicleDetails(selectedModification, String(enteredCar.year), enteredCar.bodyCode ?? '');
        const savedCar = needsReview
            ? { ...enteredCar, catalogModificationId: undefined, modificationName: undefined }
            : selectedModification
                ? enteredCar
                : linkMatchingCatalogModification(enteredCar, state.masterModels);

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

        savingManualCar.current = true;
        let addedToGarage = false;
        try {
            addCarToGarage({ ...savedCar, initialPartCategories: captureInitialPartCategories(savedCar, state) });
            addedToGarage = true;

            const currentUser = state.users[0];

            // Единственная точка регистрации и отправки на проверку.
            systemStore.addCar({
                userId: currentUser?.id ?? '',
                garageCarId: savedCar.id,
                proposedModificationId: needsReview ? selectedModification.id : undefined,
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
                carSpecs: getCarReviewSpecs(savedCar),
            });

        } catch (error) {
            if (addedToGarage) {
                try {
                    saveGarageCars(getGarageCars().filter(car => car.id !== savedCar.id));
                } catch {
                    setError('Регистрация не завершилась. Проверьте гараж перед повторным добавлением.');
                    return;
                }
            }
            savingManualCar.current = false;
            setError(
                error instanceof Error
                    ? error.message
                    : 'Не удалось завершить сохранение автомобиля.'
            );
            return;
        }
        router.push('/garage');
    };

    return {
        vin,
        updateVin,
        vinMatches,
        chooseVinMatch,
        error,
        matchedVin,
        manualMode,
        manualForm,
        decodeVin,
        enableManualMode,
        cancelManualMode,
        updateManualField,
        saveManualCar,
    };
}
