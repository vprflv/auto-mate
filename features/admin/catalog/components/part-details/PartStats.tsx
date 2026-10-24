import { Activity } from 'lucide-react';

import type { StoredPartItem } from '@/features/admin/lib/system-store/types';

interface Props {
    part: Pick<
        StoredPartItem,
        'installationsCount' | 'compatibilityScore'
    >;
}

export function PartStats({ part }: Props) {
    return (
        <section className="rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 p-4">
            <div className="mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-[var(--text-muted)]" />

                <h3 className="text-[10px] font-bold uppercase text-[var(--text-dim)]">
                    Статистика
                </h3>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-[var(--text-muted)]">
                        Успешных установок
                    </span>

                    <span className="text-sm font-bold text-[var(--text)]">
                        {part.installationsCount}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-[var(--text-muted)]">
                        Индекс доверия
                    </span>

                    <span className="text-sm font-bold text-emerald-500">
                        {part.compatibilityScore}%
                    </span>
                </div>
            </div>
        </section>
    );
}