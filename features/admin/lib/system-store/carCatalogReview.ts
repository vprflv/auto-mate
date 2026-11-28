import { compareCatalogModificationAttributes } from '@/features/catalog/lib/sortCatalogModifications';
import type {
    CarSpecs,
    CatalogModification,
    InboxItem,
    SystemState,
} from './types';
import { storage } from './storage';
import { getGarageCars, saveGarageCars } from '@/features/garage/add/lib/storage';
import { carReviewVersion, getCatalogProductionYears, normalizeCode, resolveCarCatalogIdentity } from '@/features/catalog/lib/carCatalogIdentity';
import { matchesFacelift } from '@/features/catalog/lib/facelift';
import { normalizeSlug } from './utils';
import {CarVariant, isSameCarVariant} from "@/features/admin/lib/carVariant";
import type { Car, CarCatalogPreference } from '@/types';
import { catalogPreferenceKey, catalogReviewVersion, getCatalogCandidates, getCatalogChoiceDifferences, resolveCatalogPreference } from '@/features/catalog/lib/catalogVehicleSelection';
import { findCatalogFrameMatches, normalizeFrameNumber } from '@/features/garage/add/lib/catalogFrameRules';
import { findCatalogVinMatches } from '@/features/garage/add/lib/catalogVinRules';
import { formatTransmission } from '@/features/garage/add/lib/config/robotTransmission';
import { normalizeVin } from '@/features/garage/add/lib/config/vin';
import { buildVinTrainingDraftForCar } from './vinTrainingDraft';
import { getSharedSs11CarReviewVin } from './belgeeCarReview';

export function getCarReviewSpecs(car: Car): CarSpecs {
    return {
        vin: car.vin === 'UNKNOWN' ? undefined : car.vin,
        frameNumber: car.frameNumber,
        bodyCode: car.bodyCode,
        bodyClass: car.bodyClass,
        facelift: car.facelift,
        displacementL: car.displacementL,
        cylinders: car.cylinders,
        fuel: car.fuel,
        transmission: car.transmission,
        driveType: car.driveType,
        trim: car.trim,
        doors: car.doors,
        plantCountry: car.plantCountry,
        color: car.color,
    };
}


export interface CarCatalogReviewInput {
    garageCarId?: string;
    proposedModificationId?: string;
    userId?: string;
    brand: string;
    model: string;
    year: number;
    engine: string;
    carSpecs: CarSpecs;
}

function getTicketVariant(item: InboxItem): CarVariant {
    const specs = item.carSpecs;

    return {
        engine: item.engine,
        engineCode: specs?.engineCode ?? item.engineCode,
        displacementL: specs?.displacementL,
        fuel: specs?.fuel,
        transmission: specs?.transmission ?? item.transmission,
        driveType: specs?.driveType ?? item.drivetrain,
        bodyClass: specs?.bodyClass,
        facelift: specs?.facelift,
        trim: specs?.trim,
    };
}

export function matchesCarReviewBody(
    ticket: InboxItem,
    year: number,
    bodyCode?: string
): boolean {
    return ticket.carYear === year &&
        normalizeCode(ticket.carSpecs?.bodyCode) === normalizeCode(bodyCode);
}

