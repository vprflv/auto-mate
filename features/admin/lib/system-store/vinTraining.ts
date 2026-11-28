import { EXACT_FRAME_SPECIFICITY, findCatalogFrameMatches, frameRuleKey, normalizeFrameNumber, uniqueFrameRules } from '@/features/garage/add/lib/catalogFrameRules';
import { z } from 'zod';

import {
    carCatalogYearApprovalVersion,
    matchesKnownModificationFields,
    matchesModificationField,
    matchesVehicleDetails,
    modificationFields,
    modificationValues,
    normalizeCode,
    resolveCarCatalogIdentity,
} from '@/features/catalog/lib/carCatalogIdentity';
import { formatFacelift, knownFacelift, matchesFacelift, normalizeFacelift } from '@/features/catalog/lib/facelift';
import { formatTransmission } from '@/features/garage/add/lib/config/robotTransmission';
import { getGarageCars, saveGarageCars } from '@/features/garage/add/lib/storage';
import { assertConsistentVinModelYears, assertNoVinRuleConflicts, catalogVinRuleMatches, getVinRuleConflicts, findCatalogVinMatches, isExactVinRuleConflict, isValidCatalogVinRule, vinRuleKey } from '@/features/garage/add/lib/catalogVinRules';
import { catalogReviewVersion } from '@/features/catalog/lib/catalogVehicleSelection';
import { normalizeVin, VIN_LENGTH } from '@/features/garage/add/lib/config/vin';
import { getCarReviewSpecs, isCurrentCatalogReview, queueCarCatalogReview, recordCatalogReviewHandled, removeCarFromOtherReviews } from './carCatalogReview';
import { storage } from './storage';
import type { CatalogModification, CatalogVinRule, InboxItem, StoredMasterModel, VinTrainingDraft } from './types';
import { normalizeSlug } from './utils';
import { buildVinTrainingDraft, getApplicableVinTrainingRules, getVinTrainingModificationName, vinTrainingInput, type VinTrainingInput } from './vinTrainingDraft';

function mergeVinRules(rules: CatalogVinRule[]) {
    const unique = new Map<string, CatalogVinRule>();
    for (const rule of rules) {
        if (!isValidCatalogVinRule(rule)) continue;
        const key = vinRuleKey(rule);
        const existing = unique.get(key);
        unique.set(key, existing ? {
            ...rule,
            modelYear: rule.modelYear ?? existing.modelYear,
            source: rule.modelYear === undefined && existing.modelYear !== undefined
                ? existing.source
                : rule.source ?? existing.source,
        } : rule);
    }
    return [...unique.values()];
}

export function submitVinTraining(text: string) {
    return submitVinTrainingWithReport(text).created;
}

export function submitVinTrainingWithReport(text: string) {
    let input: unknown;
    try {
        input = JSON.parse(text);
    } catch {
        throw new Error('Не удалось прочитать JSON. Сверьте данные с примером.');
    }

    const parsed = z.array(vinTrainingInput).min(1, 'Добавьте хотя бы одну запись.')
        .safeParse(Array.isArray(input) ? input : [input]);
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        const [row, ...field] = issue.path;
        throw new Error(typeof row === 'number'
            ? `Запись ${row + 1}${field.length ? ` (${field.join('.')})` : ''}. ${issue.message}`
            : issue.message);
    }

    const state = storage.getState();
    const pending = parsed.data.map((row): InboxItem => ({
        id: `inbox_vin_${crypto.randomUUID()}`,
        type: 'car_model',
        carBrand: row.brand,
        carModel: row.model,
        carYear: row.year,
        vinTraining: buildVinTrainingDraft(row),
    }));

    const draftKey = (item: InboxItem) => JSON.stringify([
        normalizeSlug(item.carBrand), normalizeSlug(item.carModel),
        item.vinTraining && getVinTrainingModificationName(item.vinTraining),
        Object.entries(item.vinTraining?.attributes ?? {}).filter(([, value]) => value !== undefined)
            .sort(([left], [right]) => left.localeCompare(right)),
        item.vinTraining?.vinRules.map(rule => JSON.stringify([vinRuleKey(rule), rule.modelYear])).sort(),
        uniqueFrameRules(item.vinTraining?.frameRules ?? []).map(frameRuleKey).sort(),
    ]);
    const queued = new Set(state.inbox.filter(item => item.vinTraining).map(draftKey));
    let catalogDuplicates = 0;
    let queuedDuplicates = 0;
    const newItems = pending.filter(item => {
        if (findVinTrainingDuplicate(item, state.masterModels)) {
            catalogDuplicates += 1;
            return false;
        }
        const key = draftKey(item);
        if (queued.has(key)) {
            queuedDuplicates += 1;
            return false;
        }
        queued.add(key);
        return true;
    });

    if (newItems.length) storage.saveState({ ...state, inbox: [...newItems, ...state.inbox] });
    return { created: newItems.length, catalogDuplicates, queuedDuplicates };
}

