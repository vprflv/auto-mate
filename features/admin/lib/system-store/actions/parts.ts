import type {
    InboxItem,
    StoredCatalogNode,
    StoredPartItem,
} from '../types';

import type {
    PartAxle,
    PartSide,
} from '@/types/partInstallation';

import { storage } from '../storage';
import { normalizeSlug, normalizeOem } from '../utils';

import {
    getGarageCars,
} from '@/features/garage/add/lib/storage';

import {
    resolveCarCatalogIdentity,
} from '@/features/catalog/lib/carCatalogIdentity';

import {
    expandInstallations,
    installationKey,
    normalizeInstallation,
} from '@/features/catalog/lib/partInstallations';

export interface AddUserPartParams {
    carId: string;
    carBrand?: string;
    carModel?: string;
    carYear?: number;
    carVin?: string;
    engine?: string;
    engineCode?: string;
    drivetrain?: string;
    transmission?: string;
    carSpecs?: Record<string, any>;

    partName: string;
    partBrand?: string;
    partArticle?: string;
    isOem?: boolean;

    itemType?: string;
    category?: string;
    subcategory?: string;

    axle?: PartAxle;
    side?: PartSide;

    quantity?: number;
    price?: number;
    mileage?: number;

    source?: 'user_manual' | 'user_service';
    note?: string;
}

type LegacyCatalogNode = StoredCatalogNode & {
    engineCompatibility?: string[];
    transmissionCompatibility?: string[];
    drivetrainCompatibility?: string[];
};

