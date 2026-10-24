import {StoredCatalogNode, StoredPartItem, SystemState} from './types';
import { STORAGE_KEY, initialDefaultState, initialDefaultMasterModels, initialDefaultNodes } from './defaults';
import {formatArticle, normalizeArticle} from "@/features/admin/lib/system-store/normalizeArticle";
import {getOemCrosses, uniqueOemCrosses} from "@/features/admin/lib/system-store/oemCrosses";

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
            return parsed;
        } catch {
            return initialDefaultState;
        }
    },

    saveState(state: SystemState) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
                normalizeArticle(value) !== normalizeArticle(part.article)
        );

        part.oemCrosses = numbers;
        part.oemCross = numbers[0] ?? '';

        this.saveState(state);

        return true;
    },

    // --- ДОБАВЛЯЕМ ЭКШЕНЫ ПРЯМО СЮДА ---

    approvePartTicket(
        ticketId: string,
        payload: {
            part: {
                brand: string;
                article: string;
                name: string;
                isOem: boolean;
                oemCross?: string;
                oemCrosses?: string[];
            };
            node: {
                category: string;
                title: string;
            };
            compatibleModifications: string[];
        }
    ) {
        const state = this.getState();

        const ticket = state.inbox.find(
            item => item.id === ticketId
        );

        if (!ticket) {
            throw new Error('Заявка не найдена.');
        }

        const { part, node, compatibleModifications } = payload;

        const brandSlug = ticket.carBrand
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-');

        const modelSlug = ticket.carModel
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-');

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

        const availableModIds = new Set(
            masterModel.modifications.map(mod => mod.id)
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

        const formattedPartArticle = formatArticle(
            part.article
        );

        const incomingOemCrosses = part.isOem
            ? []
            : getOemCrosses(part);

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
                id: `node_${Date.now()}`,
                brandSlug,
                modelSlug,
                title: targetTitle,
                category: node.category,
                compatibleModifications: [],
                items: []
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

                compatibleModifications: mergedModIds,

                isVerified: true,
                installationsCount:
                    existingPart.installationsCount + 1,
                compatibilityScore: 100
            };
        } else {
            targetNode.items.push({
                id: `part_${Date.now()}`,
                brand: part.brand.trim(),
                article: formattedPartArticle,
                name: part.name.trim(),
                isOem: part.isOem,

                oemCrosses: incomingOemCrosses,
                oemCross: incomingOemCrosses[0] ?? '',

                compatibleModifications: [...confirmedModIds],

                isVerified: true,
                installationsCount: 1,
                compatibilityScore: 100
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

        this.saveState({
            ...state,
            catalogNodes: newNodes,
            inbox: state.inbox.filter(
                item => item.id !== ticketId
            )
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