function findModel(item: Pick<InboxItem, 'carBrand' | 'carModel'>, models: StoredMasterModel[]) {
    return models.find(model =>
        model.brandSlug === normalizeSlug(item.carBrand) &&
        model.modelSlug === normalizeSlug(item.carModel)
    );
}

const comparedIdentityFields = (Object.keys(modificationFields) as (keyof typeof modificationFields)[])
    .filter(field => field !== 'facelift');

function yearRangeLabel(start: string, end: string): string {
    return start && end && start !== end ? `${start}–${end}` : start;
}

export function getVinTrainingComparisons(item: InboxItem, models: StoredMasterModel[]) {
    const draft = item.vinTraining;
    if (!draft) return [];

    const { year, yearEnd, bodyCode } = draft.attributes;
    const values = modificationValues(draft);
    if (!normalizeCode(bodyCode)) return [];
    const enteredName = getVinTrainingModificationName(draft);
    const vinOwners = new Set(getVinRuleConflicts(getApplicableVinTrainingRules(item.carBrand, item.carModel, draft.vinRules), models)
        .map(conflict => conflict.modification));
    const normalizeName = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();
    const transmissionMatchesType = (entered: string, stored: string) =>
        ['Автомат', 'Механика', 'Робот'].some(type =>
            (entered === type && stored.startsWith(type + ' (')) ||
            (stored === type && entered.startsWith(type + ' ('))
        );

    return models.filter(model => model.brandSlug === normalizeSlug(item.carBrand)).flatMap(model =>
        (model.modifications ?? []).flatMap(modification => {
            const catalogBodyCode = modification.attributes.bodyCode?.trim() ?? '';
            const catalogYear = modification.attributes.year?.trim() ?? '';
            const catalogYearEnd = modification.attributes.yearEnd?.trim() || catalogYear;
            const sameBody = normalizeCode(bodyCode) === normalizeCode(catalogBodyCode);
            const coversYears = Number(catalogYear) > 0 &&
                Number(catalogYear) <= Number(year) && Number(catalogYearEnd) >= Number(yearEnd);
            if (!sameBody && !vinOwners.has(modification)) return [];
            const sameModel = model.modelSlug === normalizeSlug(item.carModel);
            const sameName = normalizeName(enteredName) === normalizeName(modification.name);

            const enteredFacelift = normalizeFacelift(draft.attributes.facelift);
            const storedFacelift = normalizeFacelift(modification.attributes.facelift);
            const fields = [
                { field: 'model', entered: item.carModel, stored: model.modelName, matches: sameModel, compatible: sameModel },
                { field: 'name', entered: enteredName, stored: modification.name, matches: sameName, compatible: sameName },
                { field: 'bodyCode', entered: bodyCode, stored: catalogBodyCode, matches: sameBody, compatible: sameBody },
                { field: 'years', entered: yearRangeLabel(year, yearEnd),
                    stored: yearRangeLabel(catalogYear, catalogYearEnd), matches: year === catalogYear && yearEnd === catalogYearEnd, compatible: coversYears },
                ...(enteredFacelift === 'unknown' && storedFacelift === 'unknown' ? [] : [{
                    field: 'facelift',
                    entered: formatFacelift(enteredFacelift),
                    stored: formatFacelift(storedFacelift),
                    matches: enteredFacelift === storedFacelift,
                    compatible: matchesFacelift(enteredFacelift, storedFacelift),
                }]),
                ...comparedIdentityFields.flatMap(field => {
                    const entered = values[field].trim();
                    if (!entered) return [];
                    const rawValue = modification.attributes[modificationFields[field]];
                    const stored = field === 'transmission' ? formatTransmission(rawValue) : rawValue?.trim() ?? '';
                    const matches = matchesModificationField(field, entered, stored);
                    return [{
                        field: modificationFields[field],
                        entered,
                        stored,
                        matches,
                        compatible: matches || !stored || (field === 'transmission' && transmissionMatchesType(entered, stored)),
                    }];
                }),
            ];
            return [{ model, modification, exact: fields.every(field => field.matches), compatible: fields.every(field => field.compatible), fields }];
        }));
}

