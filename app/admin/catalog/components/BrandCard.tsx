import Link from 'next/link';
import { Car, ChevronRight } from 'lucide-react';
import { BrandCatalog } from '../types';

interface Props {
    catalog: BrandCatalog;
}

export function BrandCard({ catalog }: Props) {
    return (
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/40 px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                    <Car className="h-4 w-4 text-[var(--text-muted)]" />
                    <h3 className="font-bold text-base text-[var(--text)]">
                        {catalog.brand}
                    </h3>
                </div>
                <span className="text-xs text-[var(--text-dim)]">
                    {catalog.models.length} моделей в базе
                </span>
            </div>

            <div className="divide-y divide-[var(--border)]/40">
                {catalog.models.map((model) => (
                    <Link
                        key={model.slug}
                        href={`/admin/catalog/${catalog.slug}/${model.slug}`}
                        className="flex items-center justify-between p-4 transition-colors hover:bg-[var(--bg-elevated)]/40"
                    >
                        <div className="space-y-0.5">
                            <p className="font-semibold text-sm text-[var(--text)]">
                                {model.name}
                            </p>
                            <p className="text-xs text-[var(--text-dim)]">
                                Поколение / годы: {model.years}
                            </p>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-xs text-[var(--text-dim)]">Запчастей</p>
                                <p className="font-medium text-xs text-[var(--text)]">
                                    {model.partsCount} позиций
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-xs font-semibold text-emerald-500">
                                        {model.verifiedPercent}% проверено
                                    </span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-[var(--text-dim)]" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}