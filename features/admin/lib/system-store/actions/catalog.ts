import { storage } from '../storage';
import { normalizeSlug } from '../utils';

export function resolveInboxItem(id: string) {
    const state = storage.getState();
    state.inbox = state.inbox.filter((item) => item.id !== id);
    storage.saveState(state);
}

export function approveCarModel(id: string) {
    const state = storage.getState();
    const item = state.inbox.find((i) => i.id === id);
    if (!item) return;

    const bSlug = normalizeSlug(item.carBrand);
    const mSlug = normalizeSlug(item.carModel);

    const exists = state.masterModels.some(
        (m) => m.brandSlug === bSlug && m.modelSlug === mSlug
    );

    if (!exists) {
        state.masterModels.push({
            brandSlug: bSlug,
            brandName: item.carBrand,
            modelSlug: mSlug,
            modelName: item.carModel,
            years: `${item.carYear || item.year || '2015'} – н.в.`,
            verified: true,
        });
    }

    state.inbox = state.inbox.filter((i) => i.id !== id);
    storage.saveState(state);
}

export function approveInboxItem(id: string) {
    const state = storage.getState();
    const item = state.inbox.find((i) => i.id === id);
    if (!item) return;

    if (item.type === 'car_model') {
        approveCarModel(id);
        return;
    }

    const brandSlug = normalizeSlug(item.carBrand);
    const modelSlug = normalizeSlug(item.carModel);

    // 1. Автоматически регистрируем модель в masterModels, если её ещё нет в каталоге
    const modelExists = state.masterModels.some(
        (m) => m.brandSlug === brandSlug && m.modelSlug === modelSlug
    );
    if (!modelExists) {
        state.masterModels.push({
            brandSlug,
            brandName: item.carBrand,
            modelSlug,
            modelName: item.carModel,
            years: `${item.carYear || item.year || '2015'} – н.в.`,
            verified: true,
        });
    }

    // 2. Используем только валидные ID вкладок CategoryTabs ('service' | 'brakes' | 'suspension' | 'ignition')
    const catLower = `${item.category || ''} ${item.nodeTitle || ''}`.toLowerCase();
    let targetCategory: 'service' | 'brakes' | 'suspension' | 'ignition' = 'service';

    if (catLower.includes('тормоз') || catLower.includes('колодк') || catLower.includes('brakes')) {
        targetCategory = 'brakes';
    } else if (catLower.includes('подвеск') || catLower.includes('амортизатор') || catLower.includes('рычаг') || catLower.includes('suspension')) {
        targetCategory = 'suspension';
    } else if (catLower.includes('зажигани') || catLower.includes('свеч') || catLower.includes('катушк') || catLower.includes('ignition')) {
        targetCategory = 'ignition';
    }

    const targetTitle = item.nodeTitle || item.category || 'Регламентные расходники ТО';

    let targetNode = state.catalogNodes.find(
        (n) =>
            n.brandSlug === brandSlug &&
            n.modelSlug === modelSlug &&
            n.title.toLowerCase() === targetTitle.toLowerCase()
    );

    if (!targetNode) {
        targetNode = {
            id: `${brandSlug}-${modelSlug}-${Date.now()}`,
            brandSlug,
            modelSlug,
            title: targetTitle,
            category: targetCategory,
            engineCompatibility: ['all'],
            items: [],
        };
        state.catalogNodes.push(targetNode);
    }

    const existingPart = targetNode.items.find(
        (p) =>
            p.article.trim().toLowerCase() === (item.partArticle || '').trim().toLowerCase() &&
            p.brand.trim().toLowerCase() === (item.partBrand || '').trim().toLowerCase()
    );

    if (existingPart) {
        existingPart.installationsCount += 1;
        existingPart.isVerified = true;
    } else {
        targetNode.items.push({
            id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            brand: item.partBrand || 'OEM',
            article: item.partArticle || '—',
            name: item.partName || 'Деталь',
            isOem: Boolean(item.isOem),
            isVerified: true,
            installationsCount: item.occurrencesCount || 1,
            compatibilityScore: item.suggestedScore || 80,
            note: item.note,
        });
    }

    state.inbox = state.inbox.filter((i) => i.id !== id);
    storage.saveState(state);

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('system-store-updated'));
    }
}

export function updateCatalogPart(params: {
    nodeId: string;
    partId: string;
    score: number;
    isVerified: boolean;
    note?: string;
}) {
    const state = storage.getState();
    const node = state.catalogNodes.find((n) => n.id === params.nodeId);
    if (node) {
        const part = node.items.find((p) => p.id === params.partId);
        if (part) {
            part.compatibilityScore = params.score;
            part.isVerified = params.isVerified;
            if (params.note !== undefined) part.note = params.note;
            storage.saveState(state);
        }
    }
}