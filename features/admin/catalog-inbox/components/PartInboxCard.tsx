import * as React from 'react';
import { Package, Check, X } from 'lucide-react';
import { InboxItem } from '@/features/admin/lib/systemStore';

interface Props {
    item: InboxItem;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

export function PartInboxCard({ item, onApprove, onReject }: Props) {
    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-colors hover:border-[var(--link)]/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)]/50 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-500 uppercase tracking-wider">
                        <Package className="h-3.5 w-3.5" />
                        Запчасть
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
                        Одобрить в каталог
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <span className="font-semibold text-[var(--text)]">
                            {item.carBrand} {item.carModel}
                        </span>
                        {item.engine && (
                            <span className="rounded-md bg-[var(--bg-elevated)] px-2 py-0.5 font-mono text-[var(--text-dim)]">
                                {item.engine}
                            </span>
                        )}
                        {item.nodeTitle && (
                            <>
                                <span>•</span>
                                <span>{item.nodeTitle}</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-[var(--text)]">
                            {item.partBrand}
                        </span>
                        <span className="rounded-lg bg-[var(--bg)] px-2 py-0.5 font-mono text-xs font-semibold text-[var(--text)] border border-[var(--border)]">
                            {item.partArticle}
                        </span>
                        <span className="text-sm text-[var(--text-muted)]">
                            {item.partName}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-dim)]">Индекс:</span>
                    <span className="font-mono text-sm font-bold text-emerald-500">
                        {item.suggestedScore}%
                    </span>
                </div>
            </div>
        </div>
    );
}