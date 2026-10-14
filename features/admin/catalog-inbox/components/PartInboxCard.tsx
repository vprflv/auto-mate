'use client';

import * as React from 'react';
import { Package, Check, X, Droplet, Wrench, FileText } from 'lucide-react';
import { InboxItem } from '@/features/admin/lib/systemStore';

interface Props {
    item: InboxItem;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

export function PartInboxCard({ item, onApprove, onReject }: Props) {
    const isFluid = item.itemType === 'Техническая жидкость' || item.type === ('fluid' as any);
    const isFromService = item.source === 'user_service';

    return (
        <div className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--border)]/40 bg-[var(--card)] transition-all duration-200 hover:border-[var(--link)]/40 hover:shadow-sm">
            {/* Верхний блок превью (как в FluidCard на скрине) */}
            <div className="relative flex h-36 w-full flex-col items-center justify-center border-b border-[var(--border)]/30 bg-[var(--bg-elevated)]/60 p-3 text-center">
                {/* Бейдж категории / типа */}
                <div className="absolute left-3 top-3 flex items-center gap-1">
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-500 border border-blue-500/20">
                        {isFluid ? <Droplet className="h-3 w-3" /> : <Package className="h-3 w-3" />}
                        {isFluid ? 'Жидкость' : 'Запчасть'}
                    </span>
                    <span className="rounded-md bg-[var(--card)] px-1.5 py-0.5 text-[10px] text-[var(--text-dim)] border border-[var(--border)]/50">
                        {isFromService ? 'ТО' : 'Ручн.'}
                    </span>
                </div>

                {/* Score доверия в правом верхнем углу */}
                <span className="absolute right-3 top-3 rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-500 border border-emerald-500/20">
                    {item.suggestedScore || 40}%
                </span>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--card)] text-[var(--text-muted)] shadow-2xs border border-[var(--border)]/40">
                    {isFluid ? <Droplet className="h-6 w-6 stroke-[1.5]" /> : <Package className="h-6 w-6 stroke-[1.5]" />}
                </div>

                <span className="mt-2 text-[11px] font-medium text-[var(--text-dim)]">
                    {item.carBrand} {item.carModel} {item.carYear ? `(${item.carYear})` : ''}
                </span>
            </div>

            {/* Информационный блок */}
            <div className="flex flex-1 flex-col justify-between p-4">
                <div className="space-y-2">
                    <div>
                        <h4 className="truncate text-base font-bold text-[var(--text)]" title={item.partName}>
                            {item.partName || 'Без названия'}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                            <span className="font-semibold text-[var(--text)]">{item.partBrand || '—'}</span>
                            {item.isOem && (
                                <span className="rounded bg-emerald-500/15 px-1 text-[9px] font-bold text-emerald-600">OEM</span>
                            )}
                        </div>
                    </div>

                    {/* Артикул / Номер крупно */}
                    <div className="rounded-xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/70 px-2.5 py-1.5 font-mono text-xs font-semibold text-[var(--text)]">
                        {item.partArticle || '—'}
                    </div>

                    {/* Категория / Подкатегория */}
                    <div className="truncate text-[11px] text-[var(--text-dim)]">
                        {item.category || item.nodeTitle || 'Категория не указана'}
                    </div>
                </div>

                {/* Кнопки действий */}
                <div className="mt-4 flex items-center gap-2 border-t border-[var(--border)]/40 pt-3">
                    <button
                        type="button"
                        onClick={() => onReject(item.id)}
                        className="flex h-8 flex-1 items-center justify-center gap-1 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs font-semibold text-rose-500 transition hover:bg-rose-500 hover:text-white"
                        title="Отклонить"
                    >
                        <X className="h-3.5 w-3.5" />
                        Отклонить
                    </button>

                    <button
                        type="button"
                        onClick={() => onApprove(item.id)}
                        className="flex h-8 flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-500 text-xs font-semibold text-white transition hover:bg-emerald-600 shadow-2xs"
                        title="Одобрить"
                    >
                        <Check className="h-3.5 w-3.5" />
                        Одобрить
                    </button>
                </div>
            </div>
        </div>
    );
}