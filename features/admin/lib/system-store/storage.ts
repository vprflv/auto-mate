import {StoredCatalogNode, StoredPartItem, SystemState} from './types';
import { addCompatibleFluidFamily, fillFluidAnalogBranches, fluidProductKey } from './fluidAnalogFamily';
import { FLUID_CATALOG_CATEGORY } from '@/features/catalog/lib/catalogSections';
import { STORAGE_KEY, initialDefaultState, initialDefaultMasterModels, initialDefaultNodes } from './defaults';
import {formatArticle, normalizeArticle} from "@/features/admin/lib/system-store/normalizeArticle";
import { formatPartBrand } from './formatPartBrand';
import {getOemCrosses, uniqueOemCrosses} from "@/features/admin/lib/system-store/oemCrosses";
import {PartInstallationMap} from "@/types/partInstallation";
import {installationKey, uniqueInstallations} from "@/features/catalog/lib/partInstallations";
import type { CatalogBranch, CatalogPartPayload } from '@/types';
import { getCatalogPartPlacements, normalizeCatalogBranches } from './catalogBranches';
import { getGarageCars } from '@/features/garage/add/lib/storage';
import { refreshCatalogRegistrationCounts } from '@/features/catalog/lib/carCatalogIdentity';

function refreshRegistrationCounts(state: SystemState): SystemState {
    let cars;
    try {
        cars = getGarageCars();
    } catch {
        return state;
    }
    if (Array.isArray(cars)) refreshCatalogRegistrationCounts(state.masterModels, cars);
    return state;
}

