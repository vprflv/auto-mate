'use client';

import * as React from 'react';
import { CarFront, X, Settings2 } from 'lucide-react';
import { InboxItem } from '@/features/admin/lib/systemStore';
import { CarModerationModal } from './CarModerationModal';

interface Props {
    item: InboxItem;
    onApprove: (id: string, payload?: any) => void;
    onReject: (id: string) => void;
}

export function CarInboxCard({ item, onApprove, onReject }: Props) {
    const specs = item.carSpecs || (item as any).specs || {};
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    return (
        <>
            <div className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--border)]/40 bg-[var(--card)] transition-all duration-200 hover:border-[var(--link)]/40 hover:shadow-sm">
                {/* Верхний блок превью */}
                <div className="relative flex h-32 w-full flex-col items-center justify-center border-b border-[var(--border)]/30 bg-[var(--bg-elevated)]/60 p-3 text-center">
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500 border border-amber-500/20">
                        <CarFront className="h-3 w-3" />
                        Новое авто
                    </span>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--card)] text-[var(--text-muted)] shadow-2xs border border-[var(--border)]/40">
                        <CarFront className="h-6 w-6 stroke-[1.5]" />
                    </div>

                    <p className="mt-2 text-xs text-[var(--text-dim)]">от {item.submittedBy}</p>
                </div>

                <div className="flex flex-1 flex-col justify-between p-4 space-y-4">
                    <div className="space-y-2">
                        <div>
                            <h4 className="truncate text-base font-bold text-[var(--text)]" title={`${item.carBrand} ${item.carModel}`}>
                                {item.carBrand} {item.carModel}
                            </h4>
                            <p className="truncate text-xs font-medium text-[var(--text-muted)]">
                                {item.carYear || specs.year || 'Год не указан'}
                            </p>
                        </div>

                        {/* Сырые данные пользователя */}
                        <div className="grid grid-cols-2 gap-1.5 pt-2 text-[10px]">
                            <div className="truncate rounded-md bg-[var(--bg-elevated)] px-2 py-1 text-[var(--text-muted)] border border-[var(--border)]/40">
                                ДВС: <span className="font-semibold text-[var(--text)]">{specs?.displacementL ? `${specs.displacementL} л` : item.engine || '—'}</span>
                            </div>
                            <div className="truncate rounded-md bg-[var(--bg-elevated)] px-2 py-1 text-[var(--text-muted)] border border-[var(--border)]/40">
                                КПП: <span className="font-semibold text-[var(--text)]">{specs?.transmission || '—'}</span>
                            </div>
                            <div className="truncate rounded-md bg-[var(--bg-elevated)] px-2 py-1 text-[var(--text-muted)] border border-[var(--border)]/40">
                                Комп.: <span className="font-semibold text-[var(--text)]">{specs?.trim || '—'}</span>
                            </div>
                            <div className="truncate rounded-md bg-[var(--bg-elevated)] px-2 py-1 font-mono text-[var(--text-muted)] border border-[var(--border)]/40" title={specs?.vin}>
                                VIN: <span className="font-semibold text-[var(--text)]">{specs?.vin ? specs.vin.slice(-6) : '—'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Кнопки */}
                    <div className="mt-2 flex items-center gap-2 border-t border-[var(--border)]/40 pt-3">
                        <button
                            type="button"
                            onClick={() => onReject(item.id)}
                            className="flex h-8 flex-1 items-center justify-center gap-1 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs font-semibold text-rose-500 transition hover:bg-rose-500 hover:text-white"
                            title="Отклонить как мусор"
                        >
                            <X className="h-3.5 w-3.5" />
                            Отклонить
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="flex h-8 flex-[1.2] items-center justify-center gap-1 rounded-xl bg-[var(--link)] text-xs font-bold text-[var(--btn-primary-text)] transition hover:bg-[var(--btn-primary-hover)] shadow-2xs"
                            title="Открыть пульт модерации"
                        >
                            <Settings2 className="h-3.5 w-3.5" />
                            Модерировать
                        </button>
                    </div>
                </div>
            </div>

            {/* Вызов нашей PIM-модалки */}
            <CarModerationModal
                item={item}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onApprove={(id, payload) => {
                    setIsModalOpen(false);
                    onApprove(id, payload);
                }}
                onReject={(id) => {
                    setIsModalOpen(false);
                    onReject(id);
                }}
            />
        </>
    );
}