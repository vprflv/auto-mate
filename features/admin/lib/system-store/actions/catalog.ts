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

    // Читаем исправленные админом поля, если они есть
    const finalBrand = (item as any).adminCarBrand || item.carBrand || 'Неизвестно';
    const finalModel = (item as any).adminCarModel || item.carModel || 'Неизвестно';
    const finalYears = (item as any).adminYears || `${item.carYear || (item as any).year || '2015'} – н.в.`;

    const bSlug = normalizeSlug(finalBrand);
    const mSlug = normalizeSlug(finalModel);

    const exists = state.masterModels.some(
        (m) => m.brandSlug === bSlug && m.modelSlug === mSlug
    );

    if (!exists) {
        state.masterModels.push({
            brandSlug: bSlug,
            brandName: finalBrand,
            modelSlug: mSlug,
            modelName: finalModel,
            years: finalYears,
            verified: true,
        });
    }

    state.inbox = state.inbox.filter((i) => i.id !== id);
    storage.saveState(state);

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('system-store-updated'));
    }
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

    // 1. Авто-регистрация модели
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

    // 3. Унификация скоупа двигателя
    const rawEngineScope: string = (item as any).adminEngineScope || 'all';
    let targetEngine = 'all';
    if (rawEngineScope !== 'all') {
        const cleanCode = item.engineCode?.trim().toUpperCase();
        if (cleanCode && cleanCode.length >= 2) {
            targetEngine = cleanCode;
        } else {
            const parts = rawEngineScope.replace(/\(.*?\)/g, '').trim().split(/\s+/);
            const candidate = parts[parts.length - 1]?.toUpperCase();
            targetEngine = candidate && candidate.length >= 3 ? candidate : rawEngineScope.trim().toUpperCase();
        }
    }

    // ДОСТАЕМ ТРАНСМИССИЮ И ПРИВОД ИЗ ТИКЕТА
    const targetTrans = (item.transmission || item.carSpecs?.transmission || 'all').trim().toLowerCase();
    const targetDrive = (item.drivetrain || item.carSpecs?.drivetrain || 'all').trim().toLowerCase();

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
            transmissionCompatibility: [targetTrans],
            drivetrainCompatibility: [targetDrive],
            items: [],
        };
        state.catalogNodes.push(targetNode);
    } else {
        // Обновляем список моторов
        const currentEngines = targetNode.engineCompatibility || [];
        if (targetEngine === 'all') {
            targetNode.engineCompatibility = ['all'];
        } else if (!currentEngines.includes('all') && !currentEngines.includes(targetEngine)) {
            targetNode.engineCompatibility = [...currentEngines, targetEngine];
        }

        // Обновляем список КПП
        const currentTrans = targetNode.transmissionCompatibility || [];
        if (targetTrans === 'all') {
            targetNode.transmissionCompatibility = ['all'];
        } else if (!currentTrans.includes('all') && !currentTrans.includes(targetTrans)) {
            targetNode.transmissionCompatibility = [...currentTrans, targetTrans];
        }

        // Обновляем список приводов
        const currentDrive = targetNode.drivetrainCompatibility || [];
        if (targetDrive === 'all') {
            targetNode.drivetrainCompatibility = ['all'];
        } else if (!currentDrive.includes('all') && !currentDrive.includes(targetDrive)) {
            targetNode.drivetrainCompatibility = [...currentDrive, targetDrive];
        }
    }

    // 5. Проверяем наличие детали
    const canonicalFinal = normalizeOem(finalArticle);
    const hasRealOem = canonicalFinal.length >= 3;
    const safeArticle = hasRealOem ? finalArticle.trim() : '—';

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
    const transNotePrefix = targetTrans !== 'all' ? `[КПП: ${targetTrans}] ` : '';
    const combinedNote = `${engineNotePrefix}${transNotePrefix}${item.note || ''}`.trim();

    if (existingPart) {
        existingPart.installationsCount = (existingPart.installationsCount || 1) + (item.occurrencesCount || 1);
        existingPart.isVerified = true;
    } else {
        targetNode.items.push({
            id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            brand: finalBrand,
            article: safeArticle,
            name: finalName,
            isOem: hasRealOem ? finalIsOem : false,
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