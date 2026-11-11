'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { CompatibilityBlock } from '@/features/admin/catalog-inbox/components/part-moderation/CompatibilityBlock';
import { NodeEditorBlock } from '@/features/admin/catalog-inbox/components/part-moderation/NodeEditorBlock';
import { PartEditorBlock } from '@/features/admin/catalog-inbox/components/part-moderation/PartEditorBlock';
import type { OemSuggestion } from '@/features/admin/catalog-inbox/components/part-moderation/OemCrossSelect';
import { getPartCategoryWarning } from '@/features/admin/catalog-inbox/hooks/getPartCategoryWarning';
import { storage } from '@/features/admin/lib/system-store/storage';
import { normalizeArticle } from '@/features/admin/lib/system-store/normalizeArticle';
import { getOemCrosses } from '@/features/admin/lib/system-store/oemCrosses';
import type { StoredMasterModel, StoredPartItem } from '@/features/admin/lib/system-store/types';
import { uniqueInstallations } from '@/features/catalog/lib/partInstallations';
import { formatPartNameWithInstallation } from '@/features/garage/add/lib/suggestServicePartName';
import type { PartInstallation } from '@/types/partInstallation';
import {PartInstallationFields} from "@/features/garage/components/PartInstallationFields";

const PART_NAMES_BY_SUBCATEGORY = new Map([
    ['термостаты', 'Термостат'],
    ['помпы', 'Помпа'],
    ['колодки', 'Колодки тормозные'],
    ['тормозные колодки', 'Колодки тормозные'],
    ['тормозные диски', 'Диск тормозной'],
    ['масляные фильтры', 'Фильтр масляный'],
    ['воздушные фильтры', 'Фильтр воздушный'],
    ['салонные фильтры', 'Фильтр салонный'],
    ['топливные фильтры', 'Фильтр топливный'],
    ['амортизаторы', 'Амортизатор'],
]);

const GENERIC_SUBCATEGORIES = new Set(['фильтры', 'прочее', 'другое']);

interface Props {
    model: StoredMasterModel;
    onClose: () => void;
}

function getBasePartName(part: StoredPartItem): string {
    const name = part.name.trim();
    const positions = part.installation
        ? [part.installation]
        : Object.values(part.installationsByModification ?? {}).flat();

    for (const position of uniqueInstallations(positions)) {
        if (name === formatPartNameWithInstallation('Диск тормозной', position)) {
            return 'Диск тормозной';
        }

        const suffix = formatPartNameWithInstallation('Деталь', position)
            .slice('Деталь'.length);

        if (name.endsWith(suffix)) {
            return name.slice(0, -suffix.length);
        }
    }

    return name;
}

