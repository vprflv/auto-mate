import Link from 'next/link';
import {
    ChevronLeft,
    CarFront,
    Users,
    CheckCircle2
} from 'lucide-react';

import type { StoredMasterModel } from '@/features/admin/lib/system-store/types';

interface Props {
    model: StoredMasterModel;
}

export function ModelCatalogHeader({ model }: Props) {
    return (
        <div className="space-y-4">
            <Link
                href="/admin/catalog"
                className="inline-flex items-center gap-1 text-sm font-medium text-[var(--text-muted)] transition hover:text-[var(--link)]"
            >
                <ChevronLeft className="h-4 w-4" />
                Назад к списку марок
            </Link>

            <div className="relative overflow-hidden rounded-3xl border border-[var(--border)]/40 bg-[var(--card)] p-6 shadow-sm sm:p-8">
                <div className="pointer-events-none absolute -right-10 -top-10 text-[var(--bg-elevated)]/50">
                    <CarFront className="h-64 w-64 rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                    <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="break-words text-3xl font-extrabold tracking-tight text-[var(--text)]">
                                {model.brandName}{' '}
                                {model.modelName}
                            </h1>

                            {model.verified && (
                                <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-500">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Эталон
                                </span>
                            )}
                        </div>

                        <p className="text-sm text-[var(--text-muted)]">
                            Годы выпуска:{' '}
                            <span className="text-[var(--text)]">
                                {model.years}
                            </span>
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-[var(--border)]/50 bg-[var(--bg-elevated)]/60 px-5 py-3">
                        <Users className="h-5 w-5 text-[var(--link)]" />

                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">
                                В гаражах пользователей
                            </p>

                            <p className="text-xl font-black text-[var(--text)]">
                                {model.registeredCount || 0} авто
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}