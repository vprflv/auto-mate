'use client';

import * as React from 'react';
import {
    X, Tag, ShieldCheck, Link as LinkIcon,
    Activity, CheckCircle2, GitBranch, Wrench
} from 'lucide-react';
import { StoredPartItem, StoredCatalogNode } from '@/features/admin/lib/system-store/types';
import { storage } from '@/features/admin/lib/system-store/storage';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    part: StoredPartItem | null;
    node: StoredCatalogNode | null;
}

export function PartDetailsModal({ isOpen, onClose, part, node }: Props) {
    React.useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // ХУК ДОЛЖЕН БЫТЬ ДО РАННЕГО RETURN!
    // 2. Собираем ВСЕ запчасти для текущей модели авто из ВСЕХ узлов каталога
    const allModelParts = React.useMemo(() => {
        if (!node) return [];
        const state = storage.getState();
        // Ищем все узлы конкретно для этой машины
        const modelNodes = state.catalogNodes.filter(
            n => n.brandSlug === node.brandSlug && n.modelSlug === node.modelSlug
        );
        // Схлопываем все items в один плоский массив
        return modelNodes.flatMap(n => n.items);
    }, [node, isOpen]);

    // Ранний выход, если модалка закрыта или нет данных
    if (!isOpen || !part || !node) return null;

    // МАГИЯ КРОСС-НОМЕРОВ (ГЛОБАЛЬНАЯ ПО МОДЕЛИ)

    // 1. Нормализуем целевой OEM-артикул
    const rawTarget = part.isOem ? part.article : part.oemCross;
    const cleanTarget = rawTarget?.trim().toLowerCase();

    // 3. Ищем оригинальную деталь глобально
    const originalPart = cleanTarget
        ? allModelParts.find(p => p.isOem && p.article.trim().toLowerCase() === cleanTarget)
        : null;

    // 4. Ищем все аналоги глобально
    const allAnalogs = cleanTarget
        ? allModelParts.filter(p => !p.isOem && p.oemCross?.trim().toLowerCase() === cleanTarget)
        : [];

    // 5. Склеиваем цепочку и исключаем саму просматриваемую деталь
    const relatedParts = [
        ...(originalPart ? [originalPart] : []),
        ...allAnalogs
    ].filter(p => p.id !== part.id);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6">
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--border)]/40 bg-[var(--card)] shadow-2xl">

                {/* Шапка */}
                <div className="flex shrink-0 items-start justify-between border-b border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 px-6 py-5">
                    <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${part.isOem ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-[var(--link)]/10 border-[var(--link)]/20 text-[var(--link)]'}`}>
                            {part.isOem ? <ShieldCheck className="h-6 w-6" /> : <Wrench className="h-6 w-6" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${part.isOem ? 'bg-amber-500/10 text-amber-500' : 'bg-[var(--bg-elevated)] text-[var(--text-dim)] border border-[var(--border)]/50'}`}>
                                    {part.isOem ? 'Оригинал (OEM)' : 'Аналог (Aftermarket)'}
                                </span>
                                {part.isVerified && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                        <CheckCircle2 className="h-3 w-3" /> Проверено
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-[var(--text)]">{part.name}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] transition">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                    {/* Основные данные (Бренд / Артикул) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 p-4">
                            <p className="text-[10px] font-bold uppercase text-[var(--text-dim)] mb-1">Производитель</p>
                            <p className="text-lg font-bold text-[var(--text)]">{part.brand}</p>
                        </div>
                        <div className="rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 p-4">
                            <p className="text-[10px] font-bold uppercase text-[var(--text-dim)] mb-1">Артикул</p>
                            <p className="text-lg font-mono font-bold text-[var(--text)] flex items-center gap-2">
                                <Tag className="h-4 w-4 text-[var(--text-muted)]" />
                                {part.article}
                            </p>
                        </div>
                    </div>

                    {/* ГЛОБАЛЬНЫЙ БЛОК: ЦЕПОЧКА ВЗАИМОСВЯЗЕЙ */}
                    {rawTarget && (
                        <div className="rounded-2xl border border-[var(--border)]/40 bg-[var(--card)] overflow-hidden">
                            <div className="bg-[var(--bg-elevated)]/30 px-4 py-3 border-b border-[var(--border)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <LinkIcon className="h-4 w-4 text-[var(--text-muted)]" />
                                    <h3 className="text-sm font-bold text-[var(--text)]">Цепочка аналогов</h3>
                                </div>
                                <span className="text-[10px] font-mono font-bold bg-[var(--bg-elevated)] px-2 py-0.5 rounded text-[var(--text-muted)] border border-[var(--border)]/50 uppercase tracking-wider">
                                    Связь по OEM: {rawTarget}
                                </span>
                            </div>

                            {relatedParts.length > 0 ? (
                                <div className="divide-y divide-[var(--border)]/30">
                                    {relatedParts.map(related => (
                                        <div key={related.id} className="flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-elevated)]/20 transition">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full shadow-sm ${related.isOem ? 'bg-amber-500 shadow-amber-500/40' : 'bg-blue-500 shadow-blue-500/40'}`} />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-[var(--text)]">{related.brand}</p>
                                                        {related.isOem && (
                                                            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider border border-amber-500/20 px-1 rounded bg-amber-500/10">Оригинал</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-[var(--text-muted)]">{related.name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono text-sm font-bold text-[var(--text)]">{related.article}</p>
                                                <p className="text-[10px] text-emerald-500 font-medium">Установок: {related.installationsCount}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">
                                    В базе пока нет других деталей, связанных с этим OEM номером.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Статистика и применимость */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="h-4 w-4 text-[var(--text-muted)]" />
                                <p className="text-[10px] font-bold uppercase text-[var(--text-dim)]">Статистика</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-[var(--text-muted)]">Успешных установок</span>
                                    <span className="text-sm font-bold text-[var(--text)]">{part.installationsCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-[var(--text-muted)]">Индекс доверия</span>
                                    <span className="text-sm font-bold text-emerald-500">{part.compatibilityScore}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <GitBranch className="h-4 w-4 text-[var(--text-muted)]" />
                                <p className="text-[10px] font-bold uppercase text-[var(--text-dim)]">Применимость</p>
                            </div>
                            {node.compatibleModifications.includes('all') ? (
                                <p className="text-sm font-bold text-[var(--text)]">Универсальная</p>
                            ) : (
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                    Подходит для {node.compatibleModifications.length} модификаций кузова.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}