export function checkCarReviewModification(
    ticket: InboxItem,
    modification: CatalogModification
) {
    const conflicts: string[] = [];
    const yearConflicts: string[] = [];
    const warnings: string[] = [];
    const attributes = modification.attributes;
    if (getSharedSs11CarReviewVin(ticket)) {
        const entered = formatTransmission(ticket.carSpecs?.transmission ?? ticket.transmission);
        const stored = formatTransmission(attributes?.transmission);
        if (entered && stored && entered !== stored && !entered.startsWith(`${stored} (`) && !stored.startsWith(`${entered} (`)) {
            conflicts.push(`КПП в заявке — ${entered}, у модификации — ${stored}.`);
        }
    }
    const ticketCode = ticket.carSpecs?.bodyCode;
    const catalogCode = attributes?.bodyCode;
    const requestedCode = normalizeCode(ticketCode);
    const storedCode = normalizeCode(catalogCode);

    if (requestedCode && storedCode && requestedCode !== storedCode) {
        conflicts.push(`Код кузова в заявке — ${ticketCode}, у модификации — ${catalogCode}.`);
    } else if (!requestedCode || !storedCode) {
        warnings.push('Код кузова не указан в заявке или каталоге.');
    }

    if (!matchesFacelift(ticket.carSpecs?.facelift, attributes?.facelift)) {
        conflicts.push('Версия кузова в заявке отличается от версии выбранной модификации.');
    }

    const year = ticket.carYear;
    const { start, end } = getCatalogProductionYears(modification);

    if (year && start && year < start) {
        yearConflicts.push(`Год машины ${year} раньше начала выпуска модификации (${start}).`);
    }
    if (year && end && year > end) {
        yearConflicts.push(`Год машины ${year} позже окончания выпуска модификации (${end}).`);
    }
    if (!year || start === undefined || end === undefined || end < start) {
        warnings.push('Не хватает данных, чтобы полностью сверить годы выпуска.');
    }

    return { conflicts, yearConflicts, warnings };
}

export function removeCarFromOtherReviews(state: SystemState, carId: string, keepId?: string): boolean {
    let changed = false;
    state.inbox = state.inbox.filter(ticket => {
        if (ticket.id === keepId || ticket.type !== 'car_model' ||
            !Object.prototype.hasOwnProperty.call(ticket.garageCarVersions ?? {}, carId)) {
            return true;
        }

        const remainingVersions = { ...ticket.garageCarVersions };
        delete remainingVersions[carId];
        changed = true;
        ticket.garageCarVersions = remainingVersions;
        return Object.keys(remainingVersions).length > 0;
    });
    return changed;
}

export function isCurrentCatalogReview(item: InboxItem, car: Car): boolean {
    const stored = item.garageCarVersions?.[car.id];
    if (!stored) return false;
    if (stored === catalogReviewVersion(car)) return true;
    if (car.catalogPreference) return false;
    const knownVin = normalizeVin(item.carSpecs?.vin ?? item.carVin ?? '');
    const knownFrame = normalizeFrameNumber(item.carSpecs?.frameNumber ?? '');
    return (stored === carReviewVersion(car) || stored === carReviewVersion(car, true)) &&
        (!knownVin || knownVin === normalizeVin(car.vin)) && (!knownFrame || knownFrame === normalizeFrameNumber(car.frameNumber ?? ''));
}

export function recordCatalogReviewHandled(state: SystemState, item: InboxItem, cars = getGarageCars()): void {
    for (const car of cars) {
        if (!isCurrentCatalogReview(item, car)) continue;
        state.reviewedCatalogVersions = { ...state.reviewedCatalogVersions, [car.id]: catalogReviewVersion(car) };
    }
}

export function saveCarCatalogPreference(carId: string, preference: CarCatalogPreference): boolean {
    const state = storage.getState();
    if (!resolveCatalogPreference(preference, state.masterModels)) throw new Error('Модификация больше не доступна. Выберите другую.');
    const cars = getGarageCars();
    const car = cars.find(entry => entry.id === carId);
    if (!car) throw new Error('Автомобиль не найден.');
    if (!car.catalogPreference || catalogPreferenceKey(car.catalogPreference) !== catalogPreferenceKey(preference)) {
        const updated: Car = { ...car, catalogPreference: preference, catalogAwaitingReview: undefined, updatedAt: new Date().toISOString() };
        saveGarageCars(cars.map(entry => entry.id === carId ? updated : entry));
    }
    try {
        const queued = queueCarCatalogReview(state, {
            garageCarId: carId, userId: state.cars.find(entry => entry.id === carId)?.userId,
            brand: car.make, model: car.model, year: car.year, engine: car.engine ?? '', carSpecs: getCarReviewSpecs(car),
        });
        if (queued) storage.saveState(state);
        return true;
    } catch {
        return false;
    }
}

