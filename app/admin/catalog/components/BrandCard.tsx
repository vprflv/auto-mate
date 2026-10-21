import Link from 'next/link';
import { Car, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { BrandCatalog } from '../types';

interface Props {
    catalog: BrandCatalog;
}

export function BrandCard({ catalog }: Props) {
    return (
        <div className="space-y-4 mb-8 last:mb-0">
            {/* Заголовок Марки */}
            <div className="flex items-center gap-3 px-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--border)]/60">
                    <Car className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text)]">
                    {catalog.brand}
                </h3>
                <span className="rounded-full bg-[var(--bg-elevated)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-muted)] border border-[var(--border)]/40">
                    {catalog.models.length} моделей
                </span>
            </div>

            {/* Сетка карточек моделей */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {catalog.models.map((model) => {
                    const isHighTrust = model.verifiedPercent >= 80;
                    const isMediumTrust = model.verifiedPercent >= 40 && model.verifiedPercent < 80;

                    return (
                        <Link
                            key={model.slug}
                            href={`/admin/catalog/${catalog.slug}/${model.slug}`}
                            className="group flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all duration-200 hover:border-[var(--link)] hover:shadow-sm"
                        >
                            <div className="mb-4 flex items-start justify-between gap-2">
                                <div>
                                    <h4 className="text-base font-bold text-[var(--text)] transition-colors group-hover:text-[var(--link)]">
                                        {model.name}
                                    </h4>
                                    <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">
                                        {model.years}
                                    </p>
                                </div>

                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-[var(--text-dim)] transition-colors group-hover:bg-[var(--link)]/10 group-hover:text-[var(--link)]">
                                    <ChevronRight className="h-4 w-4" />
                                </div>
                            </div>

                            <div className="flex items-end justify-between border-t border-[var(--border)]/40 pt-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">
                                        Запчастей
                                    </p>
                                    <p className="mt-0.5 text-sm font-bold text-[var(--text)]">
                                        {model.partsCount}
                                    </p>
                                </div>

                                <div className="flex flex-col items-end">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">
                                        Проверено
                                    </p>
                                    <div className={`mt-0.5 flex items-center gap-1.5 text-sm font-bold ${
                                        isHighTrust
                                            ? 'text-emerald-500'
                                            : isMediumTrust
                                                ? 'text-amber-500'
                                                : 'text-rose-500'
                                    }`}>
                                        {isHighTrust ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <ShieldAlert className="h-4 w-4" />
                                        )}
                                        {model.verifiedPercent}%
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}