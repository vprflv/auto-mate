'use client';

import * as React from 'react';
import { CarFront, Check, X, ShieldAlert } from 'lucide-react';
import { InboxItem } from '@/features/admin/lib/systemStore';

interface Props {
    item: InboxItem;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

export function CarInboxCard({ item, onApprove, onReject }: Props) {
    const specs = item.specs;

    return (
        <div className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--border)]/40 bg-[var(--card)] transition-all duration-200 hover:border-[var(--link)]/40 hover:shadow-sm">
            {/* Верхний блок превью (как в FluidCard на скрине) */}
            <div className="relative flex h-36 w-full flex-col items-center justify-center border-b border-[var(--border)]/30 bg-[var(--bg-elevated)]/60 p-3 text-center">
                {/* Бейдж статуса в углу */}
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500 border border-amber-500/20">
                    <CarFront className="h-3 w-3" />
                    Модель
                </span>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--card)] text-[var(--text-muted)] shadow-2xs border border-[var(--border)]/40">
                    <CarFront className="h-6 w-6 stroke-[1.5]" />
                </div>

                <span className="mt-2 text-[11px] font-medium text-[var(--text-dim)]">
                    {item.year ? `${item.year} г.в.` : 'Год не указан'}
                </span>
            </div>

            {/* Информационный блок */}
            <div className="flex flex-1 flex-col justify-between p-4">
                <div className="space-y-2">
                    <div>
                        <h4 className="truncate text-base font-bold text-[var(--text)]" title={`${item.carBrand} ${item.carModel}`}>
                            {item.carBrand} {item.carModel}
                        </h4>
                        <p className="truncate text-xs text-[var(--text-muted)]">
                            от {item.submittedBy}
                        </p>
                    </div>

                    {/* Компактные теги характеристик ТС */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                        <div className="truncate rounded-lg bg-[var(--bg-elevated)] px-2 py-1 text-[var(--text-muted)] border border-[var(--border)]/40">
                            ДВС: <span className="font-semibold text-[var(--text)]">{specs?.displacementL ? `${specs.displacementL} л` : item.engine || '—'}</span>
                        </div>
                        <div className="truncate rounded-lg bg-[var(--bg-elevated)] px-2 py-1 text-[var(--text-muted)] border border-[var(--border)]/40">
                            КПП: <span className="font-semibold text-[var(--text)]">{specs?.transmission || '—'}</span>
                        </div>
                        <div className="truncate rounded-lg bg-[var(--bg-elevated)] px-2 py-1 text-[var(--text-muted)] border border-[var(--border)]/40">
                            Кузов: <span className="font-semibold text-[var(--text)]">{specs?.bodyClass || '—'}</span>
                        </div>
                        <div className="truncate rounded-lg bg-[var(--bg-elevated)] px-2 py-1 font-mono text-[var(--text-muted)] border border-[var(--border)]/40" title={specs?.vin}>
                            VIN: <span className="font-semibold text-[var(--text)]">{specs?.vin ? specs.vin.slice(-6) : '—'}</span>
                        </div>
                    </div>
                </div>

                {/* Кнопки действий модератора */}
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