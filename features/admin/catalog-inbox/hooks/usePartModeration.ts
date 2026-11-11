
import * as React from 'react';

import { InboxItem } from '@/features/admin/lib/systemStore';
import { storage } from '@/features/admin/lib/system-store/storage';
import { StoredMasterModel } from '@/features/admin/lib/system-store/types';
import { normalizeArticle } from '@/features/admin/lib/system-store/normalizeArticle';

import type { OemSuggestion } from '../components/part-moderation/OemCrossSelect';
import {toast} from "sonner";

import {uniqueInstallations} from "@/features/catalog/lib/partInstallations";
import {formatPartNameWithInstallation, suggestServicePartName} from "@/features/garage/add/lib/suggestServicePartName";

import {getPartCategoryWarning} from "@/features/admin/catalog-inbox/hooks/getPartCategoryWarning";
import {PartInstallation} from "@/types/partInstallation";
import {PartCategory} from "@/types";
import {getOemCrosses} from "@/features/admin/lib/system-store/oemCrosses";

interface UsePartModerationProps {
    item: InboxItem;
    isOpen: boolean;
    onApprove: (id: string, payload: any) => void;
    onReject: (id: string) => void;
    requestApprovalConfirmation?: (
        message: string,
        approve: () => void,
        approveLabel: string
    ) => void;
}

const asString = (value: unknown): string =>
    typeof value === 'string' ? value : '';

const asBoolean = (value: unknown): boolean =>
    typeof value === 'boolean' ? value : false;

