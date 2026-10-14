import { InboxItem } from '../types';
import { storage } from '../storage';
import { normalizeSlug } from '../utils';

export interface AddUserPartParams {
    carId: string;
    carBrand?: string;
    carModel?: string;
    carYear?: number;
    carVin?: string;
    engine?: string;
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

function findCarInLocalStorage(carId: string): any | null {
    if (typeof window === 'undefined') return null;
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || key === 'bm_shared_system_state_v1') continue;
            const raw = localStorage.getItem(key);
            if (!raw || (!raw.startsWith('[') && !raw.startsWith('{'))) continue;

            const parsed = JSON.parse(raw);
            const list = Array.isArray(parsed)
                ? parsed
                : Array.isArray(parsed?.cars)
                    ? parsed.cars
                    : Array.isArray(parsed?.items)
                        ? parsed.items
                        : null;

            if (list) {
                const found = list.find((c: any) => c && (c.id === carId || c.vin === carId));
                if (found && (found.make || found.brand || found.model)) {
                    return found;
                }
            }
        }
    } catch {
        // ignore parse errors
    }
    return null;
}

export function addUserPart(params: AddUserPartParams) {
    const rawName = (params.partName || '').trim();
    if (rawName.length < 2) return;

    const state = storage.getState();

    // 1. Сначала ищем машину по точному ID в админке
    const adminCar =
        state.cars.find((c) => c.id === params.carId) ||
        state.cars.find((c) => c.vin && c.vin === params.carId);

    // 2. Если не переданы напрямую и нет в админке — ищем машину в localStorage гаража
    const garageCar = !params.carBrand && !adminCar ? findCarInLocalStorage(params.carId) : null;

    const carBrand =
        params.carBrand ||
        adminCar?.brand ||
        garageCar?.make ||
        garageCar?.brand ||
        'Неизвестная марка';

    const carModel =
        params.carModel ||
        adminCar?.model ||
        garageCar?.model ||
        'Неизвестная модель';

    const carYear = params.carYear || adminCar?.year || Number(garageCar?.year) || undefined;
    const carVin = params.carVin || adminCar?.vin || garageCar?.vin || undefined;
    const carEngine = params.engine || adminCar?.engine || garageCar?.engine || undefined;

    const user =
        (adminCar && state.users.find((u) => u.id === adminCar.userId)) ||
        state.users[0];

    const brandSlug = normalizeSlug(carBrand);
    const modelSlug = normalizeSlug(carModel);
    const cleanArticle = (params.partArticle || '').trim().toUpperCase();
    const cleanBrand = (params.partBrand || '').trim().toLowerCase();
    const cleanName = rawName.toLowerCase();

    const hasRealArticle = cleanArticle.length > 0 && cleanArticle !== '—' && cleanArticle !== '-';

    const isSamePart = (pBrand?: string, pArticle?: string, pName?: string) => {
        const bMatch = (pBrand || '').trim().toLowerCase() === cleanBrand;
        if (hasRealArticle) {
            return bMatch && (pArticle || '').trim().toUpperCase() === cleanArticle;
        }
        return bMatch && (pName || '').trim().toLowerCase() === cleanName;
    };

    const alreadyInMasterCatalog = state.catalogNodes.some((node) => {
        if (node.brandSlug !== brandSlug || node.modelSlug !== modelSlug) return false;
        return node.items.some((p) => isSamePart(p.brand, p.article, p.name));
    });

    if (alreadyInMasterCatalog) return;

    const alreadyInInbox = state.inbox.some((i) => {
        if (i.type !== 'part') return false;
        if (normalizeSlug(i.carBrand) !== brandSlug || normalizeSlug(i.carModel) !== modelSlug) return false;
        return isSamePart(i.partBrand, i.partArticle, i.partName);
    });

    if (alreadyInInbox) return;

    const partTicket: InboxItem = {
        id: `inbox_part_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: 'part',
        source: params.source || 'user_manual',
        carBrand,
        carModel,
        carYear,
        carVin,
        engine: carEngine,
        nodeTitle: rawName,
        partBrand: params.partBrand,
        partArticle: params.partArticle,
        partName: rawName,
        isOem: Boolean(params.isOem),
        itemType: params.itemType,
        category: params.category,
        subcategory: params.subcategory,
        quantity: params.quantity,
        price: params.price,
        mileage: params.mileage,
        suggestedScore: params.isOem ? 90 : 40,
        occurrencesCount: 1,
        submittedBy: user?.email || user?.name || 'Пользователь',
        submittedAt: 'Только что',
        note: params.note,
    };

    state.inbox.unshift(partTicket);
    storage.saveState(state);

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('system-store-updated'));
    }
}