export function findVinTrainingDuplicate(item: InboxItem, models: StoredMasterModel[]) {
    const draft = item.vinTraining;
    if (!draft) return undefined;

    const vinRules = getApplicableVinTrainingRules(item.carBrand, item.carModel, draft.vinRules);
    const frameKeys = uniqueFrameRules(draft.frameRules ?? []).map(frameRuleKey);
    return getVinTrainingComparisons(item, models).find(({ exact, model, modification }) => {
        if (!exact || !model.verified) return false;
        const existingFrame = new Set(uniqueFrameRules(modification.frameRules ?? []).map(frameRuleKey));
        return frameKeys.every(key => existingFrame.has(key)) && vinRules.every(rule =>
            modification.vinRules?.some(stored => isValidCatalogVinRule(stored) && vinRuleKey(stored) === vinRuleKey(rule) &&
                (rule.modelYear == null || rule.modelYear === stored.modelYear) && (!rule.source || rule.source === stored.source))
        );
    });
}

export function skipDuplicateVinTraining(id: string, input: VinTrainingInput): void {
    const state = storage.getState();
    const ticket = state.inbox.find(item => item.id === id);
    if (!ticket?.vinTraining || ticket.garageCarVersions) throw new Error('Заявку нужно проверить перед закрытием.');
    const data = vinTrainingInput.parse(input);
    const item = { ...ticket, carBrand: data.brand, carModel: data.model, vinTraining: buildVinTrainingDraft(data) };
    if (!findVinTrainingDuplicate(item, state.masterModels)) throw new Error('Полный дубль больше не найден. Сверьте заявку с каталогом.');
    storage.saveState({ ...state, inbox: state.inbox.filter(item => item.id !== id) });
}

export function getVinTrainingTargets(comparisons: ReturnType<typeof getVinTrainingComparisons>) {
    const exact = comparisons.filter(candidate => candidate.exact);
    return {
        exact,
        available: exact.length ? exact : comparisons,
    };
}

export type CatalogReviewAction = 'update' | 'replace' | 'separate';

export function isBlockingVinTrainingConflict(
    conflict: ReturnType<typeof getVinRuleConflicts>[number],
    item: Pick<InboxItem, 'carBrand' | 'carModel' | 'vinTraining'> | undefined,
    action?: CatalogReviewAction,
): boolean {
    if (!isExactVinRuleConflict(conflict)) return false;
    const incoming = item?.vinTraining?.attributes;
    const stored = conflict.modification.attributes;
    if (action !== 'separate' || !item || !incoming ||
        conflict.model.brandSlug !== normalizeSlug(item.carBrand) ||
        conflict.model.modelSlug !== normalizeSlug(item.carModel) ||
        !normalizeCode(incoming.bodyCode) || normalizeCode(incoming.bodyCode) !== normalizeCode(stored.bodyCode)) return true;

    const incomingVersion = knownFacelift(incoming.facelift);
    const storedVersion = knownFacelift(stored.facelift);
    const differentVersions = incomingVersion && storedVersion && !matchesFacelift(incomingVersion, storedVersion);
    const storedYear = stored.year?.trim();
    const differentYears = storedYear && /^\d{4}$/.test(storedYear) &&
        (incoming.year !== storedYear || incoming.yearEnd !== (stored.yearEnd?.trim() || storedYear));
    return !differentVersions && !differentYears;
}

