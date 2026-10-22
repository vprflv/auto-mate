import { storage } from '../storage';
import { normalizeSlug, normalizeOem } from '../utils';

export function resolveInboxItem(id: string) {
    const state = storage.getState();
    state.inbox = state.inbox.filter((item) => item.id !== id);
    storage.saveState(state);
}

export function approveCarModel(
    id: string,
    payload?: {
        brandName: string;
        modelName: string;
        years: string;
        modification?: {
            id: string;
            name: string;
            attributes: {
                trim?: string;
                engine?: string;
                transmission?: string;
                drivetrain?: string;
                [key: string]: string | undefined; // <-- И ДОБАВИТЬ СЮДА
            };
        };
    }
) {
    const state = storage.getState();
    const item = state.inbox.find((i) => i.id === id);
    if (!item) return;

    // Берем данные из payload (от админа) или фоллбек из тикета
    const finalBrand = payload?.brandName || item.carBrand;
    const finalModel = payload?.modelName || item.carModel;
    const finalYears = payload?.years || `${item.carYear || '2015'} – н.в.`;

    const bSlug = normalizeSlug(finalBrand);
    const mSlug = normalizeSlug(finalModel);

    let masterModel = state.masterModels.find(
        (m) => m.brandSlug === bSlug && m.modelSlug === mSlug
    );

    // --- УРОВЕНЬ 1: КУЗОВ ---
    if (!masterModel) {
        masterModel = {
            brandSlug: bSlug,
            brandName: finalBrand,
            modelSlug: mSlug,
            modelName: finalModel,
            years: finalYears,
            verified: true,
            registeredCount: 1, // Первый пошел!
            modifications: [],
        };
        state.masterModels.push(masterModel);
    } else {
        // Увеличиваем общий счетчик кузова
        masterModel.registeredCount = (masterModel.registeredCount || 0) + 1;
    }

    // --- УРОВЕНЬ 2: МОДИФИКАЦИЯ ---
    if (payload?.modification) {
        if (!masterModel.modifications) masterModel.modifications = [];

        const existingMod = masterModel.modifications.find(
            (mod) => mod.id === payload.modification!.id
        );

        if (existingMod) {
            // Увеличиваем счетчик конкретной модификации
            existingMod.registeredCount = (existingMod.registeredCount || 0) + 1;
        } else {
            // Админ создал новую модификацию (например, SiR) прямо при одобрении
            masterModel.modifications.push({
                ...payload.modification,
                registeredCount: 1, // Первая такая комплектация
            });
        }
    }

    state.inbox = state.inbox.filter((i) => i.id !== id);
    storage.saveState(state);

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('system-store-updated'));
    }
}

export function approveInboxItem(id: string, payload?: any) {
    const state = storage.getState();
    const item = state.inbox.find((i) => i.id === id);
    if (!item) return;

    if (item.type === 'car_model') {
        // Прокидываем payload дальше в обработчик автомобилей
        approveCarModel(id, payload);
        return;
    }

    const brandSlug = normalizeSlug(item.carBrand);
    const modelSlug = normalizeSlug(item.carModel);

    // 1. Авто-регистрация модели, если её нет (счетчик = 0, так как это запчасть, а не регистрация авто)
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
            registeredCount: 0,
            modifications: []
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

    // ВРЕМЕННЫЙ ПАТЧ: Пока не переделали форму модерации запчасти, привязываем ко всем модификациям ['all']
    const targetModifications = ['all'];

    // 3. Ищем существующий узел внутри выбранной категории
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
            compatibleModifications: targetModifications, // <-- НОВЫЙ МАССИВ
            items: [],
        };
        state.catalogNodes.push(targetNode);
    } else {
        // Добавляем новые модификации, если их еще нет в узле
        const currentMods = targetNode.compatibleModifications || [];
        if (targetModifications.includes('all')) {
            targetNode.compatibleModifications = ['all'];
        } else {
            targetModifications.forEach(mod => {
                if (!currentMods.includes('all') && !currentMods.includes(mod)) {
                    currentMods.push(mod);
                }
            });
            targetNode.compatibleModifications = currentMods;
        }
    }

    // 4. Проверяем наличие детали
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

    const combinedNote = item.note || undefined;

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
            note: combinedNote,
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