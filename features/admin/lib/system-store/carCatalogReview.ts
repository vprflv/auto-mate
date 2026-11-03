import type {
    CarSpecs,
    InboxItem,
    SystemState,
} from './types';
import { storage } from './storage';
import { getGarageCars } from '@/features/garage/add/lib/storage';
import { carReviewVersion, resolveCarCatalogIdentity } from '@/features/catalog/lib/carCatalogIdentity';
import { normalizeSlug } from './utils';
import {CarVariant, isSameCarVariant} from "@/features/admin/lib/carVariant";


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

    if (
        garageCar &&
        resolveCarCatalogIdentity(garageCar, state.masterModels)
    ) {
        let changed = false;

        // Если раньше машина ожидала проверки,
        // а теперь выбрана готовая модификация,
        // убираем её из старой заявки.
        state.inbox = state.inbox.filter(ticket => {
            if (
                ticket.type !== 'car_model' ||
                !ticket.garageCarVersions ||
                !Object.prototype.hasOwnProperty.call(
                    ticket.garageCarVersions,
                    garageCar.id
                )
            ) {
                return true;
            }

            const remainingVersions = {
                ...ticket.garageCarVersions,
            };

            delete remainingVersions[garageCar.id];
            changed = true;

            // В общей заявке могут ожидать другие машины.
            if (Object.keys(remainingVersions).length > 0) {
                ticket.garageCarVersions = remainingVersions;
                return true;
            }

            return false;
        });

        // true означает, что изменения очереди нужно сохранить.
        // Новую заявку здесь не создаём.
        return changed;
    }

    const garageCarVersions = garageCar
        ? { [garageCar.id]: carReviewVersion(garageCar) }
        : {};

    const alreadyInInbox = state.inbox.find(
        item =>
            item.type === 'car_model' &&
            normalizeSlug(item.carBrand) === brandSlug &&
            normalizeSlug(item.carModel) === modelSlug &&
            isSameCarVariant(
                variant,
                getTicketVariant(item)
            )
    );

    if (alreadyInInbox) {
        const before = JSON.stringify(alreadyInInbox.garageCarVersions ?? {});
        alreadyInInbox.garageCarVersions = {
            ...alreadyInInbox.garageCarVersions,
            ...garageCarVersions,
        };
        return before !== JSON.stringify(alreadyInInbox.garageCarVersions);
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