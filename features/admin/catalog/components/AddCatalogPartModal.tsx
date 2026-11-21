'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { CompatibilityBlock } from '@/features/admin/catalog-inbox/components/part-moderation/CompatibilityBlock';
import { CatalogBranchesPicker } from './CatalogBranchesPicker';
import { FluidBranchPreview } from './FluidBranchPreview';
import { catalogBranchKey } from '@/features/admin/lib/system-store/catalogBranches';
import type { CatalogBranch } from '@/types';
import { PartEditorBlock } from '@/features/admin/catalog-inbox/components/part-moderation/PartEditorBlock';
import type { OemSuggestion } from '@/features/admin/catalog-inbox/components/part-moderation/OemCrossSelect';
import { getPartCategoryWarning } from '@/features/admin/catalog-inbox/hooks/getPartCategoryWarning';
import { storage } from '@/features/admin/lib/system-store/storage';
import { normalizeArticle } from '@/features/admin/lib/system-store/normalizeArticle';
import { getOemCrosses } from '@/features/admin/lib/system-store/oemCrosses';
import type { StoredMasterModel } from '@/features/admin/lib/system-store/types';
import { findCatalogOemSource } from '@/features/admin/catalog/lib/findCatalogOemSource';
import { uniqueInstallations } from '@/features/catalog/lib/partInstallations';
import { formatPartNameWithInstallation } from '@/features/garage/add/lib/suggestServicePartName';
import type { PartInstallation } from '@/types/partInstallation';
import {PartInstallationFields} from "@/features/garage/components/PartInstallationFields";

import type { CatalogSection } from '@/types/catalog/catalog';
import { getCatalogSection } from '@/features/catalog/lib/catalogSections';

interface Props {
    model: StoredMasterModel;
    section: CatalogSection;
    onClose: () => void;
}



