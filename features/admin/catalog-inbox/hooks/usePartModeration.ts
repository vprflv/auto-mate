
import * as React from 'react';

import { InboxItem } from '@/features/admin/lib/systemStore';
import { storage } from '@/features/admin/lib/system-store/storage';
import { StoredMasterModel } from '@/features/admin/lib/system-store/types';
import { normalizeArticle } from '@/features/admin/lib/system-store/normalizeArticle';
import { findCatalogOemSource } from '@/features/admin/catalog/lib/findCatalogOemSource';

import type { OemSuggestion } from '../components/part-moderation/OemCrossSelect';
import {toast} from "sonner";

import {uniqueInstallations} from "@/features/catalog/lib/partInstallations";
import { formatPartNameWithInstallation, stripPartInstallationFromName, suggestServicePartName } from '@/features/garage/add/lib/suggestServicePartName';

import {getPartCategoryWarning} from "@/features/admin/catalog-inbox/hooks/getPartCategoryWarning";
import {PartInstallation} from "@/types/partInstallation";
import type { CatalogBranch, CatalogPartPayload, PartCategory } from '@/types';
import type { CatalogSection } from '@/types/catalog/catalog';
import { useCatalogBranchDraft } from '@/features/admin/catalog/hooks/useCatalogBranchDraft';
import { catalogBranchKey, catalogBranchLabel, catalogBranchReference } from '@/features/admin/lib/system-store/catalogBranches';
import { getCatalogSection } from '@/features/catalog/lib/catalogSections';
import {getOemCrosses} from "@/features/admin/lib/system-store/oemCrosses";

interface UsePartModerationProps {
    item: InboxItem;
    isOpen: boolean;
    onApprove: (id: string, payload: CatalogPartPayload) => void;
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

    const [nameOverridden, setNameOverridden] =
        React.useState(false);

    const setNameOverride = (value: string) => {
        setNameOverridden(true);
        setName(value);
    };

    const [isOem, setIsOem] = React.useState(initialIsOem);
    const [oemCross, setOemCross] = React.useState('');

    const [branches, setBranches] = React.useState<CatalogBranch[] | null>(null);
    const [suggestedBranch, setSuggestedBranch] = React.useState<CatalogBranch | null>(null);
    const [sectionOverride, setSectionOverride] = React.useState<CatalogSection | null>(null);
    const detectedSection: CatalogSection | null =
        item.itemType === 'fluid' || item.itemType === 'Техническая жидкость' ? 'fluids' :
        item.itemType === 'part' || item.itemType === 'Запчасть / Расходник' ? 'parts' : null;
    const section: CatalogSection = sectionOverride ?? detectedSection ??
        (suggestedBranch ? getCatalogSection(suggestedBranch.category) : 'parts');
    const checkedBranches = branches ?? (suggestedBranch && getCatalogSection(suggestedBranch.category) === section
        ? [suggestedBranch] : []);
    const branchSelection = useCatalogBranchDraft(section, checkedBranches);
    const selectedBranches = branchSelection.branches;

    function setSection(nextSection: CatalogSection) {
        setSectionOverride(nextSection);
        setBranches([]);
        branchSelection.setDraft(null);
    }
    const nodeCategory = selectedBranches[0]?.category ?? '';
    const nodeTitle = selectedBranches[0]?.title ?? '';
    const selectedBranchKey = selectedBranches[0] ? catalogBranchKey(selectedBranches[0]) : '';

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
            catalogBranchKey(node) === selectedBranchKey;

        // 1. Собираем OEM-номера, которые уже используются как кроссы.
        for (const node of allNodes) {
            const sameNode = isSameNode(node);
            for (const part of node.items) {
                for (const article of getOemCrosses(part)) {
                    const key = normalizeArticle(article);
                    if (!key) continue;

                    const existing = suggestions.get(key);
                    if (!existing || (!existing.sameNode && sameNode)) {
                        suggestions.set(key, {
                            id: `cross:${key}`,
                            article,
                            brand: '',
                            name: '',
                            nodeTitle: catalogBranchLabel(node),
                            sameNode,
                            source: 'cross',
                        });
                    }
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
                        nodeTitle: catalogBranchLabel(node),
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
        selectedBranchKey,
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

    const canUpdateName =
        !nameOverridden &&
        Boolean(baseName) &&
        (
            !name.trim() ||
            stripPartInstallationFromName(name) === baseName
        );

    const subcategoryTitle = nodeTitle.trim().toLocaleLowerCase('ru');

    const suggestedName =
        subcategoryTitle === 'термостаты' ? 'Термостат' :
            subcategoryTitle === 'помпы' ? 'Помпа' :
                '';

    const selectedName = canUpdateName ? suggestedName || baseName : name;
    const displayName = section === 'fluids' ? selectedName : formatPartNameWithInstallation(selectedName, installation);

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

    const changeOemCross = (value: string) => {
        setOemCross(value);

        const key = normalizeArticle(value);
        if (!key || key === normalizeArticle(oemCross)) return;

        const catalogNodes = storage.getState().catalogNodes;
        const options = detectedSection || sectionOverride
            ? catalogNodes.filter(node => getCatalogSection(node.category) === section)
            : catalogNodes;
        const source = findCatalogOemSource(options, value, true, targetCar);
        if (!source) return;

        setNameOverride(source.part.name);
        setSuggestedBranch(catalogBranchReference(source.node));
    };

    const handleApprove = () => {
        if (branchSelection.validationMessage) {
            toast.error(branchSelection.validationMessage);
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
            nodes: selectedBranches,
            compatibleModifications: appliesToAll ? ['all'] : selectedIds,
            installationsByModification: Object.fromEntries(
                installationIds.map(modificationId => [
                    modificationId,
                    section !== 'fluids' && (installation.axle || installation.side)
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

                    return `• ${modelLabel} → ${catalogBranchLabel(node)}`;
                });

            const articleWarning = matchingSections.length > 0
                ? `Артикул «${article.trim()}» уже встречается в каталоге:\n${
                    [...new Set(matchingSections)].join('\n')
                }`
                : '';
            const destinationNode = catalogNodes.find(node =>
                node.brandSlug === targetCar.brandSlug &&
                node.modelSlug === targetCar.modelSlug &&
                selectedBranches.some(branch => catalogBranchKey(node) === catalogBranchKey(branch))
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
        setName: setNameOverride,

        isOem,
        setIsOem,

        oemCross,
        setOemCross: changeOemCross,
        oemSuggestions,

        section,
        setSection,
        branches: selectedBranches,
        checkedBranches,
        branchSelection,
        setBranches,
        categoryWarning,
        articleMatches,

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
