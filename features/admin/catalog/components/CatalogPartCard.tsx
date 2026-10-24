'use client';

import {
    Wrench,
    ShieldCheck,
    Tag,
    ThumbsUp,
    Link as LinkIcon
} from 'lucide-react';

import type { StoredPartItem } from '@/features/admin/lib/system-store/types';
import { getOemCrosses } from '@/features/admin/lib/system-store/oemCrosses';

interface Props {
    part: StoredPartItem;
    analogsCount: number;
    onOpen: (part: StoredPartItem) => void;
}

export function CatalogPartCard({
                                    part,
                                    analogsCount,
                                    onOpen
                                }: Props) {
    const oemNumbers = getOemCrosses(part);

    const compatibilityIds =
        part.compatibleModifications ?? [];

    const appliesToAll =
        compatibilityIds.includes('all');

    const compatibilityLabel = appliesToAll
        ? 'Все модификации модели'
        : compatibilityIds.length > 0
            ? `Модификаций: ${new Set(compatibilityIds).size}`
            : 'Применимость не уточнена';

    return (
        <button
            type="button"
            onClick={() => onOpen(part)}
            className="flex w-full cursor-pointer flex-col justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-left shadow-2xs transition hover:border-[var(--link)]/50 hover:bg-[var(--bg-elevated)]/30 sm:flex-row sm:items-center"
        >
            <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-[var(--text)]">
                        {part.brand}
                    </h3>

                    {part.isOem ? (
                        <span className="flex items-center gap-1 rounded border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-500">
                            <ShieldCheck className="h-3 w-3" />
                            Оригинал (OEM)
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">
                            <Wrench className="h-3 w-3" />
                            Аналог
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-2 font-mono text-sm text-[var(--text-muted)] sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                    <div className="flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 shrink-0" />

                        <span className="break-all font-bold">
                            {part.article}
                        </span>
                    </div>

                    {oemNumbers.length > 0 && (
                        <div className="flex items-start gap-1 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-xs text-blue-500/90">
                            <LinkIcon className="mt-0.5 h-3 w-3 shrink-0" />

                            <span className="min-w-0 break-words">
                                Кросс к OEM:{' '}
                                <span className="font-bold">
                                    {oemNumbers.join(', ')}
                                </span>
                            </span>
                        </div>
                    )}

                    {part.isOem && analogsCount > 0 && (
                        <div className="flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-500">
                            <LinkIcon className="h-3 w-3 shrink-0" />

                            <span>
                                Связанных аналогов:{' '}
                                <span className="font-bold">
                                    {analogsCount}
                                </span>
                            </span>
                        </div>
                    )}
                </div>

                <p className="break-words text-sm text-[var(--text)]">
                    {part.name}
                </p>

                <p
                    className={`text-xs ${
                        compatibilityIds.length > 0
                            ? 'text-[var(--text-muted)]'
                            : 'text-amber-500'
                    }`}
                >
                    {compatibilityLabel}
                </p>
            </div>

            <div className="flex shrink-0 items-center gap-6 sm:text-right">
                <div>
                    <p className="mb-1 text-[10px] font-bold uppercase text-[var(--text-dim)]">
                        Установок
                    </p>

                    <div className="flex items-center gap-1.5 font-semibold text-[var(--text)] sm:justify-end">
                        <ThumbsUp className="h-4 w-4 text-emerald-500" />
                        {part.installationsCount}
                    </div>
                </div>

                <div>
                    <p className="mb-1 text-[10px] font-bold uppercase text-[var(--text-dim)]">
                        Индекс доверия
                    </p>

                    <p
                        className={`font-black ${
                            part.compatibilityScore > 70
                                ? 'text-emerald-500'
                                : 'text-amber-500'
                        }`}
                    >
                        {part.compatibilityScore}%
                    </p>
                </div>
            </div>
        </button>
    );
}