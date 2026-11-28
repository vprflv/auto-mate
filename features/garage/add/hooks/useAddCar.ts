'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ManualCarForm } from '@/types';
import {
    createEmptyManualForm,
    getManualFormError,
    mapManualFormToCar
} from "@/features/garage/add/lib/manualForm";
import { findCatalogVinMatches, findCatalogVinSuggestions, hasCatalogVinException, type CatalogVinMatch } from '@/features/garage/add/lib/catalogVinRules';
import { isUsableCatalogModel, isUsableCatalogModification } from '@/features/garage/add/lib/catalogDecoderRecords';
import { getIdentifierCyrillicWarning, isValidVin, normalizeIdentifierLetters, normalizeVin } from "@/features/garage/add/lib/config/vin";
import { getBelgeeS50TransmissionChoices, getGeelyEmgrandSs11VinMatches, isBelgeeS50SharedVin, isGeelyEmgrandSs11Model } from '@/features/garage/add/lib/belgeeS50Vin';
import { addCarToGarage, getGarageCars, saveGarageCars } from '@/features/garage/add/lib/storage';
import { captureInitialPartCategories } from '@/features/garage/lib/getCategories';
import { findCatalogFrameMatches, getFrameCode, normalizeFrameNumber, splitVehicleIdentifier } from '../lib/catalogFrameRules';
import { getLocalVinVersionHint, type VinVersionHint } from '../lib/vinVersionHint';

// Импортируем глобальный стор админки
import { systemStore } from '@/features/admin/lib/systemStore';
import type { StoredMasterModel } from '@/features/admin/lib/system-store/types';
import { getCarReviewSpecs } from '@/features/admin/lib/system-store/carCatalogReview';
import { catalogPreferenceFor } from '@/features/catalog/lib/catalogVehicleSelection';
import { carCatalogYearApprovalVersion, findVinMatchFacelift, getCatalogProductionYears, linkMatchingCatalogModification, matchesVehicleDetails, modificationValues, resolveCarCatalogIdentity } from '@/features/catalog/lib/carCatalogIdentity';

async function requestVinMatches(vin: string, models: StoredMasterModel[], signal: AbortSignal): Promise<{
    matches: CatalogVinMatch[];
    hint?: VinVersionHint;
}> {
    const masterModels = models.filter(isUsableCatalogModel).map(model => ({
        brandSlug: model.brandSlug,
        brandName: model.brandName,
        modelSlug: model.modelSlug,
        modelName: model.modelName,
        verified: model.verified,
        modifications: model.modifications.filter(isUsableCatalogModification)
            .map(modification => ({
                id: modification.id,
                name: modification.name,
                attributes: modification.attributes,
                vinRules: modification.vinRules,
                vinExceptions: hasCatalogVinException(modification, vin) ? [vin] : undefined,
            }))
            .filter(modification => modification.vinRules?.length || modification.vinExceptions?.length),
    })).filter(model => model.modifications.length > 0);

    try {
        const response = await fetch('/api/vin/decode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vin, masterModels }),
            signal,
        });
        if (!response.ok) throw new Error('VIN decoder unavailable');

        const result: {
            matches: Array<{ brandSlug: string; modelSlug: string; modificationId: string; modelYear?: number; specificity: number }>;
            hint?: VinVersionHint;
        } =
            await response.json();
        const matches = models.filter(isUsableCatalogModel).flatMap(model =>
            model.modifications.filter(isUsableCatalogModification).flatMap(modification => {
                const match = result.matches.find(candidate =>
                    candidate.brandSlug === model.brandSlug &&
                    candidate.modelSlug === model.modelSlug &&
                    candidate.modificationId === modification.id
                );
                return match ? [{ model, modification, modelYear: match.modelYear, specificity: match.specificity }] : [];
            })
        );
        matches.sort((first, second) => second.specificity - first.specificity);
        return { matches, hint: matches.length ? undefined : result.hint ?? getLocalVinVersionHint(vin) };
    } catch (error) {
        if (signal.aborted) throw error;
        const matches = findCatalogVinMatches(vin, models);
        return { matches, hint: matches.length ? undefined : getLocalVinVersionHint(vin) };
    }
}

