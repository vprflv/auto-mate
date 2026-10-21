'use client';

import * as React from 'react';
import { CarFront, Check, X, Loader2 } from 'lucide-react';
import { InboxItem } from '@/features/admin/lib/systemStore';
import { storage } from '@/features/admin/lib/system-store/storage';

interface Props {
    item: InboxItem;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

export function CarInboxCard({ item, onApprove, onReject }: Props) {
    // Читаем правильные ключи из InboxItem: carSpecs и carYear
    const specs = item.carSpecs || (item as any).specs || {};

    const [brand, setBrand] = React.useState(item.carBrand || '');
    const [model, setModel] = React.useState(item.carModel || '');
    const [years, setYears] = React.useState(
        item.carYear ? `${item.carYear} – н.в.` : '2015 – н.в.'
    );

    const [status, setStatus] = React.useState<'idle' | 'approving' | 'rejecting'>('idle');

    const handleApprove = () => {
        if (status !== 'idle') return;
        setStatus('approving');

        const state = storage.getState();
        const target = state.inbox.find((i) => i.id === item.id);
        if (target) {
            (target as any).adminCarBrand = brand.trim();
            (target as any).adminCarModel = model.trim();
            (target as any).adminYears = years.trim();
            storage.saveState(state);
        }

        onApprove(item.id);
    };

    const handleReject = () => {
        if (status !== 'idle') return;
        setStatus('rejecting');
        onReject(item.id);
    };

    return (
        <div className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--border)]/40 bg-[var(--card)] transition-all duration-200 hover:border-[var(--link)]/40 hover:shadow-sm">
            <div className="relative flex h-32 w-full flex-col items-center justify-center border-b border-[var(--border)]/30 bg-[var(--bg-elevated)]/60 p-3 text-center">
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500 border border-amber-500/20">
                    <CarFront className="h-3 w-3" />
                    Новая Модель
                </span>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--card)] text-[var(--text-muted)] shadow-2xs border border-[var(--border)]/40">
                    <CarFront className="h-6 w-6 stroke-[1.5]" />
                </div>

                <p className="mt-2 text-xs text-[var(--text-dim)]">от {item.submittedBy}</p>
            </div>

            <div className="flex flex-1 flex-col justify-between p-4 space-y-4">

                {/* Форма редактирования для Master Catalog */}
                <div className="space-y-2.5">
                    <div>
                        <label className="block text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider mb-0.5">
                            Марка (Brand)
                        </label>
                        <input
                            type="text"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]/60 px-2.5 py-1.5 text-xs font-semibold text-[var(--text)] outline-none focus:border-[var(--btn-primary)]"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider mb-0.5">
                            Модель
                        </label>
                        <input
                            type="text"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]/60 px-2.5 py-1.5 text-xs font-semibold text-[var(--text)] outline-none focus:border-[var(--btn-primary)]"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider mb-0.5">
                            Поколение / Годы
                        </label>
                        <input
                            type="text"
                            value={years}
                            onChange={(e) => setYears(e.target.value)}
                            placeholder="Например: 2013 – 2020"
                            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]/60 px-2.5 py-1.5 text-xs font-medium text-[var(--text)] outline-none focus:border-[var(--btn-primary)]"
                        />
                    </div>
                </div>

                {/* Данные от пользователя (Справочно) */}
                <div className="rounded-xl border border-dashed border-[var(--border)]/60 bg-[var(--bg-elevated)]/30 p-2.5">
                    <p className="mb-2 text-[10px] font-bold uppercase text-[var(--text-dim)]">Спецификация авто:</p>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        <div className="truncate rounded-md bg-[var(--card)] px-2 py-1 text-[var(--text-muted)] border border-[var(--border)]/40">
                            ДВС: <span className="font-medium text-[var(--text)]">{specs?.displacementL ? `${specs.displacementL} л` : item.engine || '—'}</span>
                        </div>
                        <div className="truncate rounded-md bg-[var(--card)] px-2 py-1 text-[var(--text-muted)] border border-[var(--border)]/40">
                            КПП: <span className="font-medium text-[var(--text)]">{specs?.transmission || '—'}</span>
                        </div>
                        <div className="truncate rounded-md bg-[var(--card)] px-2 py-1 text-[var(--text-muted)] border border-[var(--border)]/40">
                            Привод: <span className="font-medium text-[var(--text)]">{specs?.driveType || '—'}</span>
                        </div>
                        <div className="truncate rounded-md bg-[var(--card)] px-2 py-1 text-[var(--text-muted)] border border-[var(--border)]/40">
                            Топливо: <span className="font-medium text-[var(--text)]">{specs?.fuel || '—'}</span>
                        </div>
                        <div className="truncate rounded-md bg-[var(--card)] px-2 py-1 font-mono text-[var(--text-muted)] border border-[var(--border)]/40" title={specs?.vin}>
                            VIN: <span className="font-medium text-[var(--text)]">{specs?.vin ? specs.vin : '—'}</span>
                        </div>
                        {specs?.trim && (
                            <div className="truncate rounded-md bg-[var(--card)] px-2 py-1 text-[var(--text-muted)] border border-[var(--border)]/40">
                                Комп.: <span className="font-medium text-[var(--text)]">{specs.trim}</span>
                            </div>
                        )}
                        <div className="col-span-2 truncate rounded-md bg-[var(--card)] px-2 py-1 text-[var(--text-muted)] border border-[var(--border)]/40">
                            Кузов: <span className="font-medium text-[var(--text)]">{specs?.bodyClass || '—'}</span>
                        </div>
                    </div>
                </div>

                {/* Кнопки действий */}
                <div className="mt-2 flex items-center gap-2 border-t border-[var(--border)]/40 pt-3">
                    <button
                        type="button"
                        disabled={status !== 'idle'}
                        onClick={handleReject}
                        className="flex h-8 flex-1 items-center justify-center gap-1 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs font-semibold text-rose-500 transition hover:bg-rose-500 hover:text-white disabled:opacity-50"
                    >
                        {status === 'rejecting' ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                        Отклонить
                    </button>

                    <button
                        type="button"
                        disabled={status !== 'idle'}
                        onClick={handleApprove}
                        className="flex h-8 flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-500 text-xs font-semibold text-white transition hover:bg-emerald-600 shadow-2xs disabled:opacity-50"
                    >
                        {status === 'approving' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                        Одобрить
                    </button>
                </div>
            </div>
        </div>
    );
}