function addPartToCatalogBranch(
    state: SystemState,
    brandSlug: string,
    modelSlug: string,
    node: CatalogBranch,
    payload: CatalogPartPayload,
    installationIncrement: number,
): StoredCatalogNode[] {
    const { part, compatibleModifications } = payload;
    const score = part.compatibilityScore;
    if (score !== undefined && (!Number.isInteger(score) || score < 0 || score > 100)) {
        throw new Error('Индекс доверия должен быть целым числом от 0 до 100.');
    }

    if (!node.category.trim() || !node.title.trim()) {
        throw new Error('Укажите категорию и подкатегорию.');
    }

    const normalizedPartArticle = normalizeArticle(
        part.article
    );

    if (
        !part.brand.trim() ||
        !normalizedPartArticle ||
        !part.name.trim()
    ) {
        throw new Error(
            'Укажите производителя, артикул и название детали.'
        );
    }

    const masterModel = state.masterModels.find(
        model =>
            model.brandSlug === brandSlug &&
            model.modelSlug === modelSlug
    );

    if (!masterModel) {
        throw new Error(
            'Сначала добавьте модель автомобиля в эталонный каталог.'
        );
    }

    const selectedModIds = Array.from(
        new Set(
            compatibleModifications
                .map(id => id.trim())
                .filter(Boolean)
        )
    );

    if (selectedModIds.length === 0) {
        throw new Error(
            'Выберите хотя бы одну модификацию или подтвердите применимость ко всем.'
        );
    }

    const appliesToAll = selectedModIds.includes('all');

    if (appliesToAll && selectedModIds.length > 1) {
        throw new Error(
            'Выберите либо все модификации, либо конкретные.'
        );
    }

    const modifications = Array.isArray(
        masterModel.modifications
    )
        ? masterModel.modifications
        : [];

    const availableModIds = new Set(
        modifications.map(modification => modification.id)
    );

    if (
        !appliesToAll &&
        selectedModIds.some(id => !availableModIds.has(id))
    ) {
        throw new Error(
            'Некоторые выбранные модификации не найдены у этой модели.'
        );
    }

    const confirmedModIds = appliesToAll
        ? ['all']
        : selectedModIds;

    const reviewedInstallations: PartInstallationMap = {};

    for (
        const [modificationId, positions]
        of Object.entries(
        payload.installationsByModification ?? {}
    )
        ) {
        if (
            !availableModIds.has(modificationId) ||
            (
                !appliesToAll &&
                !selectedModIds.includes(modificationId)
            )
        ) {
            throw new Error(
                'Расположение указано для невыбранной модификации.'
            );
        }

        if (!Array.isArray(positions)) {
            throw new Error(
                'Некорректный список расположений.'
            );
        }

        reviewedInstallations[modificationId] =
            uniqueInstallations(positions);
    }

    const formattedPartArticle = formatArticle(
        part.article
    );

    const incomingOemCrosses = part.isOem
        ? []
        : getOemCrosses(part);

    if (!part.isOem && incomingOemCrosses.length === 0) {
        throw new Error('Укажите хотя бы один OEM-номер для аналога.');
    }

    const targetTitle =
        node.title.trim() || part.name.trim();

    const existingNodeIndex = state.catalogNodes.findIndex(
        item =>
            item.brandSlug === brandSlug &&
            item.modelSlug === modelSlug &&
            item.category === node.category &&
            item.title.trim().toLowerCase() ===
            targetTitle.toLowerCase()
    );

    const newNodes = [...state.catalogNodes];

    let targetNode: StoredCatalogNode;

    if (existingNodeIndex >= 0) {
        const existingNode = newNodes[existingNodeIndex];

        targetNode = {
            ...existingNode,
            items: [...existingNode.items]
        };
    } else {
        targetNode = {
            id: `node_${crypto.randomUUID()}`,
            brandSlug,
            modelSlug,
            title: targetTitle,
            category: node.category,
            compatibleModifications: [],
            items: [],
        };
    }

    const existingPartIndex = targetNode.items.findIndex(
        item =>
            item.brand.trim().toUpperCase() ===
            part.brand.trim().toUpperCase() &&
            normalizeArticle(item.article) ===
            normalizedPartArticle
    );



    if (existingPartIndex >= 0) {


        const existingPart =
            targetNode.items[existingPartIndex];

        const mergedOemCrosses = uniqueOemCrosses([
            ...getOemCrosses(existingPart),
            ...incomingOemCrosses
        ]);

        if (existingPart.isOem !== part.isOem) {
            const existingStatus = existingPart.isOem ? 'оригинал' : 'аналог';
            const incomingStatus = part.isOem ? 'оригинал' : 'аналог';

            throw new Error(
                `В каталоге эта деталь отмечена как «${existingStatus}», ` +
                `а в заявке — как «${incomingStatus}». ` +
                'Проверьте отметку «Это оригинальная деталь (OEM)» перед одобрением.'
            );
        }

        if (existingPart.installation) {
            const commonKey = installationKey(existingPart.installation);

            const hasConflictingPosition = Object.values(reviewedInstallations).some(
                positions =>
                    positions.length > 1 ||
                    installationKey(positions[0]) !== commonKey
            );

            if (hasConflictingPosition) {
                throw new Error(
                    'У детали уже указано общее расположение. Чтобы изменить ось или сторону, откройте её карточку в каталоге.'
                );
            }
        }

        if (!part.isOem && mergedOemCrosses.length === 0) {
            throw new Error(
                'Укажите хотя бы один OEM-номер для аналога.'
            );
        }
        if (!part.isOem && incomingOemCrosses.length === 0) {
            throw new Error(
                'Укажите хотя бы один OEM-номер для аналога.'
            );
        }


        // Берём применимость только самой детали.
        // Старую общую применимость узла сюда не переносим.
        const existingModIds =
            existingPart.compatibleModifications ?? [];

        const mergedModIds =
            existingModIds.includes('all') ||
            confirmedModIds.includes('all')
                ? ['all']
                : Array.from(
                    new Set([
                        ...existingModIds,
                        ...confirmedModIds
                    ])
                );

        targetNode.items[existingPartIndex] = {
            ...existingPart,
            name: part.name.trim(),
            isOem: part.isOem,

            oemCrosses: mergedOemCrosses,
            oemCross: mergedOemCrosses[0] ?? '',
            fluidAnalogDetached: mergedOemCrosses.length ? undefined : existingPart.fluidAnalogDetached,

            compatibleModifications: mergedModIds,

            installationsByModification: {
                ...existingPart.installationsByModification,
                ...Object.fromEntries(
                    Object.entries(reviewedInstallations).map(([modificationId, positions]) => [
                        modificationId,
                        uniqueInstallations([
                            ...(existingPart.installationsByModification?.[modificationId] ?? []),
                            ...positions,
                        ]),
                    ])
                ),
            },

            isVerified: true,
            installationsCount:
                (existingPart.installationsCount ?? 0) + installationIncrement,
            compatibilityScore: score ?? existingPart.compatibilityScore ?? 100
        };
    } else {
        targetNode.items.push({
            id: `part_${crypto.randomUUID()}`,
            brand: formatPartBrand(part.brand),
            article: formattedPartArticle,
            name: part.name.trim(),
            isOem: part.isOem,
            oemCrosses: incomingOemCrosses,
            oemCross: incomingOemCrosses[0] ?? '',
            compatibleModifications: [...confirmedModIds],
            installationsByModification: reviewedInstallations,
            isVerified: true,
            installationsCount: installationIncrement,
            compatibilityScore: score ?? 100,
        });
    }

    // У узла остаётся сводка для навигации по каталогу.
    // Она не назначает применимость другим деталям.
    const hasUniversalPart = targetNode.items.some(
        item =>
            item.compatibleModifications?.includes('all')
    );

    targetNode.compatibleModifications = hasUniversalPart
        ? ['all']
        : Array.from(
            new Set(
                targetNode.items.flatMap(
                    item =>
                        item.compatibleModifications ?? []
                )
            )
        );

    if (existingNodeIndex >= 0) {
        newNodes[existingNodeIndex] = targetNode;
    } else {
        newNodes.push(targetNode);
    }

    if (targetNode.category === FLUID_CATALOG_CATEGORY) {
        const saved = targetNode.items[existingPartIndex >= 0 ? existingPartIndex : targetNode.items.length - 1];
        targetNode.excludedFluidProducts = targetNode.excludedFluidProducts?.filter(key => key !== fluidProductKey(saved));
        const updated = addCompatibleFluidFamily(newNodes, targetNode, saved, confirmedModIds);
        newNodes[existingNodeIndex >= 0 ? existingNodeIndex : newNodes.length - 1] = updated;
    }

    return newNodes;
}

