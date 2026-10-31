import type {
    CarSpecs,
    InboxItem,
    SystemState,
} from './types';
import { storage } from './storage';
import { normalizeSlug } from './utils';
import {CarVariant, getModificationVariant, isSameCarVariant} from "@/features/admin/lib/carVariant";


export interface CarCatalogReviewInput {
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

    const knownVariant = masterModel?.modifications.some(
        modification =>
            isSameCarVariant(
                variant,
                getModificationVariant(modification)
            )
    ) ?? false;

    if (knownVariant) return false;

    const alreadyInInbox = state.inbox.some(
        item =>
            item.type === 'car_model' &&
            normalizeSlug(item.carBrand) === brandSlug &&
            normalizeSlug(item.carModel) === modelSlug &&
            isSameCarVariant(
                variant,
                getTicketVariant(item)
            )
    );

    if (alreadyInInbox) return false;

    const user = input.userId
        ? state.users.find(candidate => candidate.id === input.userId)
        : undefined;

    state.inbox.unshift({
        id: `inbox_car_${crypto.randomUUID()}`,
        type: 'car_model',
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