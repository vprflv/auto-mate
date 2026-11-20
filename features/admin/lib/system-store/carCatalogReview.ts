import type {
    CarSpecs,
    CatalogModification,
    InboxItem,
    SystemState,
} from './types';
import { storage } from './storage';
import { getGarageCars } from '@/features/garage/add/lib/storage';
import { carReviewVersion, normalizeCode, resolveCarCatalogIdentity } from '@/features/catalog/lib/carCatalogIdentity';
import { normalizeSlug } from './utils';
import {CarVariant, isSameCarVariant} from "@/features/admin/lib/carVariant";
import type { Car } from '@/types';

export function getCarReviewSpecs(car: Car): CarSpecs {
    return {
        vin: car.vin === 'UNKNOWN' ? undefined : car.vin,
        bodyCode: car.bodyCode,
        bodyClass: car.bodyClass,
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
    const warnings: string[] = [];
    const attributes = modification.attributes;
    const ticketCode = ticket.carSpecs?.bodyCode;
    const catalogCode = attributes?.bodyCode;
    const requestedCode = normalizeCode(ticketCode);
    const storedCode = normalizeCode(catalogCode);

    if (requestedCode && storedCode && requestedCode !== storedCode) {
        conflicts.push(`Код кузова в заявке — ${ticketCode}, у модификации — ${catalogCode}.`);
    } else if (!requestedCode || !storedCode) {
        warnings.push('Код кузова не указан в заявке или каталоге.');
    }

    const parseYear = (value?: string) =>
        value && /^[1-9]\d{3}$/.test(value.trim()) ? Number(value) : undefined;
    const year = ticket.carYear;
    const start = parseYear(attributes?.year);
    const end = parseYear(attributes?.yearEnd);

    if (year && start && year < start) {
        conflicts.push(`Год машины ${year} раньше начала выпуска модификации (${start}).`);
    }
    if (year && end && year > end) {
        conflicts.push(`Год машины ${year} позже окончания выпуска модификации (${end}).`);
    }
    if (!year || !start || (!end && year > start)) {
        warnings.push('Не хватает данных, чтобы полностью сверить годы выпуска.');
    }

    return { conflicts, warnings };
}

function removeCarFromOtherReviews(state: SystemState, carId: string, keepId?: string): boolean {
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
        trim: specs.trim,
    };

    const garageCar = input.garageCarId
        ? getGarageCars().find(car => car.id === input.garageCarId)
        : undefined;

    if (garageCar && resolveCarCatalogIdentity(garageCar, state.masterModels)) {
        return removeCarFromOtherReviews(state, garageCar.id);
    }

    const garageCarVersions = garageCar
        ? { [garageCar.id]: carReviewVersion(garageCar) }
        : {};

    const alreadyInInbox = state.inbox.find(
        item =>
            item.type === 'car_model' &&
            normalizeSlug(item.carBrand) === brandSlug &&
            normalizeSlug(item.carModel) === modelSlug &&
            matchesCarReviewBody(item, input.year, specs.bodyCode) &&
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
        note: masterModel
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
