import { Tag } from 'lucide-react';

import type { StoredPartItem } from '@/features/admin/lib/system-store/types';

interface Props {
    part: Pick<StoredPartItem, 'brand' | 'article'>;
}

export function PartIdentity({ part }: Props) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 p-4">
                <p className="mb-1 text-[10px] font-bold uppercase text-[var(--text-dim)]">
                    Производитель
                </p>

                <p className="break-words text-lg font-bold text-[var(--text)]">
                    {part.brand}
                </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 p-4">
                <p className="mb-1 text-[10px] font-bold uppercase text-[var(--text-dim)]">
                    Артикул
                </p>

                <p className="flex items-center gap-2 font-mono text-lg font-bold text-[var(--text)]">
                    <Tag className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />

                    <span className="break-all">
                        {part.article}
                    </span>
                </p>
            </div>
        </div>
    );
}