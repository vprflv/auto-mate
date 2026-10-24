'use client';

import * as React from 'react';
import {
    X,
    Tag,
    ShieldCheck,
    Link as LinkIcon,
    Activity,
    CheckCircle2,
    GitBranch,
    Wrench
} from 'lucide-react';

import type {
    StoredPartItem,
    StoredCatalogNode
} from '@/features/admin/lib/system-store/types';
import { storage } from '@/features/admin/lib/system-store/storage';
import {
    getOemCrosses,
    getRelatedParts
} from '@/features/admin/lib/system-store/oemCrosses';

import { OemCrossEditor } from './OemCrossEditor';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    part: StoredPartItem | null;
    node: StoredCatalogNode | null;
}

export function PartDetailsModal({
                                     isOpen,
                                     onClose,
                                     part,
                                     node
                                 }: Props) {
    React.useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    // Собираем детали текущей модели из всех разделов каталога.
    const allModelParts = React.useMemo<StoredPartItem[]>(() => {
        if (!node || !isOpen) return [];

        const state = storage.getState();

        return state.catalogNodes
            .filter(
                item =>
                    item.brandSlug === node.brandSlug &&
                    item.modelSlug === node.modelSlug
            )
            .flatMap(item => item.items);
    }, [node, isOpen]);

    if (!isOpen || !part || !node) return null;

    const targetNumbers = part.isOem
        ? [part.article, ...getOemCrosses(part)]
        : getOemCrosses(part);

    const relatedParts = getRelatedParts(
        part,
        allModelParts
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="part-details-title"
                className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--border)]/40 bg-[var(--card)] shadow-2xl"
            >
                {/* Шапка */}
                <div className="flex shrink-0 items-start justify-between border-b border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 px-6 py-5">
                    <div className="flex min-w-0 items-center gap-4">
                        <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                                part.isOem
                                    ? 'border-amber-500/20 bg-amber-500/10 text-amber-500'
                                    : 'border-[var(--link)]/20 bg-[var(--link)]/10 text-[var(--link)]'
                            }`}
                        >
                            {part.isOem ? (
                                <ShieldCheck className="h-6 w-6" />
                            ) : (
                                <Wrench className="h-6 w-6" />
                            )}
                        </div>

                        <div className="min-w-0">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                                <span
                                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                        part.isOem
                                            ? 'bg-amber-500/10 text-amber-500'
                                            : 'border border-[var(--border)]/50 bg-[var(--bg-elevated)] text-[var(--text-dim)]'
                                    }`}
                                >
                                    {part.isOem
                                        ? 'Оригинал (OEM)'
                                        : 'Аналог (Aftermarket)'}
                                </span>

                                {part.isVerified && (
                                    <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Проверено
                                    </span>
                                )}
                            </div>

                            <h2
                                id="part-details-title"
                                className="break-words text-xl font-bold text-[var(--text)]"
                            >
                                {part.name}
                            </h2>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Закрыть карточку запчасти"
                        className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-6">
                    {/* Основные данные */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 p-4">
                            <p className="mb-1 text-[10px] font-bold uppercase text-[var(--text-dim)]">
                                Производитель
                            </p>
                            <p className="break-words text-lg font-bold text-[var(--text)]">
                                {part.brand}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 p-4">
                            <p className="mb-1 text-[10px] font-bold uppercase text-[var(--text-dim)]">
                                Артикул
                            </p>
                            <p className="flex items-center gap-2 font-mono text-lg font-bold text-[var(--text)]">
                                <Tag className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                                <span className="break-all">
                                    {part.article}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Редактор связанных OEM-номеров */}
                    <OemCrossEditor
                        key={JSON.stringify([
                            part.id,
                            getOemCrosses(part)
                        ])}
                        part={part}
                        nodeId={node.id}
                    />

                    {/* Цепочка взаимосвязей */}
                    {targetNumbers.length > 0 && (
                        <div className="overflow-hidden rounded-2xl border border-[var(--border)]/40 bg-[var(--card)]">
                            <div className="flex flex-col justify-between gap-2 border-b border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <LinkIcon className="h-4 w-4 text-[var(--text-muted)]" />
                                    <h3 className="text-sm font-bold text-[var(--text)]">
                                        Цепочка аналогов
                                    </h3>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-[10px] text-[var(--text-muted)]">
                                        Связь по OEM:
                                    </span>

                                    {targetNumbers.map(number => (
                                        <span
                                            key={number}
                                            className="break-all rounded border border-[var(--border)]/50 bg-[var(--bg-elevated)] px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--text-muted)]"
                                        >
                                            {number}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {relatedParts.length > 0 ? (
                                <div className="divide-y divide-[var(--border)]/30">
                                    {relatedParts.map(related => (
                                        <div
                                            key={related.id}
                                            className="flex flex-col justify-between gap-3 px-4 py-3 transition hover:bg-[var(--bg-elevated)]/20 sm:flex-row sm:items-center"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div
                                                    className={`h-2 w-2 shrink-0 rounded-full shadow-sm ${
                                                        related.isOem
                                                            ? 'bg-amber-500 shadow-amber-500/40'
                                                            : 'bg-blue-500 shadow-blue-500/40'
                                                    }`}
                                                />

                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-sm font-bold text-[var(--text)]">
                                                            {related.brand}
                                                        </p>

                                                        {related.isOem && (
                                                            <span className="rounded border border-amber-500/20 bg-amber-500/10 px-1 text-[9px] font-bold uppercase tracking-wider text-amber-500">
                                                                Оригинал
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="break-words text-xs text-[var(--text-muted)]">
                                                        {related.name}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="sm:text-right">
                                                <p className="break-all font-mono text-sm font-bold text-[var(--text)]">
                                                    {related.article}
                                                </p>
                                                <p className="text-[10px] font-medium text-emerald-500">
                                                    Установок: {related.installationsCount}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">
                                    В базе пока нет других деталей,
                                    связанных с указанными OEM-номерами.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Статистика и применимость */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-[var(--text-muted)]" />
                                <p className="text-[10px] font-bold uppercase text-[var(--text-dim)]">
                                    Статистика
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs text-[var(--text-muted)]">
                                        Успешных установок
                                    </span>
                                    <span className="text-sm font-bold text-[var(--text)]">
                                        {part.installationsCount}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs text-[var(--text-muted)]">
                                        Индекс доверия
                                    </span>
                                    <span className="text-sm font-bold text-emerald-500">
                                        {part.compatibilityScore}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <GitBranch className="h-4 w-4 text-[var(--text-muted)]" />
                                <p className="text-[10px] font-bold uppercase text-[var(--text-dim)]">
                                    Применимость
                                </p>
                            </div>

                            {node.compatibleModifications.includes('all') ? (
                                <p className="text-sm font-bold text-[var(--text)]">
                                    Универсальная
                                </p>
                            ) : (
                                <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                                    Подходит для{' '}
                                    {node.compatibleModifications.length}{' '}
                                    модификаций кузова.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}