export function AddCatalogPartModal({ model, section, onClose }: Props) {
    const isFluids = section === 'fluids';
    const addTitle = isFluids ? 'Добавить жидкость' : 'Добавить запчасть';
    const [brand, setBrand] = useState('');
    const [article, setArticle] = useState('');
    const [manualName, setManualName] = useState<string | null>(null);
    const [showRequiredFields, setShowRequiredFields] = useState(false);
    const [confidence, setConfidence] = useState('90');
    const [isOem, setIsOem] = useState(false);
    const [oemCross, setOemCross] = useState('');
    const [installationOverride, setInstallationOverride] = useState<PartInstallation>({});

    const [branches, setBranches] = useState<CatalogBranch[] | null>(null);

    const [compatibilityType, setCompatibilityType] =
        useState<'all' | 'specific'>('specific');
    const [selectedModIds, setSelectedModIds] = useState<string[]>([]);
    const [hasAutomaticCompatibility, setHasAutomaticCompatibility] = useState(false);

    const [catalogNodes] = useState(() => storage.getState().catalogNodes.filter(node => getCatalogSection(node.category) === section));

    const source = findCatalogOemSource(catalogNodes, isOem ? article : oemCross, !isOem, model);
    const selectedBranches = branches ?? (source ? [{ category: source.node.category, title: source.node.title }] : []);
    const oemNumber = normalizeArticle(isOem ? article : oemCross);
    const oemMatches = useMemo(() => {
        if (!oemNumber) return [];

        return catalogNodes.flatMap(node =>
            node.items
                .filter(part =>
                    part.isVerified === true &&
                    ((part.isOem && normalizeArticle(part.article) === oemNumber) ||
                        getOemCrosses(part).some(number =>
                            normalizeArticle(number) === oemNumber
                        ))
                )
                .map(part => ({ node, part }))
        );
    }, [catalogNodes, oemNumber]);

    const modelModifications = Array.isArray(model.modifications)
        ? model.modifications
        : [];

    function applyOemCompatibility(value: string) {
        const number = normalizeArticle(value);
        const originalIds = new Set<string>();
        const crossIds = new Set<string>();
        const modelIds = new Set(modelModifications.map(modification => modification.id));

        if (number) {
            for (const node of catalogNodes) {
                if (node.brandSlug !== model.brandSlug || node.modelSlug !== model.modelSlug) {
                    continue;
                }

                for (const part of node.items) {
                    if (part.isVerified === false) continue;

                    const matchesOriginal = part.isOem && normalizeArticle(part.article) === number;
                    const matchesCross = getOemCrosses(part).some(
                        cross => normalizeArticle(cross) === number
                    );
                    if (!matchesOriginal && !matchesCross) continue;

                    const targetIds = part.isOem ? originalIds : crossIds;
                    for (const id of part.compatibleModifications ?? []) {
                        if (id === 'all' || modelIds.has(id)) targetIds.add(id);
                    }
                }
            }
        }

        const matchingIds = originalIds.size > 0 ? originalIds : crossIds;
        const appliesToAll = matchingIds.has('all');
        const ids = modelModifications
            .map(modification => modification.id)
            .filter(id => matchingIds.has(id));
        const hasMatch = appliesToAll || ids.length > 0;
        if (!hasMatch && !hasAutomaticCompatibility) return;

        setCompatibilityType(appliesToAll ? 'all' : 'specific');
        setSelectedModIds(appliesToAll ? [] : ids);
        setHasAutomaticCompatibility(hasMatch);
    }
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
    const nameSource = source?.part;
    const sourcePositions = uniqueInstallations(
        Object.values(nameSource?.installationsByModification ?? {}).flat()
    );
    const commonPosition = uniqueInstallations(
        nameSource?.installation ? [nameSource.installation] : []
    )[0];
    const suggestedInstallation =
        commonPosition ??
        (positions.length === 1 &&
        positionsByModification.every(items => items.length > 0)
            ? positions[0]
            : undefined) ??
        (!isOem && sourcePositions.length === 1 ? sourcePositions[0] : undefined);
    const installation = isFluids ? {} : { ...suggestedInstallation, ...installationOverride };
    const suggestedName = formatPartNameWithInstallation(nameSource?.name ?? '', installation);
    const name = formatPartNameWithInstallation(manualName ?? nameSource?.name ?? '', installation);

    const oemSuggestions = useMemo(() => {
        const suggestions: OemSuggestion[] = [];
        const selectedKeys = new Set(selectedBranches.map(catalogBranchKey));

        for (const node of catalogNodes) {
            const sameNode =
                node.brandSlug === model.brandSlug &&
                node.modelSlug === model.modelSlug &&
                selectedKeys.has(catalogBranchKey(node));

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
    }, [catalogNodes, model.brandSlug, model.modelSlug, selectedBranches]);

    const originalNumber = isOem ? normalizeArticle(article) : '';
    const existingOriginal = originalNumber
        ? oemSuggestions.find(item =>
            item.source === 'catalog' &&
            normalizeArticle(item.article) === originalNumber
        )
        : undefined;

    const categoryWarnings = [...new Set(selectedBranches.map(branch => getPartCategoryWarning(name, branch.category)).filter(Boolean))];

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

    const warning = [...categoryWarnings, duplicateWarning].filter(Boolean).join('\n');

    const missingFields = [
        selectedBranches.length === 0 && 'ветки каталога',
        !brand.trim() && 'бренд',
        !normalizeArticle(article) && 'артикул',
        !name.trim() && 'эталонное название',
        !confidence.trim() && 'индекс доверия',
        !isOem && !normalizeArticle(oemCross) && 'привязка к оригиналу (OEM-кросс)',
        compatibilityType === 'specific' && selectedModIds.length === 0 && 'применимость',
    ].filter(Boolean);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (missingFields.length > 0) {
            setShowRequiredFields(true);
            return;
        }

        const installationsByModification =
            installation.axle || installation.side
                ? Object.fromEntries(
                    modificationIds.map(id => [id, [installation]])
                )
                : {};

        if (
            warning &&
            !window.confirm(
                `${warning}\n\nДобавить позицию в выбранные ветки?`
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
                    compatibilityScore: Number(confidence),
                },
                nodes: selectedBranches,
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
                aria-label={addTitle}
                onSubmit={handleSubmit}
                className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-3xl bg-[var(--card)] p-6"
            >
                <div>
                    <h2 className="text-lg font-bold">{addTitle}</h2>
                    <p className="text-sm text-[var(--text-muted)]">
                        {model.brandName} {model.modelName}
                    </p>
                </div>

                <CatalogBranchesPicker section={section} value={selectedBranches} onChange={setBranches} />

                <PartEditorBlock
                    brand={brand}
                    setBrand={setBrand}
                    article={article}
                    setArticle={setArticle}
                    name={name}
                    setName={setManualName}
                    isOem={isOem}
                    setIsOem={value => {
                        setIsOem(value);
                        applyOemCompatibility(value ? '' : oemCross);
                    }}
                    oemCross={oemCross}
                    setOemCross={value => {
                        setOemCross(value);
                        if (normalizeArticle(value) !== oemNumber) {
                            setInstallationOverride({});
                        }
                        applyOemCompatibility(value);
                        if (findCatalogOemSource(catalogNodes, value, true, model)) setManualName(null);
                    }}
                    oemSuggestions={oemSuggestions}
                />

                {manualName !== null && suggestedName && name !== suggestedName && (
                    <button
                        type="button"
                        onClick={() => setManualName(null)}
                        className="text-sm font-medium text-[var(--link)] hover:underline"
                    >
                        Подставить название «{suggestedName}»
                    </button>
                )}

                {existingOriginal && (
                    <p role="status" className="text-sm text-[var(--text-muted)]">
                        OEM {existingOriginal.article} уже есть в каталоге.
                    </p>
                )}

                {!isFluids && <PartInstallationFields
                    key={oemNumber}
                    partName={name}
                    value={installation}
                    onChange={patch => {
                        setInstallationOverride(previous => ({ ...previous, ...patch }));
                    }}
                />}

                {warning && (
                    <p
                        role="alert"
                        className="whitespace-pre-line rounded-xl bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400"
                    >
                        {warning}
                    </p>
                )}

                <label className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    Индекс доверия
                    <input type="number" min={0} max={100} step={1}
                        value={confidence} onChange={event => setConfidence(event.target.value)}
                        className="w-20 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2"
                    />
                    %
                </label>

                <CompatibilityBlock
                    targetCar={model}
                    isFluid={isFluids}
                    compatibilityType={compatibilityType}
                    setCompatibilityType={value => {
                        setHasAutomaticCompatibility(false);
                        setCompatibilityType(value);
                    }}
                    selectedModIds={selectedModIds}
                    setSelectedModIds={value => {
                        setHasAutomaticCompatibility(false);
                        setSelectedModIds(value);
                    }}
                />

                {isFluids && (
                    <FluidBranchPreview model={model} branches={selectedBranches} catalogNodes={catalogNodes}
                        part={{ brand, article, name, isOem, oemCross: isOem ? '' : oemCross }}
                        modificationIds={compatibilityType === 'all' ? ['all'] : selectedModIds} />
                )}

                {showRequiredFields && missingFields.length > 0 && (
                    <p role="alert" className="rounded-xl bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
                        Заполните обязательные поля: {missingFields.join(', ')}.
                    </p>
                )}

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
