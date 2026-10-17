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

    // 2. Ищем авто в админке для связки
    const adminCar =
        state.cars.find((c) => c.id === params.carId) ||
        state.cars.find((c) => c.vin && c.vin === params.carId);

    const carBrand = params.carBrand || adminCar?.brand || 'Неизвестная марка';
    const carModel = params.carModel || adminCar?.model || 'Неизвестная модель';
    const brandSlug = normalizeSlug(carBrand);
    const modelSlug = normalizeSlug(carModel);

    const cleanBrand = (params.partBrand || '').trim().toLowerCase();
    const cleanName = rawName.toLowerCase();

    // 3. ПРОВЕРКА В MASTER CATALOG (если деталь уже есть — инкрементируем установки)
    if (hasValidOem) {
        for (const node of state.catalogNodes) {
            if (normalizeSlug(node.brandSlug) !== brandSlug || normalizeSlug(node.modelSlug) !== modelSlug) {
                continue;
            }
            const foundPart = node.items.find((p) => normalizeOem(p.article) === canonicalOem);
            if (foundPart) {
                foundPart.installationsCount = (foundPart.installationsCount || 1) + 1;
                storage.saveState(state);
                return;
            }
        }
    } else {
        for (const node of state.catalogNodes) {
            if (normalizeSlug(node.brandSlug) !== brandSlug || normalizeSlug(node.modelSlug) !== modelSlug) {
                continue;
            }
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

    // 4. ПРОВЕРКА В INBOX (если тикет уже есть — инкрементируем счетчик обращений)
    if (hasValidOem) {
        const inboxTicket = state.inbox.find(
            (i) =>
                i.type === 'part' &&
                normalizeSlug(i.carBrand) === brandSlug &&
                normalizeSlug(i.carModel) === modelSlug &&
                normalizeOem(i.partArticle) === canonicalOem
        );

        if (inboxTicket) {
            inboxTicket.occurrencesCount = (inboxTicket.occurrencesCount || 1) + 1;
            inboxTicket.carVin = inboxTicket.carVin || params.carVin;
            inboxTicket.engine = inboxTicket.engine || params.engine;
            inboxTicket.engineCode = inboxTicket.engineCode || params.engineCode;
            inboxTicket.drivetrain = inboxTicket.drivetrain || params.drivetrain;
            inboxTicket.transmission = inboxTicket.transmission || params.transmission;
            inboxTicket.carSpecs = { ...(inboxTicket.carSpecs || {}), ...(params.carSpecs || {}) };
            storage.saveState(state);
            return;
        }
    } else {
        const inboxTicket = state.inbox.find(
            (i) =>
                i.type === 'part' &&
                normalizeSlug(i.carBrand) === brandSlug &&
                normalizeSlug(i.carModel) === modelSlug &&
                (i.partBrand || '').trim().toLowerCase() === cleanBrand &&
                (i.partName || '').trim().toLowerCase() === cleanName
        );

        if (inboxTicket) {
            inboxTicket.occurrencesCount = (inboxTicket.occurrencesCount || 1) + 1;
            storage.saveState(state);
            return;
        }
    }

    // 5. СОЗДАЕМ ТИКЕТ В INBOX
    const baseScore = hasValidOem ? 85 : 40;
    const isOemFlag = Boolean(params.isOem || hasValidOem);

    const partTicket: InboxItem = {
        id: `inbox_part_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: 'part',
        source: params.source || 'user_manual',
        carBrand,
        carModel,
        carYear: params.carYear || adminCar?.year,
        carVin: params.carVin || adminCar?.vin,
        engine: params.engine || adminCar?.engine,
        engineCode: params.engineCode || (adminCar as any)?.engineCode,
        drivetrain: params.drivetrain || params.carSpecs?.drivetrain || (adminCar as any)?.drivetrain || (adminCar as any)?.drive,
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