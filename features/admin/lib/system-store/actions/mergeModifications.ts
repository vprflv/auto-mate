import {
    carCatalogYearApprovalVersion,
    carReviewVersion,
    matchesModificationField,
    modificationFields,
    modificationValues,
    normalizeCode,
    resolveCarCatalogIdentity,
} from '@/features/catalog/lib/carCatalogIdentity';
import { catalogReviewVersion, getCatalogChoiceDifferences, resolveCatalogPreference } from '@/features/catalog/lib/catalogVehicleSelection';
import { normalizeFacelift } from '@/features/catalog/lib/facelift';
import { uniqueInstallations } from '@/features/catalog/lib/partInstallations';
import { uniqueFrameRules } from '@/features/garage/add/lib/catalogFrameRules';
import { getGarageCars, saveGarageCars } from '@/features/garage/add/lib/storage';
import {
    assertConsistentVinModelYears,
    assertNoVinRuleConflicts,
    hasCatalogVinException,
    isValidCatalogVinRule,
    vinRuleKey,
} from '@/features/garage/add/lib/catalogVinRules';
import { isValidVin, normalizeVin } from '@/features/garage/add/lib/config/vin';
import { formatTransmission } from '@/features/garage/add/lib/config/robotTransmission';
import { getCarReviewSpecs } from '../carCatalogReview';
import { storage } from '../storage';
import type { CatalogModification, StoredCatalogNode, StoredPartItem } from '../types';
import { normalizeSlug } from '../utils';

type MergeInput = { brandSlug: string; modelSlug: string; sourceId: string; targetId: string };

const identityFields = Object.entries(modificationFields) as [
    keyof typeof modificationFields, string,
][];

function changesBetween(first: string, second: string, key: string): boolean {
    if (key === 'transmission') return formatTransmission(first).toLowerCase() !== formatTransmission(second).toLowerCase();
    if (key === 'bodyCode') return normalizeCode(first) !== normalizeCode(second);
    if (key === 'facelift') return normalizeFacelift(first) !== normalizeFacelift(second);
    const identityField = identityFields.find(([, attribute]) => attribute === key)?.[0];
    if (identityField) return !matchesModificationField(identityField, first, second);
    return first.trim().toLowerCase() !== second.trim().toLowerCase();
}

function mergeAttributes(source: CatalogModification, target: CatalogModification) {
    const attributes = { ...target.attributes };
    for (const [key, value] of Object.entries(source.attributes ?? {})) {
        if (!value?.trim() || (key === 'facelift' && normalizeFacelift(value) === 'unknown')) continue;
        const existing = attributes[key];
        if (!existing?.trim() || (key === 'facelift' && normalizeFacelift(existing) === 'unknown')) {
            Object.defineProperty(attributes, key, { value, enumerable: true, writable: true, configurable: true });
        } else if (changesBetween(existing, value, key)) {
            throw new Error(`Характеристика «${key === 'transmission' ? 'КПП' : key}» различается: «${existing}» и «${value}». Сверьте карточки перед объединением.`);
        }
    }
    if (attributes.year && attributes.yearEnd && Number(attributes.yearEnd) < Number(attributes.year)) {
        throw new Error('Сверьте годы выпуска. После объединения год окончания оказался раньше года начала.');
    }
    if (attributes.transmission) attributes.transmission = formatTransmission(attributes.transmission);
    return attributes;
}

function mergeCapacities<T extends Record<string, number>>(
    source: T | undefined,
    target: T | undefined,
    label: string,
): T | undefined {
    if (!source) return target;
    for (const [key, liters] of Object.entries(source)) {
        if (target?.[key] !== undefined && target[key] !== liters) {
            throw new Error(`Заправочные объёмы различаются (${label}): ${target[key]} и ${liters} л. Сверьте значения перед объединением.`);
        }
    }
    return { ...source, ...target };
}

