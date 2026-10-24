import { InboxItem } from '../types';
import { storage } from '../storage';
import { normalizeSlug, normalizeOem } from '../utils';

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
    quantity?: number;
    price?: number;
    mileage?: number;
    source?: 'user_manual' | 'user_service';
    note?: string;
}

export function addUserPart(params: AddUserPartParams) {
    const rawName = (params.partName || '').trim();
    if (rawName.length < 2) return;

    // 1. Канонизируем OEM
    const canonicalOem = normalizeOem(params.partArticle);
    const hasValidOem = canonicalOem.length >= 3;

    const state = storage.getState();

    // 2. Ищем авто в админке
    const adminCar =
        state.cars.find((c) => c.id === params.carId) ||
        state.cars.find((c) => c.vin && c.vin === params.carId);

    const carBrand = params.carBrand || adminCar?.brand || 'Неизвестная марка';
    const carModel = params.carModel || adminCar?.model || 'Неизвестная модель';
    const brandSlug = normalizeSlug(carBrand);
    const modelSlug = normalizeSlug(carModel);

    // Нормализуем параметры силовой установки для точного сравнения
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
        (adminCar as any)?.transmission ||
        ''
    ).trim().toLowerCase();

    const effectiveDrivetrain = (
        params.drivetrain ||
        params.carSpecs?.drivetrain ||
        (adminCar as any)?.drivetrain ||
        ''
    ).trim().toLowerCase();

    const cleanBrand = (params.partBrand || '').trim().toLowerCase();
    const cleanName = rawName.toLowerCase();

    const checkSpecsMatch = (ticketTrans: string, ticketDrive: string) => {
        if (effectiveTransmission && ticketTrans && effectiveTransmission !== ticketTrans) return false;
        if (effectiveDrivetrain && ticketDrive && effectiveDrivetrain !== ticketDrive) return false;
        return true;
    };

    // Хелпер: проверка, одобрен ли узел Master Catalog для нашей КПП и Привода
    const checkNodeMatch = (node: StoredCatalogNode) => {
        if (normalizeSlug(node.brandSlug) !== brandSlug || normalizeSlug(node.modelSlug) !== modelSlug) return false;

        const engines = node.engineCompatibility || ['all'];
        const isEngineMatch = engines.includes('all') || (effectiveEngine && engines.some((e) => e.toUpperCase() === effectiveEngine));
        if (!isEngineMatch) return false;

        const transmissions = node.transmissionCompatibility || ['all'];
        const isTransMatch = transmissions.includes('all') || (effectiveTransmission && transmissions.some((t) => t.toLowerCase() === effectiveTransmission));
        if (!isTransMatch) return false;

        const drivetrains = node.drivetrainCompatibility || ['all'];
        const isDriveMatch = drivetrains.includes('all') || (effectiveDrivetrain && drivetrains.some((d) => d.toLowerCase() === effectiveDrivetrain));
        if (!isDriveMatch) return false;

        return true;
    };

    // 3. ПРОВЕРКА В MASTER CATALOG: Полное совпадение Модели + Мотора + КПП + Привода + OEM
    if (hasValidOem) {
        for (const node of state.catalogNodes) {
            if (!checkNodeMatch(node)) continue;

            const foundPart = node.items.find((p) => normalizeOem(p.article) === canonicalOem);
            if (foundPart) {
                foundPart.installationsCount = (foundPart.installationsCount || 1) + 1;
                storage.saveState(state);
                return;
            }
        }
    } else {
        for (const node of state.catalogNodes) {
            if (!checkNodeMatch(node)) continue;

            const foundPart = node.items.find(
                (p) =>
                    (p.brand || '').trim().toLowerCase() === cleanBrand &&
                    p.name.trim().toLowerCase() === cleanName
            );
            if (foundPart) {
                foundPart.installationsCount = (foundPart.installationsCount || 1) + 1;
                storage.saveState(state);
                return;
            }
        }
    }

    // 4. ПРОВЕРКА В INBOX
    if (hasValidOem) {
        const inboxTicket = state.inbox.find((i) => {
            if (i.type !== 'part') return false;
            if (normalizeSlug(i.carBrand) !== brandSlug || normalizeSlug(i.carModel) !== modelSlug) return false;
            if (normalizeOem(i.partArticle) !== canonicalOem) return false;

            const ticketEngine = (i.engineCode || i.engine || '').trim().toUpperCase();
            if (effectiveEngine && ticketEngine && ticketEngine !== effectiveEngine) return false;

            const ticketTrans = (i.transmission || i.carSpecs?.transmission || '').trim().toLowerCase();
            const ticketDrive = (i.drivetrain || i.carSpecs?.drivetrain || '').trim().toLowerCase();
            return checkSpecsMatch(ticketTrans, ticketDrive);
        });

        if (inboxTicket) {
            inboxTicket.occurrencesCount = (inboxTicket.occurrencesCount || 1) + 1;
            inboxTicket.carVin = inboxTicket.carVin || params.carVin;
            storage.saveState(state);
            return;
        }
    } else {
        const inboxTicket = state.inbox.find((i) => {
            if (i.type !== 'part') return false;
            if (normalizeSlug(i.carBrand) !== brandSlug || normalizeSlug(i.carModel) !== modelSlug) return false;
            if ((i.partBrand || '').trim().toLowerCase() !== cleanBrand) return false;
            if ((i.partName || '').trim().toLowerCase() !== cleanName) return false;

            const ticketEngine = (i.engineCode || i.engine || '').trim().toUpperCase();
            if (effectiveEngine && ticketEngine && ticketEngine !== effectiveEngine) return false;

            const ticketTrans = (i.transmission || i.carSpecs?.transmission || '').trim().toLowerCase();
            const ticketDrive = (i.drivetrain || i.carSpecs?.drivetrain || '').trim().toLowerCase();
            return checkSpecsMatch(ticketTrans, ticketDrive);
        });

        if (inboxTicket) {
            inboxTicket.occurrencesCount = (inboxTicket.occurrencesCount || 1) + 1;
            storage.saveState(state);
            return;
        }
    }

    // 5. СОЗДАЕМ НОВЫЙ ТИКЕТ
    const baseScore = hasValidOem ? 85 : 40;
    const isOemFlag = params.isOem === true;

    const partTicket: InboxItem = {
        id: `inbox_part_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: 'part',
        source: params.source || 'user_manual',
        carBrand,
        carModel,
        carYear: params.carYear || adminCar?.year,
        carVin: params.carVin || adminCar?.vin,
        engine: params.engine || adminCar?.engine,
        engineCode: effectiveEngine || params.engineCode || (adminCar as any)?.engineCode,
        drivetrain: params.drivetrain || params.carSpecs?.drivetrain || (adminCar as any)?.drivetrain,
        transmission: params.transmission || params.carSpecs?.transmission || (adminCar as any)?.transmission,
        carSpecs: params.carSpecs || (adminCar as any)?.carSpecs,
        nodeTitle: rawName,
        partBrand: params.partBrand || (hasValidOem ? 'OEM' : 'Не указан'),
        partArticle: hasValidOem ? (params.partArticle?.trim() || canonicalOem) : '—',
        partName: rawName,
        isOem: isOemFlag,
        itemType: params.itemType || 'Запчасть / Расходник',
        category: params.category,
        subcategory: params.subcategory,
        quantity: params.quantity,
        price: params.price,
        mileage: params.mileage,
        suggestedScore: baseScore,
        occurrencesCount: 1,
        submittedBy: state.users[0]?.email || state.users[0]?.name || 'Пользователь',
        submittedAt: 'Только что',
        note: params.note,
    };

    state.inbox.unshift(partTicket);
    storage.saveState(state);

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('system-store-updated'));
    }
}