export function AddCatalogPartModal({ model, onClose }: Props) {
    const [brand, setBrand] = useState('');
    const [article, setArticle] = useState('');
    const [manualName, setManualName] = useState<string | null>(null);
    const [isOem, setIsOem] = useState(false);
    const [oemCross, setOemCross] = useState('');
    const [installationOverride, setInstallationOverride] = useState<PartInstallation>({});

    const [nodeCategory, setNodeCategory] = useState('');
    const [nodeTitle, setNodeTitle] = useState('');
    const [isCustomNode, setIsCustomNode] = useState(false);

    const [compatibilityType, setCompatibilityType] =
        useState<'all' | 'specific'>('specific');
    const [selectedModIds, setSelectedModIds] = useState<string[]>([]);

    const [catalogNodes] = useState(() => storage.getState().catalogNodes);

    const subcategoryTitle = nodeTitle.trim();
    const subcategoryKey = subcategoryTitle.toLocaleLowerCase('ru');
    const categoryName =
        nodeCategory.trim() &&
        subcategoryKey !== nodeCategory.trim().toLocaleLowerCase('ru') &&
        !GENERIC_SUBCATEGORIES.has(subcategoryKey)
            ? PART_NAMES_BY_SUBCATEGORY.get(subcategoryKey) ?? subcategoryTitle
            : '';
    const oemNumber = normalizeArticle(isOem ? article : oemCross);
    const oemMatches = useMemo(() => {
        if (!oemNumber) return [];

        return catalogNodes.flatMap(node =>
            node.items
                .filter(part =>
                    part.isVerified === true &&
                    (part.isOem
                        ? normalizeArticle(part.article) === oemNumber
                        : getOemCrosses(part).some(number =>
                            normalizeArticle(number) === oemNumber
                        ))
                )
                .map(part => ({ node, part }))
        );
    }, [catalogNodes, oemNumber]);

    const originals = oemMatches.filter(({ part }) => part.isOem);
    const nameSources = originals.length > 0 ? originals : oemMatches;
    const oemNames = [...new Set(
        nameSources.map(({ part }) => getBasePartName(part)).filter(Boolean)
    )];

    const modelModifications = Array.isArray(model.modifications)
        ? model.modifications
        : [];
    const modificationIds = compatibilityType === 'all'
        ? modelModifications.map(modification => modification.id)
        : selectedModIds;
    const suggestionModIds = modificationIds.length > 0
        ? modificationIds
        : modelModifications.map(modification => modification.id);

    const localMatches = oemMatches.filter(({ node }) =>
        node.brandSlug === model.brandSlug && node.modelSlug === model.modelSlug
    );
    const positionsByModification = suggestionModIds.map(id =>
        uniqueInstallations(localMatches.flatMap(({ part }) => {
            const ids = part.compatibleModifications ?? [];
            if (!ids.includes('all') && !ids.includes(id)) {
                return [];
            }

            return part.installation
                ? [part.installation]
                : part.installationsByModification?.[id] ?? [];
        }))
    );
    const positions = uniqueInstallations(positionsByModification.flat());
    const suggestedInstallation =
        positions.length === 1 &&
        positionsByModification.every(items => items.length > 0)
            ? positions[0]
            : undefined;
    const installation = { ...suggestedInstallation, ...installationOverride };
    const name = manualName ?? formatPartNameWithInstallation(
        oemNames.length === 1 ? oemNames[0] : categoryName,
        installation
    );

    const oemSuggestions = useMemo(() => {
        const suggestions: OemSuggestion[] = [];

        for (const node of catalogNodes) {
            const sameNode =
                node.brandSlug === model.brandSlug &&
                node.modelSlug === model.modelSlug &&
                node.category === nodeCategory &&
                node.title.trim().toLocaleLowerCase('ru') === subcategoryKey;

            for (const part of node.items) {
                if (part.isOem) {
                    suggestions.push({
                        id: `original:${node.id}:${part.id}`,
                        article: part.article,
                        brand: part.brand,
                        name: part.name,
                        nodeTitle: node.title,
                        sameNode,
                        source: 'catalog',
                    });
                }

                for (const number of getOemCrosses(part)) {
                    suggestions.push({
                        id: `cross:${node.id}:${part.id}:${number}`,
                        article: number,
                        brand: '',
                        name: '',
                        nodeTitle: node.title,
                        sameNode,
                        source: 'cross',
                    });
                }
            }
        }

        return suggestions;
    }, [catalogNodes, model.brandSlug, model.modelSlug, nodeCategory, subcategoryKey]);

    const originalNumber = isOem ? normalizeArticle(article) : '';
    const existingOriginal = originalNumber
        ? oemSuggestions.find(item =>
            item.source === 'catalog' &&
            normalizeArticle(item.article) === originalNumber
        )
        : undefined;

    const existingCategories = [...new Set(
        catalogNodes.map(node => node.category).filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, 'ru'));

    const existingNodes = [...new Set(
        catalogNodes
            .filter(node =>
                node.brandSlug === model.brandSlug &&
                node.modelSlug === model.modelSlug &&
                node.category === nodeCategory
            )
            .map(node => node.title)
    )];

    const categoryWarning = getPartCategoryWarning(name, nodeCategory);

    const articleKey = normalizeArticle(article);

    const duplicateSections = articleKey
        ? [...new Set(
            catalogNodes
                .filter(node => node.items.some(
                    part => normalizeArticle(part.article) === articleKey
                ))
                .map(node => {
                    const isCurrentModel =
                        node.brandSlug === model.brandSlug &&
                        node.modelSlug === model.modelSlug;

                    const modelLabel = isCurrentModel
                        ? `${model.brandName} ${model.modelName}`
                        : `${node.brandSlug} ${node.modelSlug}`;

                    return `• ${modelLabel} → ${node.title}`;
                })
        )]
        : [];

    const duplicateWarning = duplicateSections.length > 0
        ? `Артикул «${article.trim()}» уже встречается в каталоге:\n${
            duplicateSections.join('\n')
        }`
        : '';

    const warning = [categoryWarning, duplicateWarning].filter(Boolean).join('\n');

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const installationsByModification =
            installation.axle || installation.side
                ? Object.fromEntries(
                    modificationIds.map(id => [id, [installation]])
                )
                : {};

        if (
            warning &&
            !window.confirm(
                `${warning}\n\nДобавить деталь в выбранную подкатегорию?`
            )
        ) {
            return;
        }

        try {
            storage.addCatalogPart(model.brandSlug, model.modelSlug, {
                part: {
                    brand,
                    article,
                    name,
                    isOem,
                    oemCross: isOem ? '' : oemCross.trim(),
                },
                node: {
                    category: nodeCategory.trim(),
                    title: nodeTitle.trim(),
                },
                compatibleModifications: compatibilityType === 'all'
                    ? ['all']
                    : selectedModIds,
                installationsByModification,
            });
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Не удалось добавить запчасть в каталог.'
            );
            return;
        }

        onClose();
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <form
                role="dialog"
                aria-modal="true"
                aria-label="Добавить запчасть"
                onSubmit={handleSubmit}
                className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-3xl bg-[var(--card)] p-6"
            >
                <div>
                    <h2 className="text-lg font-bold">Добавить запчасть</h2>
                    <p className="text-sm text-[var(--text-muted)]">
                        {model.brandName} {model.modelName}
                    </p>
                </div>

                <PartEditorBlock
                    brand={brand}
                    setBrand={setBrand}
                    article={article}
                    setArticle={setArticle}
                    name={name}
                    setName={setManualName}
                    isOem={isOem}
                    setIsOem={setIsOem}
                    oemCross={oemCross}
                    setOemCross={setOemCross}
                    oemSuggestions={oemSuggestions}
                />

                {existingOriginal && (
                    <p role="status" className="text-sm text-[var(--text-muted)]">
                        OEM {existingOriginal.article} уже есть в каталоге.
                    </p>
                )}

                <PartInstallationFields
                    partName={name}
                    value={installation}
                    onChange={patch => {
                        setInstallationOverride(previous => ({ ...previous, ...patch }));
                    }}
                />

                <NodeEditorBlock
                    nodeCategory={nodeCategory}
                    setNodeCategory={setNodeCategory}
                    nodeTitle={nodeTitle}
                    setNodeTitle={setNodeTitle}
                    existingCategories={existingCategories}
                    existingNodes={existingNodes}
                    isCustomNode={isCustomNode}
                    setIsCustomNode={setIsCustomNode}
                />

                {warning && (
                    <p
                        role="alert"
                        className="whitespace-pre-line rounded-xl bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400"
                    >
                        {warning}
                    </p>
                )}

                <CompatibilityBlock
                    targetCar={model}
                    compatibilityType={compatibilityType}
                    setCompatibilityType={setCompatibilityType}
                    selectedModIds={selectedModIds}
                    setSelectedModIds={setSelectedModIds}
                />

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        className="rounded-xl bg-[var(--btn-primary)] px-4 py-2 text-sm font-semibold text-[var(--btn-primary-text)]"
                    >
                        Добавить в каталог
                    </button>
                </div>
            </form>
        </div>
    );
}
