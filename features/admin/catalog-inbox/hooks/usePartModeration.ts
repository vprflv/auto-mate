
import * as React from 'react';

import { InboxItem } from '@/features/admin/lib/systemStore';
import { storage } from '@/features/admin/lib/system-store/storage';
import { StoredMasterModel } from '@/features/admin/lib/system-store/types';
import { normalizeArticle } from '@/features/admin/lib/system-store/normalizeArticle';

import type { OemSuggestion } from '../components/part-moderation/OemCrossSelect';

interface UsePartModerationProps {
    item: InboxItem;
    isOpen: boolean;
    onApprove: (id: string, payload: any) => void;
    onReject: (id: string) => void;
}

const asString = (value: unknown): string =>
    typeof value === 'string' ? value : '';

const asBoolean = (value: unknown): boolean =>
    typeof value === 'boolean' ? value : false;

export function usePartModeration({
                                      item,
                                      isOpen,
                                      onApprove,
                                      onReject
                                  }: UsePartModerationProps) {

    // Исходные данные пользовательского тикета
    const initialBrand = asString(
        item.partBrand ||
        item.partSpecs?.brand ||
        (item as any).specs?.brand
    );

    const initialArticle = asString(
        item.partArticle ||
        item.partSpecs?.article ||
        (item as any).specs?.article
    );

    const initialName = asString(
        item.partName ||
        item.partSpecs?.name ||
        (item as any).specs?.name
    );

    const initialIsOem = asBoolean(
        item.isOem ??
        item.partSpecs?.isOem ??
        (item as any).specs?.isOem ??
        false
    );

    // Состояния модерации
    const [targetCar, setTargetCar] =
        React.useState<StoredMasterModel | null>(null);

    const [brand, setBrand] = React.useState(initialBrand);
    const [article, setArticle] = React.useState(initialArticle);
    const [name, setName] = React.useState(initialName);

    const [isOem, setIsOem] = React.useState(initialIsOem);
    const [oemCross, setOemCross] = React.useState('');

    const [nodeCategory, setNodeCategory] =
        React.useState('service');

    const [nodeTitle, setNodeTitle] = React.useState('');
    const [isCustomNode, setIsCustomNode] = React.useState(false);

    const [compatibilityType, setCompatibilityType] =
        React.useState<'all' | 'specific'>('all');

    const [selectedModIds, setSelectedModIds] =
        React.useState<string[]>([]);

    // Определяем автомобиль тикета
    React.useEffect(() => {
        if (!isOpen) return;

        const state = storage.getState();

        const car = state.masterModels.find(
            model =>
                model.brandName.toLowerCase() ===
                (item.carBrand || '').toLowerCase() &&
                model.modelName.toLowerCase() ===
                (item.carModel || '').toLowerCase()
        );

        setTargetCar(car || null);
    }, [isOpen, item]);

    // Блокируем прокрутку страницы при открытой модалке
    React.useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    // Существующие узлы выбранного автомобиля и категории
    const existingNodes = React.useMemo(() => {
        const state = storage.getState();

        const brandSlug = (item.carBrand || '')
            .toLowerCase()
            .replace(/\s+/g, '-');

        const modelSlug = (item.carModel || '')
            .toLowerCase()
            .replace(/\s+/g, '-');

        const nodes = state.catalogNodes.filter(node =>
            node.brandSlug === brandSlug &&
            node.modelSlug === modelSlug &&
            node.category === nodeCategory
        );

        return Array.from(
            new Set(nodes.map(node => node.title))
        );
    }, [
        item.carBrand,
        item.carModel,
        nodeCategory,
        isOpen
    ]);

    // Глобальный поиск OEM по всему мастер-каталогу
    const oemSuggestions = React.useMemo<OemSuggestion[]>(() => {
        if (!isOpen || isOem) return [];

        const state = storage.getState();
        const query = normalizeArticle(oemCross);

        const suggestions = new Map<string, OemSuggestion>();

        // ВАЖНО: больше не ограничиваем поиск моделью
        const allNodes = state.catalogNodes;

        const currentBrandSlug = (item.carBrand || '')
            .toLowerCase()
            .replace(/\s+/g, '-');

        const currentModelSlug = (item.carModel || '')
            .toLowerCase()
            .replace(/\s+/g, '-');

        const isSameNode = (
            node: (typeof allNodes)[number]
        ): boolean =>
            node.brandSlug === currentBrandSlug &&
            node.modelSlug === currentModelSlug &&
            node.category === nodeCategory &&
            node.title.trim().toLowerCase() ===
            nodeTitle.trim().toLowerCase();

        // 1. Собираем оригинальные номера из кроссов аналогов
        for (const node of allNodes) {
            for (const part of node.items) {
                if (part.isOem || !part.oemCross?.trim()) {
                    continue;
                }

                const article = part.oemCross.trim();
                const key = normalizeArticle(article);

                if (!key) continue;

                const sameNode = isSameNode(node);
                const existing = suggestions.get(key);

                if (
                    !existing ||
                    (!existing.sameNode && sameNode)
                ) {
                    suggestions.set(key, {
                        id: `cross:${key}`,
                        article,
                        brand: '',
                        name: '',
                        nodeTitle: node.title,
                        sameNode,
                        source: 'cross'
                    });
                }
            }
        }

        // 2. Собираем созданные оригинальные детали
        for (const node of allNodes) {
            for (const part of node.items) {
                if (!part.isOem || !part.article.trim()) {
                    continue;
                }

                const key = normalizeArticle(part.article);

                if (!key) continue;

                const sameNode = isSameNode(node);
                const existing = suggestions.get(key);

                // Созданный OEM важнее номера из кроссов
                if (
                    !existing ||
                    existing.source === 'cross' ||
                    (!existing.sameNode && sameNode)
                ) {
                    suggestions.set(key, {
                        id: `catalog:${key}`,
                        article: part.article,
                        brand: part.brand,
                        name: part.name,
                        nodeTitle: node.title,
                        sameNode,
                        source: 'catalog'
                    });
                }
            }
        }

        // 3. Фильтрация и сортировка
        return Array.from(suggestions.values())
            .filter(suggestion =>
                !query ||
                normalizeArticle(suggestion.article).includes(query)
            )
            .sort((a, b) =>
                Number(b.sameNode) - Number(a.sameNode) ||
                Number(b.source === 'catalog') -
                Number(a.source === 'catalog') ||
                a.article.localeCompare(b.article)
            )
            .slice(0, 5);

    }, [
        isOpen,
        isOem,
        oemCross,
        nodeCategory,
        nodeTitle,
        item.carBrand,
        item.carModel
    ]);

    // Подтверждение модерации
    const handleApprove = () => {
        const payload = {
            part: {
                brand: brand.trim(),
                article: article.trim(),
                name: name.trim(),
                isOem,
                oemCross: isOem ? '' : oemCross.trim()
            },
            node: {
                category: nodeCategory,
                title: nodeTitle.trim() || name.trim()
            },
            compatibleModifications:
                compatibilityType === 'all'
                    ? ['all']
                    : selectedModIds
        };

        onApprove(item.id, payload);
    };

    const handleReject = () => onReject(item.id);

    return {
        incomingData: {
            brand: initialBrand,
            article: initialArticle,
            name: initialName
        },

        targetCar,

        brand,
        setBrand,

        article,
        setArticle,

        name,
        setName,

        isOem,
        setIsOem,

        oemCross,
        setOemCross,
        oemSuggestions,

        nodeCategory,
        setNodeCategory,

        nodeTitle,
        setNodeTitle,

        existingNodes,

        isCustomNode,
        setIsCustomNode,

        compatibilityType,
        setCompatibilityType,

        selectedModIds,
        setSelectedModIds,

        handleApprove,
        handleReject
    };
}