export const storage = {
    getState(): SystemState {
        if (typeof window === 'undefined') return initialDefaultState;
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDefaultState));
            return initialDefaultState;
        }
        try {
            const parsed = JSON.parse(raw);
            if (!parsed.masterModels || parsed.masterModels.length === 0) {
                parsed.masterModels = initialDefaultMasterModels;
            }
            if (!parsed.catalogNodes || parsed.catalogNodes.length === 0) {
                parsed.catalogNodes = initialDefaultNodes;
            }
            const catalogNodes = fillFluidAnalogBranches(parsed.catalogNodes);
            const state = refreshRegistrationCounts({ ...parsed, catalogNodes });
            if (catalogNodes !== parsed.catalogNodes) {
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
                } catch {
                    return refreshRegistrationCounts(parsed);
                }
            }
            return state;
        } catch {
            return initialDefaultState;
        }
    },

    saveState(state: SystemState) {
        if (typeof window === 'undefined') return;
        const catalogNodes = fillFluidAnalogBranches(state.catalogNodes);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshRegistrationCounts({ ...state, catalogNodes })));
        window.dispatchEvent(new Event('system-store-updated'));
    },

    updatePartOemCrosses(
        nodeId: string,
        partId: string,
        values: string[]
    ): boolean {
        const state = this.getState();

        const node: StoredCatalogNode | undefined =
            state.catalogNodes.find(
                item => item.id === nodeId
            );

        if (!node) return false;

        const part: StoredPartItem | undefined =
            node.items.find(
                (item: StoredPartItem) => item.id === partId
            );

        if (!part) return false;

        const numbers = uniqueOemCrosses(values).filter(
            value =>
                !part.isOem ||
                normalizeArticle(value) !==
                normalizeArticle(part.article)
        );

        if (!part.isOem && numbers.length === 0 && !part.fluidAnalogDetached) {
            throw new Error(
                'У аналога должен оставаться хотя бы один OEM-номер.'
            );
        }

        if (part.isOem && part.isVerified === true) {
            const previousNumbers = new Set(
                [part.article, ...getOemCrosses(part)]
                    .map(normalizeArticle)
                    .filter(Boolean)
            );
            const addedNumbers = numbers.filter(
                value => !previousNumbers.has(normalizeArticle(value))
            );

            if (addedNumbers.length > 0) {
                for (const catalogNode of state.catalogNodes) {
                    if ((node.category === FLUID_CATALOG_CATEGORY) !== (catalogNode.category === FLUID_CATALOG_CATEGORY)) continue;
                    for (const analog of catalogNode.items) {
                        if (analog.isOem || analog.fluidAnalogDetached) continue;

                        const crosses = getOemCrosses(analog);
                        if (!crosses.some(value => previousNumbers.has(normalizeArticle(value)))) {
                            continue;
                        }

                        const merged = uniqueOemCrosses([...crosses, ...addedNumbers]);
                        analog.oemCrosses = merged;
                        analog.oemCross = merged[0] ?? '';
                    }
                }
            }
        }

        const placements = getCatalogPartPlacements(state.catalogNodes, node, part);
        for (const { part: placement } of placements) {
            if (placement !== part && (part.fluidAnalogDetached || placement.fluidAnalogDetached)) continue;
            placement.oemCrosses = numbers;
            placement.oemCross = numbers[0] ?? '';
            if (numbers.length > 0) delete placement.fluidAnalogDetached;
        }

        this.saveState(state);

        return true;
    },

    // --- ДОБАВЛЯЕМ ЭКШЕНЫ ПРЯМО СЮДА ---

    updatePartConfidence(nodeId: string, partId: string, score: number): void {
        if (!Number.isInteger(score) || score < 0 || score > 100) {
            throw new Error('Индекс доверия должен быть целым числом от 0 до 100.');
        }
        const state = this.getState();
        const part = state.catalogNodes.find(node => node.id === nodeId)
            ?.items.find(item => item.id === partId);
        if (!part) throw new Error('Запчасть больше не найдена в каталоге.');
        part.compatibilityScore = score;
        this.saveState(state);
    },

    approvePartTicket(ticketId: string, payload: CatalogPartPayload) {
        const ticket = this.getState().inbox.find(
            item => item.id === ticketId
        );

        if (!ticket) {
            throw new Error('Заявка не найдена.');
        }

        const brandSlug = ticket.carBrand
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-');

        const modelSlug = ticket.carModel
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-');

        this.addCatalogPart(brandSlug, modelSlug, payload, ticketId);
    },

    addCatalogPart(
        brandSlug: string,
        modelSlug: string,
        payload: CatalogPartPayload,
        ticketId?: string
    ) {
        const state = this.getState();
        const branches = normalizeCatalogBranches(payload.nodes);
        let catalogNodes = state.catalogNodes;
        for (const [index, node] of branches.entries()) {
            const installationIncrement = ticketId !== undefined && index === 0 ? 1 : 0;
            catalogNodes = addPartToCatalogBranch({ ...state, catalogNodes }, brandSlug, modelSlug, node, payload, installationIncrement);
        }

        this.saveState({
            ...state,
            catalogNodes,
            inbox: ticketId === undefined ? state.inbox : state.inbox.filter(item => item.id !== ticketId),
        });
    },

    rejectTicket(ticketId: string) {
        const state = this.getState();
        const newInbox = state.inbox.filter(t => t.id !== ticketId);
        this.saveState({
            ...state,
            inbox: newInbox
        });
    }
};
