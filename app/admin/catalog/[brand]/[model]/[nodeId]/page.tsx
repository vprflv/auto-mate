'use client';

import * as React from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    Wrench,
    ShieldCheck,
    Tag,
    ThumbsUp,
    Database,
    Link as LinkIcon
} from 'lucide-react';

import { storage } from '@/features/admin/lib/system-store/storage';
import type {
    StoredCatalogNode,
    StoredPartItem
} from '@/features/admin/lib/system-store/types';
import {
    getOemCrosses,
    getRelatedParts
} from '@/features/admin/lib/system-store/oemCrosses';
import { PartDetailsModal } from '@/features/admin/catalog/components/PartDetailsModal';

interface Props {
    params: Promise<{
        brand: string;
        model: string;
        nodeId: string;
    }>;
}

export default function NodeCatalogPage({ params }: Props) {
    const resolvedParams = React.use(params);

    const [node, setNode] =
        React.useState<StoredCatalogNode | null>(null);

    const [selectedPart, setSelectedPart] =
        React.useState<StoredPartItem | null>(null);

    const [isModalOpen, setIsModalOpen] = React.useState(false);

    React.useEffect(() => {
        const loadData = () => {
            const state = storage.getState();

            const foundNode = state.catalogNodes.find(
                item => item.id === resolvedParams.nodeId
            );

            setNode(foundNode || null);

            // Обновляем открытую карточку после сохранения OEM-номеров.
            setSelectedPart(current => {
                if (!current || !foundNode) return null;

                return foundNode.items.find(
                    item => item.id === current.id
                ) ?? null;
            });
        };

        loadData();

        window.addEventListener(
            'system-store-updated',
            loadData
        );

        return () => {
            window.removeEventListener(
                'system-store-updated',
                loadData
            );
        };
    }, [resolvedParams.nodeId]);

    const handleOpenPart = (part: StoredPartItem) => {
        setSelectedPart(part);
        setIsModalOpen(true);
    };

    const handleClosePart = () => {
        setIsModalOpen(false);
        setSelectedPart(null);
    };

    if (!node) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
                <Database className="h-12 w-12 text-[var(--text-muted)]" />

                <h2 className="text-xl font-bold text-[var(--text)]">
                    Узел не найден
                </h2>

                <Link
                    href={`/admin/catalog/${resolvedParams.brand}/${resolvedParams.model}`}
                    className="mt-4 rounded-xl bg-[var(--link)] px-6 py-2.5 text-sm font-bold text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)]"
                >
                    Вернуться к модели
                </Link>
            </div>
        );
    }

    // Детали этой модели из всех разделов каталога.
    const modelParts = storage.getState().catalogNodes
        .filter(
            item =>
                item.brandSlug === node.brandSlug &&
                item.modelSlug === node.modelSlug
        )
        .flatMap(item => item.items);

    return (
        <div className="mx-auto max-w-5xl space-y-6 pb-20">
            {/* Навигация */}
            <Link
                href={`/admin/catalog/${resolvedParams.brand}/${resolvedParams.model}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-[var(--text-muted)] transition hover:text-[var(--link)]"
            >
                <ChevronLeft className="h-4 w-4" />
                Назад к автомобилю
            </Link>

            {/* Шапка узла */}
            <div className="flex items-center justify-between gap-4 rounded-3xl border border-[var(--border)]/40 bg-[var(--card)] p-6 shadow-sm sm:p-8">
                <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--link)]/10 text-[var(--link)]">
                            <Wrench className="h-5 w-5" />
                        </div>

                        <h1 className="break-words text-2xl font-bold text-[var(--text)]">
                            {node.title}
                        </h1>
                    </div>

                    <p className="text-sm uppercase tracking-wider text-[var(--text-muted)]">
                        Категория: {node.category}
                    </p>
                </div>

                <div className="shrink-0 text-right">
                    <p className="text-3xl font-black text-[var(--text)]">
                        {node.items.length}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">
                        деталей в базе
                    </p>
                </div>
            </div>

            {/* Список запчастей */}
            <div className="space-y-3">
                {node.items.map(part => {
                    const oemNumbers = getOemCrosses(part);

                    const analogsCount = part.isOem
                        ? getRelatedParts(part, modelParts)
                            .filter(item => !item.isOem)
                            .length
                        : 0;

                    return (
                        <button
                            key={part.id}
                            type="button"
                            onClick={() => handleOpenPart(part)}
                            className="flex w-full cursor-pointer flex-col justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-left shadow-2xs transition hover:border-[var(--link)]/50 hover:bg-[var(--bg-elevated)]/30 sm:flex-row sm:items-center"
                        >
                            {/* Бренд, артикул и OEM-связи */}
                            <div className="min-w-0 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-lg font-bold text-[var(--text)]">
                                        {part.brand}
                                    </h3>

                                    {part.isOem ? (
                                        <span className="flex items-center gap-1 rounded border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-500">
                                            <ShieldCheck className="h-3 w-3" />
                                            Оригинал (OEM)
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">
                                            <Wrench className="h-3 w-3" />
                                            Аналог
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 font-mono text-sm text-[var(--text-muted)] sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <Tag className="h-3.5 w-3.5 shrink-0" />
                                        <span className="break-all font-bold">
                                            {part.article}
                                        </span>
                                    </div>

                                    {oemNumbers.length > 0 && (
                                        <div className="flex items-start gap-1 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-xs text-blue-500/90">
                                            <LinkIcon className="mt-0.5 h-3 w-3 shrink-0" />

                                            <span className="min-w-0 break-words">
                                                Кросс к OEM:{' '}
                                                <span className="font-bold">
                                                    {oemNumbers.join(', ')}
                                                </span>
                                            </span>
                                        </div>
                                    )}

                                    {part.isOem && analogsCount > 0 && (
                                        <div className="flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-500">
                                            <LinkIcon className="h-3 w-3 shrink-0" />
                                            Связанных аналогов:
                                            <span className="ml-1 font-bold">
                                                {analogsCount}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <p className="mt-1 break-words text-sm text-[var(--text)]">
                                    {part.name}
                                </p>
                            </div>

                            {/* Рейтинг и установки */}
                            <div className="flex shrink-0 items-center gap-6 sm:text-right">
                                <div>
                                    <p className="mb-1 text-[10px] font-bold uppercase text-[var(--text-dim)]">
                                        Установок
                                    </p>
                                    <div className="flex items-center gap-1.5 font-semibold text-[var(--text)] sm:justify-end">
                                        <ThumbsUp className="h-4 w-4 text-emerald-500" />
                                        {part.installationsCount}
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-1 text-[10px] font-bold uppercase text-[var(--text-dim)]">
                                        Совместимость
                                    </p>
                                    <div className="flex items-center gap-1.5 font-black sm:justify-end">
                                        <span
                                            className={
                                                part.compatibilityScore > 70
                                                    ? 'text-emerald-500'
                                                    : 'text-amber-500'
                                            }
                                        >
                                            {part.compatibilityScore}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Карточка запчасти */}
            <PartDetailsModal
                isOpen={isModalOpen}
                onClose={handleClosePart}
                part={selectedPart}
                node={node}
            />
        </div>
    );
}