import * as React from 'react';
import { CarFront, Check, X } from 'lucide-react';
import { InboxItem } from '@/features/admin/lib/systemStore';
import { CarSpecsGrid } from './CarSpecsGrid';

interface Props {
    item: InboxItem;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

export function CarInboxCard({ item, onApprove, onReject }: Props) {
    return (
        <div className="flex flex-col gap-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-colors hover:border-[var(--link)]/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)]/50 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-500 uppercase tracking-wider">
                        <CarFront className="h-3.5 w-3.5" />
                        Новая модель автомобиля
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                        от <strong className="text-[var(--text)]">{item.submittedBy}</strong>
                    </span>
                    <span className="text-xs text-[var(--text-dim)]">• {item.submittedAt}</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onReject(item.id)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 text-xs font-semibold text-rose-500 transition-colors hover:bg-rose-500 hover:text-white"
                    >
                        <X className="h-3.5 w-3.5" />
                        Отклонить
                    </button>

                    <button
                        type="button"
                        onClick={() => onApprove(item.id)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-600 shadow-xs"
                    >
                        <Check className="h-3.5 w-3.5" />
                        Утвердить модель в Master Catalog
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <h3 className="text-xl font-bold text-[var(--text)] tracking-tight">
                        {item.carBrand} {item.carModel}{' '}
                        <span className="font-normal text-[var(--text-muted)]">
                            ({item.year || 'Год не указан'})
                        </span>
                    </h3>
                    {item.note && (
                        <p className="mt-0.5 text-xs text-[var(--text-dim)]">
                            {item.note}
                        </p>
                    )}
                </div>

                <CarSpecsGrid specs={item.specs} engineFallback={item.engine} />
            </div>
        </div>
    );
}