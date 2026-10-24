import {
    X,
    ShieldCheck,
    CheckCircle2,
    Wrench
} from 'lucide-react';

import type { StoredPartItem } from '@/features/admin/lib/system-store/types';

interface Props {
    part: StoredPartItem;
    onClose: () => void;
    titleId: string;
}

export function PartDetailsHeader({
                                      part,
                                      onClose,
                                      titleId
                                  }: Props) {
    return (
        <div className="flex shrink-0 items-start justify-between border-b border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 px-6 py-5">
            <div className="flex min-w-0 items-center gap-4">
                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                        part.isOem
                            ? 'border-amber-500/20 bg-amber-500/10 text-amber-500'
                            : 'border-[var(--link)]/20 bg-[var(--link)]/10 text-[var(--link)]'
                    }`}
                >
                    {part.isOem ? (
                        <ShieldCheck className="h-6 w-6" />
                    ) : (
                        <Wrench className="h-6 w-6" />
                    )}
                </div>

                <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                part.isOem
                                    ? 'bg-amber-500/10 text-amber-500'
                                    : 'border border-[var(--border)]/50 bg-[var(--bg-elevated)] text-[var(--text-dim)]'
                            }`}
                        >
                            {part.isOem
                                ? 'Оригинал (OEM)'
                                : 'Аналог (Aftermarket)'}
                        </span>

                        {part.isVerified && (
                            <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                                <CheckCircle2 className="h-3 w-3" />
                                Проверено
                            </span>
                        )}
                    </div>

                    <h2
                        id={titleId}
                        className="break-words text-xl font-bold text-[var(--text)]"
                    >
                        {part.name}
                    </h2>
                </div>
            </div>

            <button
                type="button"
                onClick={onClose}
                aria-label="Закрыть карточку запчасти"
                className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
            >
                <X className="h-5 w-5" />
            </button>
        </div>
    );
}