export function planVinTrainingCatalog(
    item: Pick<InboxItem, 'carBrand' | 'carModel'>,
    draft: VinTrainingDraft,
    models: StoredMasterModel[],
    target: CatalogModification | undefined,
    newModificationId: string,
    action?: CatalogReviewAction,
) {
    const existingModel = target
        ? models.find(model => model.modifications?.includes(target))
        : findModel(item, models);
    if (target && !existingModel) throw new Error('Выбранная модификация больше не найдена.');
    const vinRules = getApplicableVinTrainingRules(item.carBrand, item.carModel, draft.vinRules);
    const facelift = knownFacelift(draft.attributes.facelift);
    const incoming = Object.entries(draft.attributes).filter(([, value]) => value?.trim());
    const changes = target && action ? Object.fromEntries(incoming.filter(([key]) =>
        action === 'replace' || (key === 'facelift' ? !knownFacelift(target.attributes.facelift) : !target.attributes[key]?.trim())
    )) : {};
    const modification: CatalogModification = target
        ? {
            ...target,
            name: action === 'replace' ? getVinTrainingModificationName(draft) : target.name,
            attributes: action ? { ...target.attributes, ...changes }
                : !knownFacelift(target.attributes.facelift) && facelift ? { ...target.attributes, facelift } : target.attributes,
            vinRules: mergeVinRules([...(target.vinRules ?? []), ...vinRules]),
            ...(draft.frameRules?.length && {
                frameRules: uniqueFrameRules([...(target.frameRules ?? []), ...draft.frameRules]),
            }),
        }
        : {
            id: newModificationId,
            name: getVinTrainingModificationName(draft),
            attributes: draft.attributes,
            vinRules,
            frameRules: draft.frameRules,
            registeredCount: 0,
        };

    const model: StoredMasterModel = {
        brandSlug: normalizeSlug(item.carBrand),
        brandName: item.carBrand,
        modelSlug: normalizeSlug(item.carModel),
        modelName: item.carModel,
        years: draft.attributes.year === draft.attributes.yearEnd
            ? draft.attributes.year
            : `${draft.attributes.year}–${draft.attributes.yearEnd}`,
        registeredCount: 0,
        ...existingModel,
        verified: true,
        modifications: target
            ? (existingModel?.modifications ?? []).map(candidate => candidate.id === target.id ? modification : candidate)
            : [...(existingModel?.modifications ?? []), modification],
    };

    const masterModels = existingModel
        ? models.map(candidate => candidate === existingModel ? model : candidate)
        : [...models, model];
    return { modification, model, masterModels };
}