function moveId(ids: string[] | undefined, { sourceId, targetId }: MergeInput) {
    if (!ids?.includes(sourceId)) return ids;
    return [...new Set(ids.map(id => id === sourceId ? targetId : id))];
}

function moveValue<T>(
    values: Record<string, T> | undefined,
    { sourceId, targetId }: MergeInput,
    merge: (source: T, target: T | undefined) => T,
) {
    if (!values || !Object.hasOwn(values, sourceId)) return values;
    const result = { ...values, [targetId]: merge(values[sourceId], values[targetId]) };
    delete result[sourceId];
    return result;
}

function movePart(part: StoredPartItem, input: MergeInput) {
    const compatibleModifications = moveId(part.compatibleModifications, input);
    const compatibilityScoresByModification = moveValue(part.compatibilityScoresByModification, input,
        (source, target) => target ?? source);
    const installationsByModification = moveValue(part.installationsByModification, input,
        (source, target) => uniqueInstallations([...(target ?? []), ...source]));
    if (compatibleModifications === part.compatibleModifications &&
        compatibilityScoresByModification === part.compatibilityScoresByModification &&
        installationsByModification === part.installationsByModification) return part;

    return {
        ...part,
        compatibleModifications: compatibleModifications?.includes('all') ? ['all'] : compatibleModifications,
        compatibilityScoresByModification,
        installationsByModification,
    };
}

