'use client';

import * as React from 'react';
import { X, Wrench, ShieldCheck, AlertTriangle } from 'lucide-react';
import { InboxItem } from '@/features/admin/lib/systemStore';

// Импортируем нашу логику и UI-блоки

import { IncomingDataBlock } from './part-moderation/IncomingDataBlock';
import { PartEditorBlock } from './part-moderation/PartEditorBlock';
import { NodeEditorBlock } from './part-moderation/NodeEditorBlock';
import { CompatibilityBlock } from './part-moderation/CompatibilityBlock';
import {usePartModeration} from "@/features/admin/catalog-inbox/hooks/usePartModeration";

interface Props {
    item: InboxItem;
    isOpen: boolean;
    onClose: () => void;
    onApprove: (id: string, payload: any) => void;
    onReject: (id: string) => void;
}

export function PartModerationModal(props: Props) {
    const { item, isOpen, onClose } = props;

    // Вся сложная логика спрятана в одном хуке
    const state = usePartModeration(props);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6">
            <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[var(--border)]/40 bg-[var(--card)] shadow-2xl">

                {/* Шапка */}
                <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            <Wrench className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[var(--text)]">Модерация запчасти</h2>
                            <p className="text-xs text-[var(--text-dim)]">Для {item.carBrand} {item.carModel}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] transition">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Алерт отсутствия машины */}
                    {!state.targetCar && (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-500">
                            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold">Базовая модель не найдена в эталонном каталоге</h4>
                                <p className="text-xs text-amber-500/80 mt-1">Система не может найти {item.carBrand} {item.carModel}.</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Левая колонка */}
                        <IncomingDataBlock specs={state.incomingData} item={item} />

                        {/* Правая колонка */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--link)] mb-3 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4" /> 2. Эталонизация и привязка
                                </h3>

                                <PartEditorBlock
                                    brand={state.brand} setBrand={state.setBrand}
                                    article={state.article} setArticle={state.setArticle}
                                    name={state.name} setName={state.setName}
                                    isOem={state.isOem} setIsOem={state.setIsOem}
                                    oemCross={state.oemCross} setOemCross={state.setOemCross} // <-- ДОБАВИЛИ
                                />

                                <NodeEditorBlock
                                    nodeCategory={state.nodeCategory} setNodeCategory={state.setNodeCategory}
                                    nodeTitle={state.nodeTitle} setNodeTitle={state.setNodeTitle}
                                    existingNodes={state.existingNodes}
                                    isCustomNode={state.isCustomNode} setIsCustomNode={state.setIsCustomNode} // <-- ДОБАВИЛИ ЭТИ ДВЕ СТРОКИ
                                />

                                <CompatibilityBlock
                                    targetCar={state.targetCar}
                                    compatibilityType={state.compatibilityType} setCompatibilityType={state.setCompatibilityType}
                                    selectedModIds={state.selectedModIds} setSelectedModIds={state.setSelectedModIds}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Футер */}
                <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 px-6 py-4">
                    <button onClick={state.handleReject} className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-5 py-2.5 text-sm font-semibold text-rose-500 transition hover:bg-rose-500 hover:text-white">
                        В мусор
                    </button>
                    <button onClick={onClose} className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--bg-elevated)]">
                        Отмена
                    </button>
                    <button onClick={state.handleApprove} className="rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-600">
                        Добавить в Каталог
                    </button>
                </div>
            </div>
        </div>
    );
}