export function requestCarCatalogReview(carId: string): void {
    const cars = getGarageCars();
    const car = cars.find(entry => entry.id === carId);
    if (!car) throw new Error('Автомобиль не найден.');
    const revision = catalogReviewVersion(car);
    if (car.catalogAwaitingReview !== revision) {
        saveGarageCars(cars.map(entry => entry.id === carId ? { ...entry, catalogAwaitingReview: revision } : entry));
    }
    try {
        submitCarCatalogReview({ garageCarId: carId, brand: car.make, model: car.model, year: car.year,
            engine: car.engine ?? '', carSpecs: getCarReviewSpecs(car) });
    } catch (error) {
        if (car.catalogAwaitingReview !== revision) saveGarageCars(cars);
        throw error;
    }
}

export function queueCarCatalogReview(
    state: SystemState,
    input: CarCatalogReviewInput
): boolean {
    const brand = input.brand.trim();
    const model = input.model.trim();

    if (!brand || !model) return false;

    const brandSlug = normalizeSlug(brand);
    const modelSlug = normalizeSlug(model);

    const masterModel = state.masterModels.find(
        candidate =>
            (
                candidate.brandSlug === brandSlug ||
                normalizeSlug(candidate.brandName) === brandSlug
            ) &&
            (
                candidate.modelSlug === modelSlug ||
                normalizeSlug(candidate.modelName) === modelSlug
            )
    );

    const specs = input.carSpecs;

    const variant: CarVariant = {
        engine: input.engine,
        engineCode: specs.engineCode,
        displacementL: specs.displacementL,
        fuel: specs.fuel,
        transmission: specs.transmission,
        driveType: specs.driveType,
        bodyClass: specs.bodyClass,
        facelift: specs.facelift,
        trim: specs.trim,
    };

    const garageCar = input.garageCarId
        ? getGarageCars().find(car => car.id === input.garageCarId)
        : undefined;

    const revision = garageCar ? catalogReviewVersion(garageCar) : undefined;
    if (garageCar && revision === state.reviewedCatalogVersions?.[garageCar.id]) return removeCarFromOtherReviews(state, garageCar.id);
    const candidates = garageCar && getCatalogCandidates(garageCar, state.masterModels);
    const confirmed = candidates && candidates.confirmed;
    const preferred = candidates && candidates.preferred;
    const linked = garageCar && resolveCarCatalogIdentity(garageCar, state.masterModels);
    const selectedModel = linked ? linked.model : masterModel;
    const selectedModification = linked ? linked.modification : masterModel?.modifications?.find(
        modification => modification.id === input.proposedModificationId
    );
    const vinMatches = garageCar ? findCatalogVinMatches(garageCar.vin, state.masterModels) : [];
    const vinMismatch = !preferred && selectedModel && selectedModification && vinMatches.length > 0 &&
        !vinMatches.some(match => match.model === selectedModel && match.modification === selectedModification)
        ? {
            selected: {
                name: selectedModification.name,
                transmission: formatTransmission(selectedModification.attributes?.transmission) || undefined,
            },
            matches: vinMatches.sort((first, second) =>
                compareCatalogModificationAttributes(first.modification.attributes, second.modification.attributes)
            ).map(({ model, modification }) => ({
                name: `${model.brandName} ${model.modelName} · ${modification.name}`,
                transmission: formatTransmission(modification.attributes?.transmission) || undefined,
            })),
            catalogOpen: Boolean(confirmed),
            selectedModificationId: selectedModification.id,
        }
        : undefined;

    const frameMatches = garageCar?.frameNumber ? findCatalogFrameMatches(garageCar.frameNumber, state.masterModels) : [];
    const hasSpecificFrameMatch = frameMatches.some(match => !match.requiresConfirmation);
    const vinTraining = garageCar && !preferred && !input.proposedModificationId && !vinMatches.length && !hasSpecificFrameMatch
        ? buildVinTrainingDraftForCar(garageCar)
        : undefined;

    const choice = preferred || (confirmed && !vinTraining && !vinMismatch ? confirmed : undefined);
    const catalogCheck = garageCar && choice ? {
        name: [choice.model.brandName, choice.model.modelName, choice.modification.name].join(' · '),
        differences: getCatalogChoiceDifferences(garageCar, choice, state.masterModels),
    } : undefined;
    const garageCarVersions = garageCar && revision ? { [garageCar.id]: revision } : {};

    const alreadyInInbox = state.inbox.find(
        item =>
            item.type === 'car_model' &&
            (garageCar ? item.garageCarVersions?.[garageCar.id] === revision : !Object.keys(item.garageCarVersions ?? {}).length) &&
            JSON.stringify(item.catalogCheck) === JSON.stringify(catalogCheck) &&
            (vinMismatch && garageCar
                ? item.garageCarVersions?.[garageCar.id] === garageCarVersions[garageCar.id] &&
                    normalizeVin(item.carVin ?? '') === normalizeVin(garageCar.vin) &&
                    JSON.stringify(item.vinMismatch) === JSON.stringify(vinMismatch)
                : !item.vinMismatch) &&
            (vinTraining && garageCar
                ? Boolean(item.vinTraining) &&
                    item.garageCarVersions?.[garageCar.id] === garageCarVersions[garageCar.id] &&
                    normalizeVin(item.carVin ?? '') === normalizeVin(specs.vin ?? '') &&
                    normalizeFrameNumber(item.carSpecs?.frameNumber ?? '') === normalizeFrameNumber(garageCar.frameNumber ?? '')
                : !item.vinTraining) &&
            normalizeSlug(item.carBrand) === brandSlug &&
            normalizeSlug(item.carModel) === modelSlug &&
            matchesCarReviewBody(item, input.year, specs.bodyCode) &&
            item.proposedModificationId === input.proposedModificationId &&
            (!input.proposedModificationId ||
                (garageCar && item.garageCarVersions?.[garageCar.id] !== undefined)) &&
            isSameCarVariant(
                variant,
                getTicketVariant(item)
            )
    );

    const removedOldReview = garageCar
        ? removeCarFromOtherReviews(state, garageCar.id, alreadyInInbox?.id)
        : false;

    if (alreadyInInbox) {
        const before = JSON.stringify(alreadyInInbox.garageCarVersions ?? {});
        alreadyInInbox.garageCarVersions = {
            ...alreadyInInbox.garageCarVersions,
            ...garageCarVersions,
        };
        return removedOldReview || before !== JSON.stringify(alreadyInInbox.garageCarVersions);
    }

    const user = input.userId
        ? state.users.find(candidate => candidate.id === input.userId)
        : undefined;

    state.inbox.unshift({
        id: `inbox_car_${crypto.randomUUID()}`,
        type: 'car_model',
        garageCarVersions,
        vinTraining,
        catalogCheck,
        vinMismatch,
        proposedModificationId: input.proposedModificationId,
        source: 'user_manual',
        carBrand: masterModel?.brandName ?? brand,
        carModel: masterModel?.modelName ?? model,
        carYear: input.year,
        carVin: specs.vin,
        engine: input.engine.trim(),
        engineCode: specs.engineCode,
        transmission: specs.transmission,
        drivetrain: specs.driveType,
        carSpecs: { ...specs },
        submittedBy: user?.email || 'Пользователь',
        submittedAt: 'Только что',
        note: catalogCheck ? 'Каталог открыт. Сверьте исходные данные автомобиля с выбранной карточкой.' : vinMismatch
            ? 'По VIN найдена другая модификация. Сверьте заводские данные и выбор пользователя.'
            : masterModel
                ? 'Пользователь указал новое сочетание характеристик автомобиля. Проверьте данные и подтвердите модификацию.'
                : 'Пользователь указал новую модель автомобиля. Проверьте данные и подтвердите добавление в каталог.',
    });

    return true;
}

export function submitCarCatalogReview(
    input: CarCatalogReviewInput
): boolean {
    const state = storage.getState();
    const created = queueCarCatalogReview(state, input);

    if (created) {
        storage.saveState(state);
    }

    return created;
}
