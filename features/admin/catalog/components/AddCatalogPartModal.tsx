'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { CompatibilityBlock } from '@/features/admin/catalog-inbox/components/part-moderation/CompatibilityBlock';
import { NodeEditorBlock } from '@/features/admin/catalog-inbox/components/part-moderation/NodeEditorBlock';
import { PartEditorBlock } from '@/features/admin/catalog-inbox/components/part-moderation/PartEditorBlock';
import { getPartCategoryWarning } from '@/features/admin/catalog-inbox/hooks/getPartCategoryWarning';
import { storage } from '@/features/admin/lib/system-store/storage';
import type { StoredMasterModel } from '@/features/admin/lib/system-store/types';
import type { PartInstallation } from '@/types/partInstallation';
import {PartInstallationFields} from "@/features/garage/components/PartInstallationFields";


interface Props {
    model: StoredMasterModel;
    onClose: () => void;
}

export function AddCatalogPartModal({ model, onClose }: Props) {
    const [brand, setBrand] = useState('');
    const [article, setArticle] = useState('');
    const [name, setName] = useState('');
    const [isOem, setIsOem] = useState(false);
    const [oemCross, setOemCross] = useState('');
    const [installation, setInstallation] = useState<PartInstallation>({});

    const [nodeCategory, setNodeCategory] = useState('');
    const [nodeTitle, setNodeTitle] = useState('');
    const [isCustomNode, setIsCustomNode] = useState(false);

    const [compatibilityType, setCompatibilityType] =
        useState<'all' | 'specific'>('specific');
    const [selectedModIds, setSelectedModIds] = useState<string[]>([]);

    const [catalogNodes] = useState(() => storage.getState().catalogNodes);

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

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const modificationIds = compatibilityType === 'all'
            ? (model.modifications ?? []).map(modification => modification.id)
            : selectedModIds;

        const installationsByModification =
            installation.axle || installation.side
                ? Object.fromEntries(
                    modificationIds.map(id => [id, [installation]])
                )
                : {};

        if (
            categoryWarning &&
            !window.confirm(
                `${categoryWarning}\n\nДобавить деталь в выбранную категорию?`
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
                    setName={setName}
                    isOem={isOem}
                    setIsOem={setIsOem}
                    oemCross={oemCross}
                    setOemCross={setOemCross}
                    oemSuggestions={[]}
                />

                <PartInstallationFields
                    partName={name}
                    value={installation}
                    onChange={patch => {
                        setInstallation(previous => ({ ...previous, ...patch }));
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

                {categoryWarning && (
                    <p role="alert" className="rounded-xl bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
                        {categoryWarning}
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