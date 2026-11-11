'use client';

import * as React from 'react';
import { AlertTriangle, ShieldCheck, Wrench, X } from 'lucide-react';

import type { InboxItem } from '@/features/admin/lib/systemStore';
import { getOemCrosses } from '@/features/admin/lib/system-store/oemCrosses';
import { usePartModeration } from '@/features/admin/catalog-inbox/hooks/usePartModeration';
import { PartInstallationBadge } from '@/features/garage/components/PartInstallationBadge';
import { PartInstallationFields } from '@/features/garage/components/PartInstallationFields';

import { CompatibilityBlock } from './part-moderation/CompatibilityBlock';
import { IncomingDataBlock } from './part-moderation/IncomingDataBlock';
import { NodeEditorBlock } from './part-moderation/NodeEditorBlock';
import { PartEditorBlock } from './part-moderation/PartEditorBlock';

interface Props {
    item: InboxItem;
    isOpen: boolean;
    onClose: () => void;
    onApprove: (id: string, payload: any) => void;
    onReject: (id: string) => void;
}

type ApprovalConfirmation = {
    itemId: string;
    message: string;
    approve: () => void;
    approveLabel: string;
};

export function PartModerationModal(props: Props) {
    const { item, isOpen, onClose } = props;
    const titleId = React.useId();

    const [confirmation, setConfirmation] =
        React.useState<ApprovalConfirmation | null>(null);

    const pendingApproval = confirmation?.itemId === item.id
        ? confirmation
        : null;

    const state = usePartModeration({
        ...props,
        requestApprovalConfirmation: (message, approve, approveLabel) => {
            setConfirmation({ itemId: item.id, message, approve, approveLabel });
        },
    });

    const closeModal = () => {
        setConfirmation(null);
        onClose();
    };

    if (!isOpen) return null;

    const targetModifications = Array.isArray(state.targetCar?.modifications)
        ? state.targetCar.modifications
        : [];

    const selectedModificationNames = targetModifications
        .filter(modification => state.selectedModIds.includes(modification.id))
        .map(modification => modification.name)
        .join(', ');

    const incomingOem = state.isOem ? state.article : state.oemCross;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="flex max-h-[90dvh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[var(--border)]/40 bg-[var(--card)] shadow-2xl"
            >
                <header className="flex shrink-0 items-center justify-between border-b border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-500">
                            <Wrench className="h-5 w-5" aria-hidden="true" />
                        </div>

                        <div>
                            <h2 id={titleId} className="text-lg font-bold text-[var(--text)]">
                                Модерация запчасти
                            </h2>
                            <p className="text-xs text-[var(--text-dim)]">
                                Для {item.carBrand} {item.carModel}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        aria-label="Закрыть"
                        onClick={closeModal}
                        className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
                    >
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </header>

                <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
                    <fieldset
                        disabled={Boolean(pendingApproval)}
                        className="m-0 min-w-0 border-0 p-6"
                    >
                        {!state.targetCar && (
                            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-500">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                                <div>
                                    <h4 className="font-bold">
                                        Базовая модель не найдена в эталонном каталоге
                                    </h4>
                                    <p className="mt-1 text-xs">
                                        Система не может найти {item.carBrand} {item.carModel}.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                            <IncomingDataBlock specs={state.incomingData} item={item} />

                            <div className="min-w-0 space-y-4">
                                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--link)]">
                                    <ShieldCheck className="h-4 w-4" />
                                    2. Эталонизация и привязка
                                </h3>

                                <PartEditorBlock
                                    brand={state.brand}
                                    setBrand={state.setBrand}
                                    article={state.article}
                                    setArticle={state.setArticle}
                                    name={state.name}
                                    setName={state.setName}
                                    isOem={state.isOem}
                                    setIsOem={state.setIsOem}
                                    oemCross={state.oemCross}
                                    setOemCross={state.setOemCross}
                                    oemSuggestions={state.oemSuggestions}
                                />

                                {state.articleMatches.length > 0 && (
                                    <section
                                        aria-label="Сравнение деталей по артикулу"
                                        className="space-y-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4"
                                    >
                                        <h3 className="text-sm font-semibold">
                                            Такой артикул уже есть в каталоге
                                        </h3>
                                        <p className="text-sm text-[var(--text-muted)]">
                                            Сравните OEM, расположение и применимость перед одобрением.
                                        </p>

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="min-w-0 space-y-1 break-words rounded-xl bg-[var(--card)] p-3 text-sm">
                                                <h4 className="font-semibold">
                                                    Одобряемая деталь
                                                </h4>
                                                <p>{state.name || 'Название не указано'}</p>
                                                <p>
                                                    {state.brand || 'Бренд не указан'} · {state.article}
                                                </p>
                                                <p>OEM · {incomingOem.trim() || 'Не указан'}</p>

                                                {state.installation.axle || state.installation.side ? (
                                                    <PartInstallationBadge value={state.installation} />
                                                ) : (
                                                    <p className="text-[var(--text-muted)]">
                                                        Расположение не указано
                                                    </p>
                                                )}

                                                <p className="text-[var(--text-muted)]">
                                                    {state.compatibilityType === 'all'
                                                        ? 'Все модификации'
                                                        : selectedModificationNames || 'Модификации не выбраны'}
                                                </p>
                                            </div>

                                            <div className="min-w-0 space-y-2">
                                                {state.articleMatches.map(({ node, part, model }) => {
                                                    const oemNumbers = part.isOem
                                                        ? [part.article, ...getOemCrosses(part)]
                                                        : getOemCrosses(part);

                                                    const modificationIds =
                                                        part.compatibleModifications ?? [];
                                                    const modifications = Array.isArray(model?.modifications)
                                                        ? model.modifications
                                                        : [];

                                                    const getModificationName = (id: string) =>
                                                        modifications.find(modification => modification.id === id)
                                                            ?.name ?? id;

                                                    const applicability = modificationIds.includes('all')
                                                        ? 'Все модификации'
                                                        : modificationIds.map(getModificationName).join(', ') ||
                                                        'Применимость не уточнена';

                                                    const commonPosition = part.installation;
                                                    const positionsByModification = Object.entries(
                                                        part.installationsByModification ?? {}
                                                    ).filter(([, positions]) => positions.length > 0);

                                                    return (
                                                        <div
                                                            key={`${node.id}:${part.id}`}
                                                            className="space-y-1 break-words rounded-xl bg-[var(--card)] p-3 text-sm"
                                                        >
                                                            <h4 className="font-semibold">В каталоге</h4>
                                                            <p>{part.name}</p>
                                                            <p>{part.brand} · {part.article}</p>
                                                            <p>OEM · {oemNumbers.join(', ') || 'Не указан'}</p>

                                                            <p className="text-[var(--text-muted)]">
                                                                {model
                                                                    ? `${model.brandName} ${model.modelName}`
                                                                    : `${node.brandSlug} ${node.modelSlug}`}
                                                                {' → '}{node.title}
                                                            </p>
                                                            <p className="text-[var(--text-muted)]">
                                                                {applicability}
                                                            </p>

                                                            {commonPosition?.axle || commonPosition?.side ? (
                                                                <PartInstallationBadge value={commonPosition} />
                                                            ) : !commonPosition && positionsByModification.length > 0 ? (
                                                                positionsByModification.map(([id, positions]) => (
                                                                    <div key={id} className="space-y-1">
                                                                        <p className="text-[var(--text-muted)]">
                                                                            {getModificationName(id)}
                                                                        </p>
                                                                        {positions.map(position => (
                                                                            <PartInstallationBadge
                                                                                key={`${position.axle ?? ''}:${position.side ?? ''}`}
                                                                                value={position}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-[var(--text-muted)]">
                                                                    Расположение не указано
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </section>
                                )}

                                <PartInstallationFields
                                    key={item.id}
                                    partName={state.name}
                                    value={state.installation}
                                    onChange={patch => {
                                        state.setInstallation(previous => ({
                                            ...previous,
                                            ...patch,
                                        }));
                                    }}
                                />

                                <NodeEditorBlock
                                    nodeCategory={state.nodeCategory}
                                    setNodeCategory={state.setNodeCategory}
                                    nodeTitle={state.nodeTitle}
                                    setNodeTitle={state.setNodeTitle}
                                    existingNodes={state.existingNodes}
                                    existingCategories={state.existingCategories}
                                    isCustomNode={state.isCustomNode}
                                    setIsCustomNode={state.setIsCustomNode}
                                />

                                {state.categoryWarning && (
                                    <div
                                        role="alert"
                                        className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-600 dark:text-amber-400"
                                    >
                                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                        <p className="text-sm">{state.categoryWarning}</p>
                                    </div>
                                )}

                                <CompatibilityBlock
                                    targetCar={state.targetCar}
                                    compatibilityType={state.compatibilityType}
                                    setCompatibilityType={state.setCompatibilityType}
                                    selectedModIds={state.selectedModIds}
                                    setSelectedModIds={state.setSelectedModIds}
                                />
                            </div>
                        </div>
                    </fieldset>
                </div>

                <footer className="shrink-0 space-y-3 border-t border-[var(--border)]/40 bg-[var(--bg)] px-6 py-4">
                    {pendingApproval ? (
                        <>
                            <div
                                role="alert"
                                className="max-h-32 overflow-y-auto whitespace-pre-line rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm"
                            >
                                {pendingApproval.message}
                            </div>

                            <div className="flex flex-wrap justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setConfirmation(null)}
                                    className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium"
                                >
                                    Вернуться к сравнению
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setConfirmation(null);
                                        pendingApproval.approve();
                                    }}
                                    className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black"
                                >
                                    {pendingApproval.approveLabel}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                onClick={state.handleReject}
                                className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-5 py-2.5 text-sm font-semibold text-rose-500"
                            >
                                В мусор
                            </button>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-medium"
                            >
                                Отмена
                            </button>

                            <button
                                type="button"
                                onClick={state.handleApprove}
                                className="rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-bold text-white"
                            >
                                Добавить в каталог
                            </button>
                        </div>
                    )}
                </footer>
            </div>
        </div>
    );
}