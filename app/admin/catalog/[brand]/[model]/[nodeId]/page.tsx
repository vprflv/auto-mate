'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft, Wrench, ShieldCheck, Tag, ThumbsUp, Database, Link as LinkIcon } from 'lucide-react';
import { storage } from '@/features/admin/lib/system-store/storage';
import { StoredCatalogNode, StoredPartItem } from '@/features/admin/lib/system-store/types';
import { PartDetailsModal } from '@/features/admin/catalog/components/PartDetailsModal';

export default function NodeCatalogPage({ params }: { params: Promise<{ brand: string; model: string; nodeId: string }> }) {
    const resolvedParams = React.use(params);

    const [node, setNode] = React.useState<StoredCatalogNode | null>(null);
    const [selectedPart, setSelectedPart] = React.useState<StoredPartItem | null>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    React.useEffect(() => {
        const loadData = () => {
            const state = storage.getState();
            const foundNode = state.catalogNodes.find(n => n.id === resolvedParams.nodeId);
            setNode(foundNode || null);
        };
        loadData();
        window.addEventListener('system-store-updated', loadData);
        return () => window.removeEventListener('system-store-updated', loadData);
    }, [resolvedParams.nodeId]);

    const handleOpenPart = (part: StoredPartItem) => {
        setSelectedPart(part);
        setIsModalOpen(true);
    };

    if (!node) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
                <Database className="h-12 w-12 text-[var(--text-muted)]" />
                <h2 className="text-xl font-bold text-[var(--text)]">Узел не найден</h2>
                <Link href={`/admin/catalog/${resolvedParams.brand}/${resolvedParams.model}`} className="mt-4 rounded-xl bg-[var(--link)] px-6 py-2.5 text-sm font-bold text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)]">
                    Вернуться к модели
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6 pb-20">
            {/* Навигация */}
            <Link href={`/admin/catalog/${resolvedParams.brand}/${resolvedParams.model}`} className="inline-flex items-center gap-1 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--link)] transition">
                <ChevronLeft className="h-4 w-4" />
                Назад к автомобилю
            </Link>

            {/* Шапка узла */}
            <div className="rounded-3xl border border-[var(--border)]/40 bg-[var(--card)] p-6 shadow-sm sm:p-8 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--link)]/10 text-[var(--link)]">
                            <Wrench className="h-5 w-5" />
                        </div>
                        <h1 className="text-2xl font-bold text-[var(--text)]">{node.title}</h1>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] uppercase tracking-wider">
                        Категория: {node.category}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-black text-[var(--text)]">{node.items.length}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">деталей в базе</p>
                </div>
            </div>

            {/* Список запчастей */}
            <div className="space-y-3">
                {node.items.map(part => {
                    // Вычисляем количество аналогов для бейджа, если это OEM
                    const analogsCount = part.isOem
                        ? node.items.filter(p => p.oemCross?.toLowerCase() === part.article.toLowerCase() && !p.isOem).length
                        : 0;

                    return (
                        <button
                            key={part.id}
                            onClick={() => handleOpenPart(part)}
                            className="w-full text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xs hover:border-[var(--link)]/50 hover:bg-[var(--bg-elevated)]/30 transition cursor-pointer"
                        >
                            {/* Левая часть: Бренд, Артикул и Кросс-номера */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-[var(--text)]">{part.brand}</h3>
                                    {part.isOem ? (
                                        <span className="flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-500 border border-amber-500/20">
                                            <ShieldCheck className="h-3 w-3" />
                                            Оригинал (OEM)
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 rounded bg-[var(--bg-elevated)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-muted)] border border-[var(--border)]">
                                            <Wrench className="h-3 w-3" />
                                            Аналог
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-[var(--text-muted)] font-mono">
                                    <div className="flex items-center gap-1.5">
                                        <Tag className="h-3.5 w-3.5" />
                                        <span className="font-bold">{part.article}</span>
                                    </div>

                                    {/* ВИЗУАЛИЗАЦИЯ СВЯЗЕЙ В СПИСКЕ */}
                                    {!part.isOem && part.oemCross && (
                                        <div className="flex items-center gap-1 text-blue-500/90 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 text-xs">
                                            <LinkIcon className="h-3 w-3 shrink-0" />
                                            Кросс к OEM: <span className="font-bold ml-1">{part.oemCross}</span>
                                        </div>
                                    )}
                                    {part.isOem && analogsCount > 0 && (
                                        <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 text-xs">
                                            <LinkIcon className="h-3 w-3 shrink-0" />
                                            Связанных аналогов: <span className="font-bold ml-1">{analogsCount}</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-[var(--text)] mt-1">{part.name}</p>
                            </div>

                            {/* Правая часть: Рейтинг и подтверждения */}
                            <div className="flex items-center gap-6 sm:text-right shrink-0">
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-[var(--text-dim)] mb-1">Установок</p>
                                    <div className="flex items-center sm:justify-end gap-1.5 text-[var(--text)] font-semibold">
                                        <ThumbsUp className="h-4 w-4 text-emerald-500" />
                                        {part.installationsCount}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-[var(--text-dim)] mb-1">Совместимость</p>
                                    <div className="flex items-center sm:justify-end gap-1.5 font-black">
                                        <span className={part.compatibilityScore > 70 ? 'text-emerald-500' : 'text-amber-500'}>
                                            {part.compatibilityScore}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Модалка с деталями и кросс-номерами */}
            <PartDetailsModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedPart(null); }}
                part={selectedPart}
                node={node}
            />
        </div>
    );
}