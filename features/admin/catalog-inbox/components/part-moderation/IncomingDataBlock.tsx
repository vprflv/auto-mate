import * as React from 'react';
import { Tag, Copy, Check } from 'lucide-react';
import { InboxItem } from '@/features/admin/lib/systemStore';

export function IncomingDataBlock({ specs, item }: { specs: any, item: InboxItem }) {
    const [copiedArticle, setCopiedArticle] = React.useState(false);

    const handleCopyArticle = () => {
        if (!specs.article) return;
        navigator.clipboard.writeText(specs.article);
        setCopiedArticle(true);
        setTimeout(() => setCopiedArticle(false), 2000);
    };

    return (
        <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">1. Входящие данные</h3>
            <div className="rounded-2xl border border-dashed border-[var(--border)]/60 bg-[var(--bg-elevated)]/20 p-5 space-y-4">
                <div>
                    <p className="text-[10px] font-bold uppercase text-[var(--text-dim)] mb-1.5">Заявленный артикул</p>
                    <button type="button" onClick={handleCopyArticle} className="flex w-full items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 transition hover:border-[var(--link)]/50">
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-[var(--text-muted)]" />
                            <span className="font-mono text-lg font-bold tracking-widest text-[var(--text)]">{specs.article || 'НЕТ ДАННЫХ'}</span>
                        </div>
                        {copiedArticle ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5 text-[var(--text-muted)]" />}
                    </button>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b border-[var(--border)]/20 pb-2">
                        <span className="text-[var(--text-dim)] font-medium">Производитель</span>
                        <span className="font-semibold text-[var(--text)]">{specs.brand || '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--border)]/20 pb-2">
                        <span className="text-[var(--text-dim)] font-medium">Название от юзера</span>
                        <span className="font-semibold text-[var(--text)] text-right">{specs.name || '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--border)]/20 pb-2">
                        <span className="text-[var(--text-dim)] font-medium">Тикет от</span>
                        <span className="font-semibold text-[var(--text)] text-right">{item.submittedBy}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}