export function approveVinTraining(id: string, input: VinTrainingInput, modificationId?: string, action?: CatalogReviewAction) {
    const state = storage.getState();
    const ticket = state.inbox.find(ticket => ticket.id === id);
    if (!ticket?.vinTraining) throw new Error('Заявка уже обработана или удалена.');

    const data = vinTrainingInput.parse(input);
    const draft = buildVinTrainingDraft(data);
    const item = { ...ticket, carBrand: data.brand, carModel: data.model, vinTraining: draft };

    const comparisons = getVinTrainingComparisons(item, state.masterModels);
    const targets = getVinTrainingTargets(comparisons);
    const selected = targets.available.find(candidate => candidate.modification.id === modificationId);
    const target = selected?.modification;
    if ((modificationId && !target) || (!target && targets.exact.length)) {
        throw new Error('Выберите одну из подходящих модификаций.');
    }
    if ((target && action === 'separate') || (!target && action && action !== 'separate') ||
        (selected && !selected.exact && !action) || (!target && comparisons.length && action !== 'separate')) {
        throw new Error('Выберите действие для совпавшего кода кузова.');
    }

    const vinRules = getApplicableVinTrainingRules(data.brand, data.model, draft.vinRules);
    assertConsistentVinModelYears(vinRules, target?.vinRules);
    assertNoVinRuleConflicts(vinRules, state.masterModels, target, conflict => isBlockingVinTrainingConflict(conflict, item, action));

    const existingModel = selected?.model ?? findModel(item, state.masterModels);
    const originalCars = getGarageCars();
    const ticketVin = normalizeVin(ticket.carVin ?? '');
    const ticketFrame = normalizeFrameNumber(ticket.carSpecs?.frameNumber ?? '');
    const reviewedCar = (ticketVin || ticketFrame) && ticket.garageCarVersions
        ? originalCars.find(car => (!ticketVin || normalizeVin(car.vin) === ticketVin) &&
            (!ticketFrame || normalizeFrameNumber(car.frameNumber ?? '') === ticketFrame) &&
            isCurrentCatalogReview(ticket, car))
        : undefined;
    if ((ticketVin || ticketFrame) && ticket.garageCarVersions && !reviewedCar) {
        throw new Error('Автомобиль из заявки больше не найден или его данные изменились.');
    }

    if (reviewedCar && ticketFrame && findCatalogFrameMatches(ticketFrame, state.masterModels)
        .some(match => match.specificity === EXACT_FRAME_SPECIFICITY && match.modification !== target)) {
        throw new Error('Этот номер кузова уже подтверждён для другой модификации. Перепроверьте заявку.');
    }

    const coversTicketVin = vinRules.some(rule => catalogVinRuleMatches(rule, ticketVin));
    if (reviewedCar && coversTicketVin && findCatalogVinMatches(ticketVin, state.masterModels)
        .some(match => (match.specificity ?? 0) > VIN_LENGTH &&
            (match.model !== existingModel || match.modification.id !== target?.id))) {
        throw new Error('Этот VIN уже сопоставляется с другой модификацией. Перепроверьте заявку.');
    }

    const { modification, model, masterModels } = planVinTrainingCatalog(
        item, draft, state.masterModels, target, `mod_${crypto.randomUUID()}`, action
    );
    const nextState = {
        ...state,
        inbox: state.inbox.filter(ticket => ticket.id !== id),
        masterModels,
    };

    const linkedIds: string[] = [];
    let updatedExistingCars = false;
    const updatedCars = originalCars.map(car => {
        if (target && action && car.catalogBrandSlug === model.brandSlug && car.catalogModelSlug === model.modelSlug &&
            car.catalogModificationId === target.id) {
            const updated = { ...car, ...modificationValues(modification, car.facelift), modificationName: modification.name };
            if (car.catalogYearApproval === carCatalogYearApprovalVersion(car)) {
                updated.catalogYearApproval = carCatalogYearApprovalVersion(updated);
            }
            if (!resolveCarCatalogIdentity(updated, masterModels)) {
                throw new Error('Изменение нарушит привязку автомобиля из гаража. Сохраните заявку отдельной модификацией.');
            }
            updatedExistingCars = true;
            return { ...updated, updatedAt: new Date().toISOString() };
        }
        if (normalizeSlug(car.make) !== model.brandSlug || normalizeSlug(car.model) !== model.modelSlug ||
            resolveCarCatalogIdentity(car, state.masterModels) ||
            !matchesKnownModificationFields(car, modification)) return car;

        const vinMatches = findCatalogVinMatches(car.vin, nextState.masterModels);
        const confirmedVin = vinMatches.filter(match => (match.specificity ?? 0) >= VIN_LENGTH);
        // Broader suggestions are still shown in the garage, but cannot train or link a car automatically.
        const matches = car === reviewedCar && confirmedVin.length ? confirmedVin
            : !vinMatches.length && car.frameNumber
                ? findCatalogFrameMatches(car.frameNumber, nextState.masterModels).filter(match => match.specificity === EXACT_FRAME_SPECIFICITY)
                : vinMatches;
        const [match] = matches;
        if (matches.length !== 1 || match.model !== model || match.modification !== modification ||
            !matchesVehicleDetails(modification, String(car.year), car.bodyCode ?? '', { modelYear: match.modelYear })) return car;

        linkedIds.push(car.id);
        return {
            ...car,
            ...modificationValues(modification, car.facelift),
            make: model.brandName,
            model: model.modelName,
            bodyCode: car.bodyCode || modification.attributes.bodyCode,
            catalogBrandSlug: model.brandSlug,
            catalogModelSlug: model.modelSlug,
            catalogModificationId: modification.id,
            catalogYearApproval: undefined,
            modificationName: modification.name,
            updatedAt: new Date().toISOString(),
        };
    });

    if (reviewedCar && (linkedIds.includes(reviewedCar.id) || resolveCarCatalogIdentity(reviewedCar, masterModels))) {
        recordCatalogReviewHandled(nextState, ticket, originalCars);
    }
    for (const car of updatedCars) {
        if (!linkedIds.includes(car.id)) continue;
        nextState.reviewedCatalogVersions = { ...nextState.reviewedCatalogVersions, [car.id]: catalogReviewVersion(car) };
        removeCarFromOtherReviews(nextState, car.id);
    }
    if (linkedIds.length || updatedExistingCars) saveGarageCars(updatedCars);
    try {
        if (reviewedCar && !linkedIds.includes(reviewedCar.id) && !resolveCarCatalogIdentity(reviewedCar, masterModels)) {
            queueCarCatalogReview(nextState, {
                garageCarId: reviewedCar.id,
                userId: state.cars.find(car => car.id === reviewedCar.id)?.userId,
                brand: reviewedCar.make,
                model: reviewedCar.model,
                year: reviewedCar.year,
                engine: reviewedCar.engine ?? '',
                carSpecs: getCarReviewSpecs(reviewedCar),
            });
        }
        storage.saveState(nextState);
    } catch (error) {
        if (linkedIds.length || updatedExistingCars) saveGarageCars(originalCars);
        throw error;
    }
    return linkedIds.length;
}