function buildModificationMerge(input: MergeInput) {
    const state = storage.getState();
    const model = state.masterModels.find(item => item.brandSlug === input.brandSlug && item.modelSlug === input.modelSlug);
    const source = model?.modifications?.find(item => item.id === input.sourceId);
    const target = model?.modifications?.find(item => item.id === input.targetId);
    if (!model || !source || !target || source === target) throw new Error('Выберите две разные модификации одной модели.');

    const attributes = mergeAttributes(source, target);
    const modelsWithoutSource = state.masterModels.map(item => item === model
        ? { ...item, modifications: item.modifications.filter(mod => mod !== source) } : item);
    assertNoVinRuleConflicts(source.vinRules ?? [], modelsWithoutSource, target);

    const existingMasks = new Set((target.vinRules ?? []).filter(isValidCatalogVinRule).map(vinRuleKey));
    const sourceAndTargetRules = [...(target.vinRules ?? []), ...(source.vinRules ?? [])];
    const vinRules = new Map<string, NonNullable<CatalogModification['vinRules']>[number]>();
    for (const rule of sourceAndTargetRules) {
        if (!isValidCatalogVinRule(rule)) throw new Error('В одной из карточек есть некорректное VIN-правило. Исправьте его перед объединением.');
        const key = vinRuleKey(rule);
        const existing = vinRules.get(key);
        vinRules.set(key, existing ? {
            ...existing,
            modelYear: existing.modelYear ?? rule.modelYear,
            source: existing.modelYear === undefined && rule.modelYear !== undefined
                ? rule.source
                : existing.source ?? rule.source,
        } : rule);
    }
    assertConsistentVinModelYears(sourceAndTargetRules);

    const targetExceptions = new Set((target.vinExceptions ?? []).map(normalizeVin));
    const sourceExceptions = (source.vinExceptions ?? []).map(normalizeVin);
    if (sourceExceptions.some(vin => !isValidVin(vin))) throw new Error('Исправьте некорректное VIN-исключение в дубликате.');
    for (const vin of sourceExceptions) {
        if (modelsWithoutSource.some(item => item.modifications?.some(mod =>
            mod !== target && hasCatalogVinException(mod, vin)
        ))) throw new Error(`VIN ${vin} уже сохранён как исключение в другой модификации.`);
    }

    const kept: CatalogModification = {
        ...target,
        attributes,
        vinRules: [...vinRules.values()],
        vinExceptions: [...new Set([...targetExceptions, ...sourceExceptions])],
        frameRules: uniqueFrameRules([...(target.frameRules ?? []), ...(source.frameRules ?? [])]),
        fluidFillCapacities: mergeCapacities(source.fluidFillCapacities, target.fluidFillCapacities, 'карточки модификаций'),
    };
    const masterModels = modelsWithoutSource.map(item => item.brandSlug === model.brandSlug && item.modelSlug === model.modelSlug
        ? { ...item, modifications: item.modifications.map(mod => mod === target ? kept : mod) } : item);

    const parts: { node: StoredCatalogNode; part: StoredPartItem }[] = [];
    const branches: StoredCatalogNode[] = [];
    const catalogNodes = state.catalogNodes.map(node => {
        if (node.brandSlug !== model.brandSlug || node.modelSlug !== model.modelSlug) return node;

        const allowedModificationIds = moveId(node.allowedModificationIds, input);
        const fillCapacitiesByModification = moveValue(node.fillCapacitiesByModification, input, (from, to) => {
            if (to !== undefined && from !== to) throw new Error(`В ветке «${node.title}» разные заправочные объёмы: ${to} и ${from} л.`);
            return to ?? from;
        });
        const compatibleModifications = moveId(node.compatibleModifications, input);
        const branchChanged = allowedModificationIds !== node.allowedModificationIds ||
            fillCapacitiesByModification !== node.fillCapacitiesByModification ||
            compatibleModifications !== node.compatibleModifications;
        if (branchChanged) branches.push(node);

        const items = node.items.map(part => {
            const updated = movePart(part, input);
            if (updated !== part) parts.push({ node, part });
            return updated;
        });
        if (!branchChanged && items.every((part, index) => part === node.items[index])) return node;

        return { ...node, items, allowedModificationIds, fillCapacitiesByModification,
            compatibleModifications: compatibleModifications?.includes('all') ? ['all'] : compatibleModifications ?? [] };
    });

    const originalCars = getGarageCars();
    const updatedById = new Map<string, (typeof originalCars)[number]>();
    const cars = originalCars.map(car => {
        const preference = car.catalogPreference;
        const movePreference = preference?.brandSlug === model.brandSlug && preference.modelSlug === model.modelSlug &&
            preference.modificationId === source.id;
        const catalogPreference = movePreference ? { ...preference, modificationId: kept.id } : preference;
        if (car.catalogBrandSlug !== model.brandSlug || car.catalogModelSlug !== model.modelSlug ||
            (car.catalogModificationId !== source.id && car.catalogModificationId !== target.id)) {
            if (!movePreference) return car;
            const updated = { ...car, catalogPreference };
            updatedById.set(car.id, updated);
            return updated;
        }

        if (!resolveCarCatalogIdentity(car, state.masterModels)) {
            throw new Error(`В гараже есть автомобиль с устаревшей привязкой (${car.make} ${car.model}, ${car.year}). Сверьте его данные.`);
        }
        const updated = {
            ...car,
            ...modificationValues(kept, car.facelift),
            catalogModificationId: kept.id,
            catalogPreference,
            modificationName: kept.name,
            catalogYearApproval: undefined as string | undefined,
        };
        if (car.catalogYearApproval === carCatalogYearApprovalVersion(car)) {
            updated.catalogYearApproval = carCatalogYearApprovalVersion(updated);
        }
        if (!resolveCarCatalogIdentity(updated, masterModels)) {
            throw new Error(`Основная модификация не подходит привязанному автомобилю (${car.make} ${car.model}, ${car.year}).`);
        }
        updatedById.set(car.id, updated);
        return updated;
    });

    const affectedInbox = state.inbox.filter(item =>
        Object.keys(item.garageCarVersions ?? {}).some(id => updatedById.has(id)) ||
        (normalizeSlug(item.carBrand) === model.brandSlug && normalizeSlug(item.carModel) === model.modelSlug &&
            (item.catalogModificationId === source.id || item.proposedModificationId === source.id ||
                [source.id, target.id].includes(item.vinMismatch?.selectedModificationId ?? '')))
    );
    const inbox = state.inbox.map(item => {
        if (!affectedInbox.includes(item)) return item;
        const garageCarVersions = item.garageCarVersions && Object.fromEntries(
            Object.entries(item.garageCarVersions).map(([id, version]) => {
                const before = originalCars.find(car => car.id === id);
                const after = updatedById.get(id);
                return [id, before && after && (version === catalogReviewVersion(before) || version === carReviewVersion(before) || version === carReviewVersion(before, true))
                    ? catalogReviewVersion(after) : version];
            })
        );
        const car = Object.keys(garageCarVersions ?? {}).map(id => updatedById.get(id)).find(Boolean);
        const choice = item.catalogCheck && car && (resolveCatalogPreference(car.catalogPreference, masterModels) ?? resolveCarCatalogIdentity(car, masterModels));
        const catalogCheck = car && choice ? {
            name: [choice.model.brandName, choice.model.modelName, choice.modification.name].join(' · '),
            differences: getCatalogChoiceDifferences(car, choice, masterModels),
        } : item.catalogCheck;
        const mismatch = item.vinMismatch;
        const selectedWasMerged = mismatch && (
            mismatch.selectedModificationId === source.id || mismatch.selectedModificationId === target.id ||
            (!mismatch.selectedModificationId && mismatch.catalogOpen && Object.keys(garageCarVersions ?? {}).some(id => updatedById.has(id))
                && (mismatch.selected.name === source.name || mismatch.selected.name === target.name))
        );
        return {
            ...item,
            garageCarVersions,
            catalogCheck,
            catalogModificationId: item.catalogModificationId === source.id ? target.id : item.catalogModificationId,
            proposedModificationId: item.proposedModificationId === source.id ? target.id : item.proposedModificationId,
            vinMismatch: selectedWasMerged ? {
                ...mismatch,
                selectedModificationId: kept.id,
                selected: { name: kept.name, transmission: kept.attributes.transmission },
            } : mismatch,
        };
    });
    const registeredCars = state.cars.map(entry => {
        const car = updatedById.get(entry.id);
        return car ? {
            ...entry,
            engine: car.engine || entry.engine,
            transmission: car.transmission,
            drivetrain: car.driveType,
            carSpecs: { ...entry.carSpecs, ...getCarReviewSpecs(car) },
        } : entry;
    });

    const linkedCars = originalCars.filter(car => car.catalogModificationId === source.id && updatedById.has(car.id));
    const changedCars = originalCars.filter(car => updatedById.has(car.id));
    const revision = JSON.stringify([
        source, target, branches, parts.map(({ node, part }) => [node.id, part]),
        changedCars.map(car => [car.id, carReviewVersion(car), car.catalogYearApproval, car.vin, car.updatedAt]), affectedInbox,
    ]);
    return {
        preview: {
            revision, target: kept, parts, branches, cars: linkedCars, applications: affectedInbox.length,
            addedVinRules: [...vinRules.keys()].filter(mask => !existingMasks.has(mask)),
            addedVinExceptions: [...new Set(sourceExceptions.filter(vin => !targetExceptions.has(vin)))],
        },
        state: { ...state, masterModels, catalogNodes, inbox, cars: registeredCars },
        originalCars,
        cars,
        changedCars,
    };
}

export function previewModificationMerge(input: MergeInput) {
    return buildModificationMerge(input).preview;
}

export function mergeCatalogModifications(input: MergeInput, revision: string) {
    const plan = buildModificationMerge(input);
    if (plan.preview.revision !== revision) throw new Error('Данные изменились. Откройте предпросмотр ещё раз.');
    const garageChanged = plan.changedCars.length > 0;
    if (garageChanged) saveGarageCars(plan.cars);
    try {
        storage.saveState(plan.state);
    } catch (error) {
        if (garageChanged) saveGarageCars(plan.originalCars);
        throw error;
    }
}
