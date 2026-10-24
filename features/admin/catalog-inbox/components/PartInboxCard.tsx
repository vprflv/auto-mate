'use client';

import * as React from 'react';
import { Wrench, User, Calendar, Tag, ShieldCheck, ArrowRight } from 'lucide-react';
import { InboxItem } from '@/features/admin/lib/systemStore';
import { storage } from '@/features/admin/lib/system-store/storage';

// Импортируем нашу крутую модалку
import { PartModerationModal } from './PartModerationModal';

export function PartInboxCard({ item }: { item: InboxItem }) {
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    // Подстраховка на случай, если данные лежат в старом формате
    const brand = item.partBrand || item.partSpecs?.brand || (item as any).specs?.brand || '—';
    const article = item.partArticle || item.partSpecs?.article || (item as any).specs?.article || '—';
    const name = item.partName || item.partSpecs?.name || (item as any).specs?.name || 'Не указано';
    const isOem = item.isOem ?? item.partSpecs?.isOem ?? (item as any).specs?.isOem ?? false;

    const handleApprove = (id: string, payload: any) => {
        storage.approvePartTicket(id, payload); // <--- Вызываем метод напрямую
        setIsModalOpen(false);
    };

    const handleReject = (id: string) => {
        storage.rejectTicket(id); // <--- Вызываем метод напрямую
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="group flex flex-col justify-between rounded-3xl border border-[var(--border)]/40 bg-[var(--card)] p-5 shadow-sm transition-all duration-300 hover:border-[var(--link)]/40 hover:shadow-md sm:p-6">

                {/* Шапка карточки */}
                <div className="flex items-start justify-between mb-4 border-b border-[var(--border)]/30 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            <Wrench className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--link)]">Новая деталь</span>
                            <h3 className="text-lg font-bold text-[var(--text)] leading-tight">
                                {item.carBrand} {item.carModel}
                            </h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-dim)]">
                        <Calendar className="h-3.5 w-3.5" />
                        {item.submittedAt || 'Только что'}
                    </div>
                </div>

                {/* Тело карточки: Данные детали */}
                <div className="flex-1 space-y-3 mb-6">
                    <div>
                        <p className="text-xs text-[var(--text-muted)] font-medium mb-0.5">Название (от пользователя)</p>
                        <p className="text-base font-bold text-[var(--text)]">{name || 'Не указано'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 rounded-2xl bg-[var(--bg-elevated)]/50 p-3 border border-[var(--border)]/40">
                        <div>
                            <p className="text-[10px] font-bold uppercase text-[var(--text-dim)] mb-1">Бренд</p>
                            <p className="text-sm font-semibold text-[var(--text)] flex items-center gap-1.5">
                                {brand || '—'}
                                {isOem && <ShieldCheck className="h-3.5 w-3.5 text-amber-500" title="Заявлен как оригинал" />}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase text-[var(--text-dim)] mb-1">Артикул</p>
                            <p className="text-sm font-mono font-bold text-[var(--text)] flex items-center gap-1.5">
                                <Tag className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                                {article || '—'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Футер карточки */}
                <div className="flex items-center justify-between border-t border-[var(--border)]/30 pt-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--border)]">
                            <User className="h-4 w-4 text-[var(--text-dim)]" />
                        </div>
                        <span className="font-medium">{item.submittedBy}</span>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="group/btn flex items-center gap-2 rounded-xl bg-[var(--link)] px-4 py-2 text-sm font-bold text-[var(--btn-primary-text)] transition hover:bg-[var(--btn-primary-hover)] hover:shadow-sm shadow-[0_0_15px_rgba(57,255,20,0.1)]"
                    >
                        Модерировать
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                </div>
            </div>

            {/* Рендерим модалку и передаем в нее пропсы */}
            <PartModerationModal
                item={item}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </>
    );
}