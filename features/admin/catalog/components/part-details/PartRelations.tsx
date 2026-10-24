import { Link as LinkIcon } from 'lucide-react';

import type { StoredPartItem } from '@/features/admin/lib/system-store/types';

interface Props {
    targetNumbers: string[];
    relatedParts: StoredPartItem[];
}

export function PartRelations({
                                  targetNumbers,
                                  relatedParts
                              }: Props) {
    if (targetNumbers.length === 0) return null;

    return (
        <section className="overflow-hidden rounded-2xl border border-[var(--border)]/40 bg-[var(--card)]">
            <div className="flex flex-col gap-2 border-b border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 px-4 py-3">
                <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-[var(--text-muted)]" />

                    <h3 className="text-sm font-bold text-[var(--text)]">
                        Цепочка аналогов
                    </h3>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-[var(--text-muted)]">
                        Связь по OEM:
                    </span>

                    {targetNumbers.map((number, index) => (
                        <span
                            key={`${number}-${index}`}
                            className="break-all rounded border border-[var(--border)]/50 bg-[var(--bg-elevated)] px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--text-muted)]"
                        >
                            {number}
                        </span>
                    ))}
                </div>
            </div>

            {relatedParts.length > 0 ? (
                <div className="divide-y divide-[var(--border)]/30">
                    {relatedParts.map(related => (
                        <div
                            key={related.id}
                            className="flex flex-col justify-between gap-3 px-4 py-3 transition hover:bg-[var(--bg-elevated)]/20 sm:flex-row sm:items-center"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <div
                                    className={`h-2 w-2 shrink-0 rounded-full shadow-sm ${
                                        related.isOem
                                            ? 'bg-amber-500 shadow-amber-500/40'
                                            : 'bg-blue-500 shadow-blue-500/40'
                                    }`}
                                />

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-bold text-[var(--text)]">
                                            {related.brand}
                                        </p>

                                        {related.isOem && (
                                            <span className="rounded border border-amber-500/20 bg-amber-500/10 px-1 text-[9px] font-bold uppercase tracking-wider text-amber-500">
                                                Оригинал
                                            </span>
                                        )}
                                    </div>

                                    <p className="break-words text-xs text-[var(--text-muted)]">
                                        {related.name}
                                    </p>
                                </div>
                            </div>

                            <div className="sm:text-right">
                                <p className="break-all font-mono text-sm font-bold text-[var(--text)]">
                                    {related.article}
                                </p>

                                <p className="text-[10px] font-medium text-emerald-500">
                                    Установок: {related.installationsCount}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">
                    В базе пока нет других деталей,
                    связанных с указанными OEM-номерами.
                </div>
            )}
        </section>
    );
}