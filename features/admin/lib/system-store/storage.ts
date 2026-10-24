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

    approvePartTicket(ticketId: string, payload: any) {
        const state = this.getState();
        const ticket = state.inbox.find(t => t.id === ticketId);
        if (!ticket) return;

        // Генерируем slug'и для связи с мастер-моделью
        const brandSlug = ticket.carBrand.toLowerCase().replace(/\s+/g, '-');
        const modelSlug = ticket.carModel.toLowerCase().replace(/\s+/g, '-');

        const { part, node, compatibleModifications } = payload;

        const normalizedPartArticle = normalizeArticle(part.article);

        if (!normalizedPartArticle) return;

        const formattedPartArticle = formatArticle(part.article);
        const incomingOemCrosses = part.isOem
            ? []
            : getOemCrosses(part);

        // Ищем существующий узел
        const existingNodeIndex = state.catalogNodes.findIndex(n =>
            n.brandSlug === brandSlug &&
            n.modelSlug === modelSlug &&
            n.category === node.category &&
            n.title.toLowerCase() === node.title.toLowerCase()
        );

        let newNodes = [...state.catalogNodes];
        let targetNode: StoredCatalogNode;

        // Если узел есть - обновляем его, если нет - создаем новый
        if (existingNodeIndex >= 0) {
            targetNode = { ...newNodes[existingNodeIndex] };

            // Сливаем массивы совместимостей без дублей
            if (compatibleModifications.includes('all')) {
                targetNode.compatibleModifications = ['all'];
            } else if (!targetNode.compatibleModifications.includes('all')) {
                const mergedMods = new Set([...targetNode.compatibleModifications, ...compatibleModifications]);
                targetNode.compatibleModifications = Array.from(mergedMods);
            }
        } else {
            targetNode = {
                id: `node_${Date.now()}`,
                brandSlug,
                modelSlug,
                title: node.title,
                category: node.category,
                compatibleModifications,
                items: []
            };
        }

        // Ищем, есть ли уже такая деталь в этом узле
        const existingPartIndex = targetNode.items.findIndex(
            p =>
                p.brand.trim().toUpperCase() ===
                part.brand.trim().toUpperCase() &&
                normalizeArticle(p.article) === normalizedPartArticle
        );

        if (existingPartIndex >= 0) {

            const mergedOemCrosses = uniqueOemCrosses([
                ...getOemCrosses(targetNode.items[existingPartIndex]),
                ...incomingOemCrosses
            ]);

            // Деталь уже есть -> обновляем данные и плюсуем счетчик доверия
            targetNode.items[existingPartIndex] = {
                ...targetNode.items[existingPartIndex],
                name: part.name,
                isOem: part.isOem,
                oemCrosses: mergedOemCrosses,
                oemCross: mergedOemCrosses[0] ?? '',
                isVerified: true,
                installationsCount:
                    targetNode.items[existingPartIndex].installationsCount + 1,
                compatibilityScore: 100
            };
        } else {
            // Новая деталь -> кладем в узел
            targetNode.items.push({
                id: `part_${Date.now()}`,
                brand: part.brand,
                article: formattedPartArticle,
                name: part.name,
                isOem: part.isOem,
                oemCrosses: incomingOemCrosses,
                oemCross: incomingOemCrosses[0] ?? '',
                isVerified: true,
                installationsCount: 1,
                compatibilityScore: 100
            });
        }

        // Возвращаем обновленный узел в массив
        if (existingNodeIndex >= 0) {
            newNodes[existingNodeIndex] = targetNode;
        } else {
            newNodes.push(targetNode);
        }

        // Удаляем тикет из очереди
        const newInbox = state.inbox.filter(t => t.id !== ticketId);

        // Сохраняем весь новый стейт
        this.saveState({
            ...state,
            catalogNodes: newNodes,
            inbox: newInbox
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