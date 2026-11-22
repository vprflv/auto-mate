import type { Car } from '@/types';
import type { CatalogModification } from '../types';
import { storage } from '../storage';
import { assertRequiredModificationAttributes } from './modifications';
import { getGarageCars, saveGarageCars } from '@/features/garage/add/lib/storage';
import { carCatalogYearApprovalVersion, carReviewVersion, modificationValues, resolveCarCatalogIdentity } from '@/features/catalog/lib/carCatalogIdentity';
import { normalizeSlug, normalizeOem } from '../utils';
import { checkCarReviewModification, getCarReviewSpecs, matchesCarReviewBody, queueCarCatalogReview } from '../carCatalogReview';

export function resolveInboxItem(id: string) {
    const state = storage.getState();
    state.inbox = state.inbox.filter((item) => item.id !== id);
    storage.saveState(state);
}

export interface ApproveCarModelPayload {
    brandName: string;
    modelName: string;
    years: string;
    existingModificationId?: string;
    approveYearMismatch?: boolean;
    modification?: Pick<CatalogModification, 'id' | 'name' | 'attributes'>;
}

export function approveCarModel(id: string, payload?: ApproveCarModelPayload) {
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

    const existingModification = masterModel?.modifications?.find(
        modification => modification.id === (payload?.existingModificationId ?? payload?.modification?.id)
    );
    if (payload?.existingModificationId && !existingModification) {
        throw new Error('Выбранная модификация больше не найдена. Выберите другую.');
    }
    let approveYearMismatch = false;
    if (existingModification) {
        const { conflicts, yearConflicts } = checkCarReviewModification(item, existingModification);
        if (conflicts.length > 0) throw new Error(conflicts.join(' '));
        if (yearConflicts.length > 0 && (!payload?.approveYearMismatch || !payload.existingModificationId)) {
            throw new Error(yearConflicts.join(' '));
        }
        approveYearMismatch = yearConflicts.length > 0;
    } else if (payload?.modification) {
        assertRequiredModificationAttributes(payload.modification.attributes);
    }

    // --- УРОВЕНЬ 1: КУЗОВ ---
    if (!masterModel) {
        masterModel = {
            brandSlug: bSlug,
            brandName: finalBrand,
            modelSlug: mSlug,
            modelName: finalModel,
            years: finalYears,
            verified: true,
            registeredCount: 0,
            modifications: [],
        };
        state.masterModels.push(masterModel);
    }

    masterModel.verified = true;

    // --- УРОВЕНЬ 2: МОДИФИКАЦИЯ ---
    const requestedModification = existingModification ?? payload?.modification;
    if (requestedModification) {
        if (!masterModel.modifications) masterModel.modifications = [];

        const existingMod = masterModel.modifications.find(
            (mod) => mod.id === requestedModification.id
        );

        if (!existingMod) {
            // Админ создал новую модификацию (например, SiR) прямо при одобрении
            masterModel.modifications.push({
                ...requestedModification,
                registeredCount: 0,
            });
        }
    }

    const approvedModification = masterModel.modifications.find(
        modification => modification.id === requestedModification?.id
    );

    state.inbox = state.inbox.filter(i => i.id !== id);

    if (approvedModification) {
        const versions = item.garageCarVersions ?? {};
        const cars = getGarageCars();
        const separateReviews: typeof cars = [];
        let approvedCars = 0;
        const updatedCars = cars.map(car => {
            const version = versions[car.id];
            if (version !== carReviewVersion(car) && version !== carReviewVersion(car, true)) return car;
            if (!matchesCarReviewBody(item, car.year, car.bodyCode)) {
                separateReviews.push(car);
                return car;
            }
            const updatedCar: Car = {
                ...car,
                ...modificationValues(approvedModification),
                make: masterModel!.brandName,
                model: masterModel!.modelName,
                catalogBrandSlug: masterModel!.brandSlug,
                catalogModelSlug: masterModel!.modelSlug,
                catalogModificationId: approvedModification.id,
                modificationName: approvedModification.name,
                catalogYearApproval: undefined,
                updatedAt: new Date().toISOString(),
            };
            if (approveYearMismatch) {
                updatedCar.catalogYearApproval = carCatalogYearApprovalVersion(updatedCar);
                if (!resolveCarCatalogIdentity(updatedCar, state.masterModels)) {
                    throw new Error('Не удалось подтвердить привязку к выбранной модификации.');
                }
            }
            approvedCars += 1;
            return updatedCar;
        });
        if (approveYearMismatch && approvedCars === 0) {
            throw new Error('Автомобиль из заявки больше не найден или его характеристики изменились.');
        }
        saveGarageCars(updatedCars);
        for (const car of separateReviews) {
            queueCarCatalogReview(state, {
                garageCarId: car.id,
                userId: state.cars.find(item => item.id === car.id)?.userId,
                brand: car.make,
                model: car.model,
                year: car.year,
                engine: car.engine ?? '',
                carSpecs: getCarReviewSpecs(car),
            });
        }
    }

    storage.saveState(state);
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
            n.category === targetCategory && !n.assembly &&
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