export function usePartModeration({
                                      item,
                                      isOpen,
                                      onApprove,
                                      onReject,
                                      requestApprovalConfirmation,
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

    const [nameEditedManually, setNameEditedManually] =
        React.useState(false);

    const setNameManually = (value: string) => {
        setNameEditedManually(true);
        setName(value);
    };

    const [isOem, setIsOem] = React.useState(initialIsOem);
    const [oemCross, setOemCross] = React.useState('');

    const [nodeCategory, setNodeCategory] =
        React.useState('');

    const [nodeTitle, setNodeTitle] = React.useState('');
    const [isCustomNode, setIsCustomNode] = React.useState(false);

    const [compatibilityType, setCompatibilityType] =
        React.useState<'all' | 'specific'>('specific');

    const [selectedModIds, setSelectedModIds] =
        React.useState<string[]>([]);

    const [installation, setInstallation] =
        React.useState<PartInstallation>(
            item.proposedInstallation ?? {}
        );

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

    const existingCategories = React.useMemo(() => {
        if (!isOpen) return [];

        const categories = storage.getState().catalogNodes
            .map(node => node.category.trim())
            .filter(Boolean);

        return [...new Set(categories)]
            .sort((a, b) => a.localeCompare(b, 'ru'));
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


    React.useEffect(() => {
        if (!isOpen) return;

        if (item.proposedInstallation || !targetCar) {
            setInstallation(item.proposedInstallation ?? {});
            return;
        }

        const state = storage.getState();
        const result: PartInstallation[] = [];

        for (const node of state.catalogNodes) {
            if (
                node.brandSlug !== targetCar.brandSlug ||
                node.modelSlug !== targetCar.modelSlug
            ) {
                continue;
            }

            for (const part of node.items) {
                if (
                    part.brand.trim().toLowerCase() !== brand.trim().toLowerCase() ||
                    normalizeArticle(part.article) !== normalizeArticle(article)
                ) {
                    continue;
                }

                if (part.installation) {
                    result.push(part.installation);
                } else {
                    result.push(
                        ...Object.values(part.installationsByModification ?? {}).flat()
                    );
                }
            }
        }

        const positions = uniqueInstallations(result);
        setInstallation(positions.length === 1 ? (positions[0] ?? {}) : {});
    }, [
        isOpen,
        item.id,
        item.proposedInstallation,
        targetCar?.brandSlug,
        targetCar?.modelSlug,
        brand,
        article,
    ]);



    const baseName = item.category
        ? suggestServicePartName({
            itemType: 'part',
            partCategory: item.category as PartCategory,
            subcategory: item.subcategory || 'other',
            fluidCategory: 'engineOil',
        })
        : '';

    const originalAutomaticName =
        formatPartNameWithInstallation(
            baseName,
            item.proposedInstallation ?? {}
        );

    const canUpdateName =
        !nameEditedManually &&
        Boolean(baseName) &&
        (
            !name.trim() ||
            name === baseName ||
            name === originalAutomaticName
        );

    const subcategoryTitle = nodeTitle.trim().toLocaleLowerCase('ru');

    const suggestedName =
        subcategoryTitle === 'термостаты' ? 'Термостат' :
            subcategoryTitle === 'помпы' ? 'Помпа' :
                '';

    const displayName = canUpdateName
        ? formatPartNameWithInstallation(
            suggestedName || baseName,
            installation
        )
        : name;

    const categoryWarning = getPartCategoryWarning(
        displayName,
        nodeCategory
    );

    const articleMatches = React.useMemo(() => {
        const articleKey = normalizeArticle(article);
        if (!isOpen || !articleKey) return [];

        const { catalogNodes, masterModels } = storage.getState();

        return catalogNodes.flatMap(node => {
            const model = masterModels.find(item =>
                item.brandSlug === node.brandSlug &&
                item.modelSlug === node.modelSlug
            );

            return node.items
                .filter(part => normalizeArticle(part.article) === articleKey)
                .map(part => ({ node, part, model }));
        });
    }, [isOpen, article]);

    const handleApprove = () => {
        const category = nodeCategory.trim();
        const title = nodeTitle.trim();

        if (!category) {
            toast.error('Выберите категорию или введите название новой.');
            return;
        }

        if (!brand.trim() || !article.trim() || !displayName.trim()) {
            toast.error('Укажите производителя, артикул и название детали.');
            return;
        }

        if (!isOem && !oemCross.trim()) {
            toast.error(
                'Укажите связанный OEM-номер в поле «Привязка к оригиналу (OEM Кросс)».'
            );
            return;
        }

        if (!targetCar) {
            toast.error('Сначала добавьте модель автомобиля в эталонный каталог.');
            return;
        }

        const selectedIds = [...new Set(selectedModIds)];
        const modifications = Array.isArray(targetCar.modifications)
            ? targetCar.modifications
            : [];

        if (compatibilityType === 'specific') {
            if (selectedIds.length === 0) {
                toast.error('Выберите хотя бы одну модификацию автомобиля.');
                return;
            }

            const availableIds = new Set(
                modifications.map(modification => modification.id)
            );

            if (selectedIds.some(id => !availableIds.has(id))) {
                toast.error('Список модификаций изменился. Проверьте выбранные варианты.');
                return;
            }
        }

        if (!title) {
            toast.error('Выберите или создайте подраздел каталога. Например, «Фильтры».');
            return;
        }

        const appliesToAll = compatibilityType === 'all';
        const installationIds = appliesToAll
            ? modifications.map(modification => modification.id)
            : selectedIds;

        const payload = {
            part: {
                brand: brand.trim(),
                article: article.trim(),
                name: displayName.trim(),
                isOem,
                oemCross: isOem ? '' : oemCross.trim(),
            },
            node: { category, title },
            compatibleModifications: appliesToAll ? ['all'] : selectedIds,
            installationsByModification: Object.fromEntries(
                installationIds.map(modificationId => [
                    modificationId,
                    installation.axle || installation.side
                        ? [{ ...installation }]
                        : [],
                ])
            ),
        };

        const showApprovalError = (error: unknown) => {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Не удалось добавить запчасть в каталог.'
            );
        };

        const approve = () => {
            try {
                onApprove(item.id, payload);
            } catch (error: unknown) {
                showApprovalError(error);
            }
        };

        try {
            const articleKey = normalizeArticle(article);
            const { catalogNodes, masterModels } = storage.getState();

            const matchingSections = catalogNodes
                .filter(node =>
                    articleKey &&
                    node.items.some(part =>
                        normalizeArticle(part.article) === articleKey
                    )
                )
                .map(node => {
                    const model = masterModels.find(item =>
                        item.brandSlug === node.brandSlug &&
                        item.modelSlug === node.modelSlug
                    );

                    const modelLabel = model
                        ? `${model.brandName} ${model.modelName}`
                        : `${node.brandSlug} ${node.modelSlug}`;

                    return `• ${modelLabel} → ${node.title}`;
                });

            const articleWarning = matchingSections.length > 0
                ? `Артикул «${article.trim()}» уже встречается в каталоге:\n${
                    [...new Set(matchingSections)].join('\n')
                }`
                : '';
            const destinationNode = catalogNodes.find(node =>
                node.brandSlug === targetCar.brandSlug &&
                node.modelSlug === targetCar.modelSlug &&
                node.category === category &&
                node.title.trim().toLowerCase() === title.toLowerCase()
            );

            const existingPart = destinationNode?.items.find(part =>
                part.brand.trim().toUpperCase() === brand.trim().toUpperCase() &&
                normalizeArticle(part.article) === articleKey
            );

            const incomingOem = oemCross.trim();
            const incomingOemKey = normalizeArticle(incomingOem);
            const currentOemNumbers = existingPart ? getOemCrosses(existingPart) : [];

            const addsOemLink = Boolean(
                existingPart &&
                !isOem &&
                incomingOemKey &&
                !currentOemNumbers.some(number => normalizeArticle(number) === incomingOemKey)
            );

            const oemLinkWarning = addsOemLink
                ? [
                    currentOemNumbers.length > 0
                        ? `Сейчас привязаны OEM: ${currentOemNumbers.join(', ')}.`
                        : 'У существующей записи пока нет связанных OEM.',
                    `После одобрения к этой записи добавится OEM «${incomingOem}».`,
                ].join('\n')
                : '';

            const warning = [categoryWarning, articleWarning, oemLinkWarning]
                .filter(Boolean)
                .join('\n\n');



            if (warning) {
                const message = `${warning}\n\nОдобрить заявку и сохранить деталь?`;

                if (requestApprovalConfirmation) {
                    requestApprovalConfirmation(
                        message,
                        approve,
                        addsOemLink ? 'Одобрить и добавить OEM-связь' : 'Всё равно одобрить'
                    );
                    return;
                }

                if (!window.confirm(message)) return;
            }

            approve();
        } catch (error: unknown) {
            showApprovalError(error);
        }
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

        name: displayName,
        setName: setNameManually,

        isOem,
        setIsOem,

        oemCross,
        setOemCross,
        oemSuggestions,

        nodeCategory,
        categoryWarning,
        articleMatches,
        setNodeCategory,

        nodeTitle,
        setNodeTitle,

        existingNodes,
        existingCategories,

        isCustomNode,
        setIsCustomNode,

        compatibilityType,
        setCompatibilityType,

        selectedModIds,
        setSelectedModIds,

        installation,
        setInstallation,

        handleApprove,
        handleReject
    };
}