export function useAddCar() {
    const router = useRouter();
    const savingManualCar = useRef(false);
    const lastFrameLookup = useRef('');
    const vinRequest = useRef<AbortController | null>(null);
    const [isDecoding, setIsDecoding] = useState(false);

    useEffect(() => () => vinRequest.current?.abort(), []);

    const [vin, setVin] = useState('');
    const [correctedVin, setCorrectedVin] = useState<string>();
    const [vinMatches, setVinMatches] = useState<ReturnType<typeof findCatalogVinMatches>>([]);
    const [sharedSs11Options, setSharedSs11Options] = useState<{
        belgee: ReturnType<typeof getBelgeeS50TransmissionChoices>;
        geely: CatalogVinMatch[];
    } | null>(null);
    const [error, setError] = useState('');
    const [catalogPicker, setCatalogPicker] = useState<{
        models: StoredMasterModel[];
        reason: 'no-match' | 'unavailable' | 'skip';
        identifier?: 'frame' | 'vin';
        hint?: VinVersionHint;
    } | null>(null);
    const [manualMode, setManualMode] = useState(false);
    const [manualForm, setManualForm] = useState<ManualCarForm>(
        createEmptyManualForm()
    );

    const [matchedVin, setMatchedVin] = useState(false);
    const [explicitSelection, setExplicitSelection] = useState('');

    const cancelVinRequest = () => {
        vinRequest.current?.abort();
        vinRequest.current = null;
        setIsDecoding(false);
    };

    const openManualForm = (form: ManualCarForm, fromVinMatch = false) => {
        cancelVinRequest();
        lastFrameLookup.current = normalizeFrameNumber(form.frameNumber);
        setCatalogPicker(null);
        setManualForm(form);
        setExplicitSelection('');
        setVinMatches([]);
        setSharedSs11Options(null);
        setMatchedVin(fromVinMatch);
        setManualMode(true);
        setError('');
    };

    const openCatalogModification = (
        { model, modification, modelYear }: CatalogVinMatch,
        checkedVin: string,
        fromVinMatch: boolean,
        frameNumber = manualMode ? manualForm.frameNumber : '',
        frameCode = '',
        userSelected = false,
    ) => {
        const { start, end } = getCatalogProductionYears(modification);
        const suggestedYear = modelYear ?? (start === end ? start : undefined);
        const values = modificationValues(modification, findVinMatchFacelift(model, modification, modelYear));
        const reported = userSelected && manualMode ? Object.fromEntries(
            (Object.keys(values) as (keyof typeof values)[]).flatMap(field => manualForm[field]?.trim() ? [[field, manualForm[field]]] : [])
        ) : {};
        openManualForm({
            ...createEmptyManualForm(checkedVin, frameNumber),
            ...values,
            ...reported,
            year: userSelected && manualMode && manualForm.year ? manualForm.year : suggestedYear?.toString() ?? '',
            make: userSelected && manualMode && manualForm.make ? manualForm.make : model.brandName,
            model: userSelected && manualMode && manualForm.model ? manualForm.model : model.modelName,
            bodyCode: (userSelected && manualMode ? manualForm.bodyCode : '') || modification.attributes?.bodyCode || frameCode,
            catalogBrandSlug: model.brandSlug,
            catalogModelSlug: model.modelSlug,
            catalogModificationId: modification.id,
            modificationName: modification.name,
        }, fromVinMatch);
        if (userSelected) setExplicitSelection(modification.id);
    };

    const chooseVinMatch = (match: CatalogVinMatch, checkedVin = normalizeVin(vin), userSelected = false) =>
        openCatalogModification(match, checkedVin, true, '', undefined, userSelected);

    const chooseCatalogModification = (match: CatalogVinMatch) => {
        const identifier = splitVehicleIdentifier(vin, systemStore.getState().masterModels);
        openCatalogModification(match, identifier.vin, false, identifier.frameNumber, identifier.frameCode ?? getFrameCode(identifier.frameNumber), true);
    };

    const chooseLookupMatch = (match: CatalogVinMatch) => {
        if (isValidVin(vin)) chooseVinMatch(match, normalizeVin(vin), true);
        else chooseCatalogModification(match);
    };

    const openCatalogPicker = (
        reason: NonNullable<typeof catalogPicker>['reason'] = 'skip',
        models = systemStore.getState().masterModels,
        hint?: VinVersionHint,
        identifier?: 'frame' | 'vin',
    ) => {
        cancelVinRequest();
        setError('');
        setCatalogPicker({ reason, models: models.filter(isUsableCatalogModel).map(model => ({
            ...model, modifications: model.modifications.filter(isUsableCatalogModification),
        })).filter(model => model.modifications.length > 0), hint, identifier });
    };

    const cancelManualMode = () => {
        cancelVinRequest();
        setVinMatches([]);
        setSharedSs11Options(null);
        setManualMode(false);
        setMatchedVin(false);
        setError('');
        setExplicitSelection('');
        setManualForm(createEmptyManualForm());
    };

    const updateVin = (value: string) => {
        cancelVinRequest();
        setVin(value);
        setCorrectedVin(undefined);
        setCatalogPicker(null);
        setVinMatches([]);
        setSharedSs11Options(null);
        setError('');
    };

    const lookupVin = async (cleanVin: string) => {
        if (!isValidVin(cleanVin)) {
            setError('Введите VIN из 17 цифр и латинских букв. Буквы I, O и Q в VIN не используются.');
            return;
        }

        const request = new AbortController();
        vinRequest.current = request;
        setIsDecoding(true);

        try {
            const models = systemStore.getState().masterModels;
            const isBelgee = isBelgeeS50SharedVin(cleanVin);
            const { matches, hint } = await requestVinMatches(cleanVin, models, request.signal);
            if (request.signal.aborted) return;
            if (matches.length === 1) {
                chooseVinMatch(matches[0], cleanVin);
            } else if (matches.length > 1) {
                setVinMatches(matches);
            } else if (isBelgee) {
                setSharedSs11Options({
                    belgee: getBelgeeS50TransmissionChoices(models),
                    geely: getGeelyEmgrandSs11VinMatches(models),
                });
            } else {
                const suggestions = hint ? [] : findCatalogVinSuggestions(cleanVin, models);
                if (suggestions.length) setVinMatches(suggestions);
                else if (hint || !manualMode) openCatalogPicker('no-match', models, hint);
                else setError('VIN не распознан. Выберите модификацию или продолжите заполнение.');
            }
        } catch {
            if (!request.signal.aborted) {
                if (manualMode) setError('Не удалось проверить VIN. Можно продолжить заполнение.');
                else openCatalogPicker('unavailable', []);
            }
        } finally {
            if (vinRequest.current === request) {
                vinRequest.current = null;
                setIsDecoding(false);
            }
        }
    };

    const lookupFrame = (value: string) => {
        try {
            const models = systemStore.getState().masterModels;
            const identifier = splitVehicleIdentifier(value, models);
            if (!identifier.frameNumber && !identifier.frameCode) {
                setError('Введите VIN из 17 символов, номер кузова с дефисом (GD1-1234567) или код кузова (GD1).');
                return;
            }
            const matches = findCatalogFrameMatches(identifier.frameNumber || identifier.frameCode || '', models);
            const specific = matches.filter(match => !match.requiresConfirmation);
            if (specific.length === 1) openCatalogModification(specific[0], '', false, identifier.frameNumber, getFrameCode(identifier.frameNumber));
            else if (matches.length) setVinMatches(matches);
            else if (manualMode) setError('Номер кузова не распознан. Выберите модификацию или продолжите заполнение.');
            else openCatalogPicker('no-match', models, undefined, 'frame');
        } catch {
            if (manualMode) setError('Не удалось проверить номер кузова. Можно продолжить заполнение.');
            else openCatalogPicker('unavailable', [], undefined, 'frame');
        }
    };

    const decodeIdentifier = (event: React.FormEvent) => {
        event.preventDefault();
        cancelVinRequest();
        setError('');
        setVinMatches([]);
        setSharedSs11Options(null);
        const cyrillicWarning = getIdentifierCyrillicWarning(vin);
        if (cyrillicWarning) {
            setError(cyrillicWarning);
            return;
        }
        if (isValidVin(vin)) {
            const normalized = normalizeVin(vin);
            setCorrectedVin(normalizeIdentifierLetters(vin).replace(/\s+/g, '') !== normalized ? normalized : undefined);
            return lookupVin(normalized);
        }
        setCorrectedVin(undefined);

        lookupFrame(vin);
    };

    const enableManualMode = (model?: StoredMasterModel) => {
        const identifier = splitVehicleIdentifier(vin, systemStore.getState().masterModels);
        openManualForm({
            ...createEmptyManualForm(identifier.vin, identifier.frameNumber),
            bodyCode: identifier.frameCode ?? getFrameCode(identifier.frameNumber) ?? '',
            make: model?.brandName ?? '',
            model: model?.modelName ?? '',
        });
    };

    const enterBelgeeManually = (transmission = '') => {
        openManualForm({
            ...createEmptyManualForm(normalizeVin(vin)),
            make: 'Belgee',
            model: 'S50',
            displacementL: '1.5',
            transmission,
        });
    };

    const enterGeelyManually = () => {
        const knownModels = systemStore.getState().masterModels.filter(model =>
            model.verified && isGeelyEmgrandSs11Model(model.brandName, model.modelName)
        );
        const model = knownModels.length === 1 ? knownModels[0] : undefined;
        openManualForm({
            ...createEmptyManualForm(normalizeVin(vin)),
            make: model?.brandName ?? 'Geely',
            model: model?.modelName ?? 'Emgrand IV (SS11)',
            displacementL: '1.5',
        });
    };

    const updateManualField = (field: keyof ManualCarForm, value: string) => {
        if (field === 'catalogModificationId') setExplicitSelection(value);
        if (field === 'vin' || field === 'frameNumber') {
            const normalized = field === 'vin' ? normalizeVin(value) : normalizeFrameNumber(value);
            const previous = field === 'vin' ? normalizeVin(manualForm.vin) : normalizeFrameNumber(manualForm.frameNumber);
            if (normalized === previous) return;

            updateVin(normalized);
            setManualForm(form => ({ ...form, [field]: normalized }));
            setMatchedVin(false);

            // Clearing or editing an incomplete identifier must preserve the filled form.
            if (field === 'frameNumber' || !normalized || getIdentifierCyrillicWarning(normalized)) return;
            const identifier = splitVehicleIdentifier(normalized, systemStore.getState().masterModels);
            if (!identifier.vin) return;

            // A different complete VIN starts a fresh lookup and drops the old vehicle's selection.
            lastFrameLookup.current = '';
            setExplicitSelection('');
            setManualForm({
                ...createEmptyManualForm(identifier.vin, identifier.frameNumber),
                bodyCode: getFrameCode(identifier.frameNumber) ?? '',
            });
            if (normalized !== normalizeIdentifierLetters(value).replace(/\s+/g, '')) setCorrectedVin(normalized);
            void lookupVin(identifier.vin);
            return;
        }

        setManualForm(prev => ({
            ...prev,
            ...(['make', 'model', 'bodyCode', 'engine', 'transmission', 'driveType',
                'trim', 'displacementL', 'fuel', 'bodyClass'].includes(field) &&
                prev[field] !== value
                ? { catalogModificationId: '', modificationName: '' }
                : {}),
            [field]: value,
        }));
    };

    const commitManualFrame = (): boolean => {
        const value = manualForm.frameNumber;
        if (!value.trim() || getIdentifierCyrillicWarning(value)) return false;
        const { frameNumber } = splitVehicleIdentifier(value, systemStore.getState().masterModels);
        if (!frameNumber || frameNumber === lastFrameLookup.current) return false;

        lastFrameLookup.current = frameNumber;
        updateVin(frameNumber);
        setExplicitSelection('');
        setMatchedVin(false);
        setManualForm({
            ...createEmptyManualForm('', frameNumber),
            bodyCode: getFrameCode(frameNumber) ?? '',
        });
        lookupFrame(frameNumber);
        return true;
    };

    const saveManualCar = () => {
        if (savingManualCar.current || vinRequest.current) return;
        if (commitManualFrame()) return;
        setError('');

        const validationError = getManualFormError(manualForm);
        if (validationError) {
            setError(validationError);
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
        const usualYearMatch = selectedModification && matchesVehicleDetails(
            selectedModification, String(enteredCar.year), enteredCar.bodyCode ?? '',
        );
        const relaxedYearMatch = selectedModification && matchesVehicleDetails(
            selectedModification, String(enteredCar.year), enteredCar.bodyCode ?? '', { yearTolerance: 1 },
        );
        const needsReview = selectedModification !== undefined && !relaxedYearMatch;
        const selectedCar = relaxedYearMatch && !usualYearMatch
            ? { ...enteredCar, catalogYearApproval: carCatalogYearApprovalVersion(enteredCar) }
            : enteredCar;
        const preference = selectedModel?.verified && selectedModification && explicitSelection === selectedModification.id
            ? catalogPreferenceFor({ model: selectedModel, modification: selectedModification }) : undefined;
        const canLink = selectedModification && !needsReview && resolveCarCatalogIdentity(selectedCar, state.masterModels);
        const savedCar = preference ? {
            ...(!canLink ? { ...enteredCar, catalogBrandSlug: undefined, catalogModelSlug: undefined,
                catalogModificationId: undefined, modificationName: undefined } : selectedCar),
            catalogPreference: preference,
        } : needsReview
            ? { ...enteredCar, catalogModificationId: undefined, modificationName: undefined }
            : selectedModification || isBelgeeS50SharedVin(enteredCar.vin)
                ? selectedCar
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
                proposedModificationId: needsReview && !preference ? selectedModification.id : undefined,
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
        correctedVin,
        updateVin,
        isDecoding,
        vinMatches,
        sharedSs11Options,
        enterGeelyManually,
        enterBelgeeManually,
        chooseLookupMatch,
        chooseCatalogModification,
        catalogPicker,
        openCatalogPicker,
        closeCatalogPicker: () => setCatalogPicker(null),
        error,
        matchedVin,
        manualMode,
        manualForm,
        decodeIdentifier,
        enableManualMode,
        cancelManualMode,
        updateManualField,
        commitManualFrame,
        saveManualCar,
    };
}