export function addUserPart(params: AddUserPartParams) {
    const rawName = (params.partName || '').trim();

    if (rawName.length < 2) return;

    const canonicalOem = normalizeOem(params.partArticle);
    const hasValidOem = canonicalOem.length >= 3;

    const state = storage.getState();

    const garageCar = getGarageCars().find(
        car => car.id === params.carId
    );

    const identity = garageCar
        ? resolveCarCatalogIdentity(
            garageCar,
            state.masterModels
        )
        : null;

    const modificationId = identity?.modification.id;

    const proposedInstallation = normalizeInstallation({
        axle: params.axle,
        side: params.side,
    });

    const hasInstallation = Boolean(
        proposedInstallation.axle ||
        proposedInstallation.side
    );

    const adminCar =
        state.cars.find(car => car.id === params.carId) ||
        state.cars.find(
            car => car.vin && car.vin === params.carId
        );

    const carBrand =
        params.carBrand ||
        adminCar?.brand ||
        'Неизвестная марка';

    const carModel =
        params.carModel ||
        adminCar?.model ||
        'Неизвестная модель';

    const brandSlug = normalizeSlug(carBrand);
    const modelSlug = normalizeSlug(carModel);

    const effectiveEngine = (
        params.engineCode ||
        params.engine ||
        adminCar?.engineCode ||
        adminCar?.engine ||
        ''
    ).trim().toUpperCase();

    const effectiveTransmission = (
        params.transmission ||
        params.carSpecs?.transmission ||
        adminCar?.transmission ||
        ''
    ).trim().toLowerCase();

    const effectiveDrivetrain = (
        params.drivetrain ||
        params.carSpecs?.drivetrain ||
        params.carSpecs?.driveType ||
        adminCar?.drivetrain ||
        ''
    ).trim().toLowerCase();

    const cleanBrand = (params.partBrand || '')
        .trim()
        .toLowerCase();

    const cleanName = rawName.toLowerCase();

    const checkSpecsMatch = (
        ticketTransmission: string,
        ticketDrivetrain: string
    ) => {
        if (
            effectiveTransmission &&
            ticketTransmission &&
            effectiveTransmission !== ticketTransmission
        ) {
            return false;
        }

        if (
            effectiveDrivetrain &&
            ticketDrivetrain &&
            effectiveDrivetrain !== ticketDrivetrain
        ) {
            return false;
        }

        return true;
    };

    const checkNodeMatch = (
        node: LegacyCatalogNode
    ): boolean => {
        if (
            normalizeSlug(node.brandSlug) !== brandSlug ||
            normalizeSlug(node.modelSlug) !== modelSlug
        ) {
            return false;
        }

        const engines = node.engineCompatibility || ['all'];

        const engineMatches =
            engines.includes('all') ||
            Boolean(
                effectiveEngine &&
                engines.some(
                    engine =>
                        engine.toUpperCase() === effectiveEngine
                )
            );

        if (!engineMatches) return false;

        const transmissions =
            node.transmissionCompatibility || ['all'];

        const transmissionMatches =
            transmissions.includes('all') ||
            Boolean(
                effectiveTransmission &&
                transmissions.some(
                    transmission =>
                        transmission.toLowerCase() ===
                        effectiveTransmission
                )
            );

        if (!transmissionMatches) return false;

        const drivetrains =
            node.drivetrainCompatibility || ['all'];

        const drivetrainMatches =
            drivetrains.includes('all') ||
            Boolean(
                effectiveDrivetrain &&
                drivetrains.some(
                    drivetrain =>
                        drivetrain.toLowerCase() ===
                        effectiveDrivetrain
                )
            );

        return drivetrainMatches;
    };

    const canCountExistingPart = (
        part: StoredPartItem
    ): boolean => {
        if (
            !modificationId ||
            part.isVerified !== true
        ) {
            return false;
        }

        const compatibleIds =
            part.compatibleModifications ?? [];

        if (
            !compatibleIds.includes('all') &&
            !compatibleIds.includes(modificationId)
        ) {
            return false;
        }

        if (!hasInstallation) return true;

        const confirmed = expandInstallations(
            part.installation
                ? [part.installation]
                : part.installationsByModification?.[modificationId] ?? []
        );

        const proposed = expandInstallations([
            proposedInstallation,
        ]);

        return proposed.every(position =>
            confirmed.some(
                known =>
                    installationKey(known) ===
                    installationKey(position)
            )
        );
    };

    // Уже подтверждённая деталь и её расположение.
    for (const node of state.catalogNodes) {
        if (!checkNodeMatch(node)) continue;

        const foundPart = node.items.find(part => {
            const sameBrand =
                (part.brand || '').trim().toLowerCase() ===
                cleanBrand;

            if (!sameBrand) return false;

            if (hasValidOem) {
                return (
                    normalizeOem(part.article) === canonicalOem
                );
            }

            return (
                part.name.trim().toLowerCase() === cleanName
            );
        });

        if (
            foundPart &&
            canCountExistingPart(foundPart)
        ) {
            foundPart.installationsCount =
                (foundPart.installationsCount || 0) + 1;

            storage.saveState(state);
            return;
        }
    }

    // Новое расположение не объединяем с другим
    // предложением по этой же детали.
    const inboxTicket = state.inbox.find(item => {
        if (item.type !== 'part') return false;

        if (
            normalizeSlug(item.carBrand) !== brandSlug ||
            normalizeSlug(item.carModel) !== modelSlug
        ) {
            return false;
        }

        if (
            item.catalogModificationId !== modificationId
        ) {
            return false;
        }

        if (
            (item.partBrand || '').trim().toLowerCase() !==
            cleanBrand
        ) {
            return false;
        }

        if (
            installationKey(item.proposedInstallation) !==
            installationKey(proposedInstallation)
        ) {
            return false;
        }

        if (hasValidOem) {
            if (
                normalizeOem(item.partArticle) !== canonicalOem
            ) {
                return false;
            }
        } else if (
            (item.partName || '').trim().toLowerCase() !==
            cleanName
        ) {
            return false;
        }

        const ticketEngine = (
            item.engineCode ||
            item.engine ||
            ''
        ).trim().toUpperCase();

        if (
            effectiveEngine &&
            ticketEngine &&
            ticketEngine !== effectiveEngine
        ) {
            return false;
        }

        const ticketTransmission = (
            item.transmission ||
            item.carSpecs?.transmission ||
            ''
        ).trim().toLowerCase();

        const specs = item.carSpecs;
        const legacyDrivetrain = specs && 'drivetrain' in specs
            ? specs.drivetrain
            : undefined;

        const ticketDrivetrain = (
            item.drivetrain ||
            (typeof legacyDrivetrain === 'string' ? legacyDrivetrain : '') ||
            specs?.driveType ||
            ''
        ).trim().toLowerCase();

        return checkSpecsMatch(
            ticketTransmission,
            ticketDrivetrain
        );
    });

    if (inboxTicket) {
        inboxTicket.occurrencesCount =
            (inboxTicket.occurrencesCount || 1) + 1;

        inboxTicket.carVin =
            inboxTicket.carVin || params.carVin;

        storage.saveState(state);
        return;
    }

    const partTicket: InboxItem = {
        id: `inbox_part_${crypto.randomUUID()}`,
        type: 'part',
        source: params.source || 'user_manual',

        carBrand,
        carModel,
        carYear: params.carYear || adminCar?.year,
        carVin: params.carVin || adminCar?.vin,

        engine: params.engine || adminCar?.engine,
        engineCode:
            effectiveEngine ||
            params.engineCode ||
            adminCar?.engineCode,

        drivetrain:
            params.drivetrain ||
            params.carSpecs?.drivetrain ||
            params.carSpecs?.driveType ||
            adminCar?.drivetrain,

        transmission:
            params.transmission ||
            params.carSpecs?.transmission ||
            adminCar?.transmission,

        carSpecs:
            params.carSpecs ||
            adminCar?.carSpecs,

        catalogModificationId: modificationId,

        proposedInstallation: hasInstallation
            ? proposedInstallation
            : undefined,

        nodeTitle: rawName,

        partBrand:
            params.partBrand ||
            (hasValidOem ? 'OEM' : 'Не указан'),

        partArticle: hasValidOem
            ? params.partArticle?.trim() || canonicalOem
            : '—',

        partName: rawName,
        isOem: params.isOem === true,

        itemType:
            params.itemType || 'Запчасть / Расходник',

        category: params.category,
        subcategory: params.subcategory,

        quantity: params.quantity,
        price: params.price,
        mileage: params.mileage,

        suggestedScore: hasValidOem ? 85 : 40,
        occurrencesCount: 1,

        submittedBy:
            state.users[0]?.email ||
            state.users[0]?.name ||
            'Пользователь',

        submittedAt: 'Только что',
        note: params.note,
    };

    state.inbox.unshift(partTicket);
    storage.saveState(state);
}