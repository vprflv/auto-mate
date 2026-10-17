import { storage } from '../storage';
import { normalizeSlug, normalizeOem } from '../utils';

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
            years: `${item.carYear || (item as any).year || '2015'} – н.в.`,
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

    // 1. Авто-регистрация модели в masterModels, если её ещё нет
    const modelExists = state.masterModels.some(
        (m) => m.brandSlug === brandSlug && m.modelSlug === modelSlug
    );
    if (!modelExists) {
        state.masterModels.push({
            brandSlug,
            brandName: item.carBrand,
            modelSlug,
            modelName: item.carModel,
            years: `${item.carYear || (item as any).year || '2015'} – н.в.`,
            verified: true,
        });
    }

    // 2. Берём данные с учётом правок админа
    const targetCategory: string = (item as any).adminCategory || 'service';
    const targetTitle: string = ((item as any).adminNodeTitle || item.nodeTitle || item.partName || 'Расходники ТО').trim();

    const finalBrand = ((item as any).adminPartBrand !== undefined ? (item as any).adminPartBrand : item.partBrand) || 'OEM';
    const finalArticle = ((item as any).adminPartArticle !== undefined ? (item as any).adminPartArticle : item.partArticle) || '—';
    const finalName = ((item as any).adminPartName !== undefined ? (item as any).adminPartName : item.partName) || 'Деталь';
    const finalIsOem = (item as any).adminIsOem !== undefined ? Boolean((item as any).adminIsOem) : Boolean(item.isOem);
    const finalScore = (item as any).adminScore !== undefined ? Number((item as any).adminScore) : (item.suggestedScore || 80);

    // 3. Определяем привязку к двигателю (конкретный мотор или 'all')
    const targetEngine: string = (item as any).adminEngineScope || 'all';

    // 4. Ищем существующий узел внутри выбранной категории
    let targetNode = state.catalogNodes.find(
        (n) =>
            normalizeSlug(n.brandSlug) === brandSlug &&
            normalizeSlug(n.modelSlug) === modelSlug &&
            n.category === targetCategory &&
            n.title.trim().toLowerCase() === targetTitle.toLowerCase()
    );

    if (!targetNode) {
        targetNode = {
            id: `${brandSlug}-${modelSlug}-${targetCategory}-${Date.now()}`,
            brandSlug,
            modelSlug,
            title: targetTitle,
            category: targetCategory as any,
            engineCompatibility: [targetEngine],
            items: [],
        };
        state.catalogNodes.push(targetNode);
    } else {
        // Если узел уже есть — обновляем его совместимость по моторам
        const currentEngines = targetNode.engineCompatibility || [];
        if (targetEngine === 'all') {
            targetNode.engineCompatibility = ['all'];
        } else if (!currentEngines.includes('all') && !currentEngines.includes(targetEngine)) {
            targetNode.engineCompatibility = [...currentEngines, targetEngine];
        }
    }

    // 5. Проверяем наличие детали по каноническому OEM или связке бренд+артикул
    const canonicalFinal = normalizeOem(finalArticle);
    const hasRealOem = canonicalFinal.length >= 3;

    const existingPart = targetNode.items.find((p) => {
        if (hasRealOem && normalizeOem(p.article).length >= 3) {
            return normalizeOem(p.article) === canonicalFinal;
        }
        return (
            p.article.trim().toLowerCase() === finalArticle.trim().toLowerCase() &&
            p.brand.trim().toLowerCase() === finalBrand.trim().toLowerCase()
        );
    });

    const engineNotePrefix = targetEngine !== 'all' ? `[ДВС: ${targetEngine}] ` : '';
    const combinedNote = `${engineNotePrefix}${item.note || ''}`.trim();

    if (existingPart) {
        existingPart.installationsCount = (existingPart.installationsCount || 1) + (item.occurrencesCount || 1);
        existingPart.isVerified = true;
    } else {
        targetNode.items.push({
            id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            brand: finalBrand,
            article: finalArticle,
            name: finalName,
            isOem: finalIsOem,
            isVerified: true,
            installationsCount: item.occurrencesCount || 1,
            compatibilityScore: finalScore,
            note: combinedNote || undefined,
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