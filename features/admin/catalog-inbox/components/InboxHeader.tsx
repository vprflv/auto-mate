import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, CarFront, Package } from 'lucide-react';

interface Props {
    activeTab: 'all' | 'cars' | 'parts';
    totalCount: number;
    carCount: number;
    partCount: number;
    onSelectTab: (tab: 'all' | 'cars' | 'parts') => void;
}

export function InboxHeader({
                                activeTab,
                                totalCount,
                                carCount,
                                partCount,
                                onSelectTab,
                            }: Props) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <Link
                    href="/admin/catalog"
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--text)]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Назад в каталог моделей
                </Link>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[var(--text)]">
                        Модерация входящих
                    </h2>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Верификация новых моделей и запчастей перед внесением в Master Catalog
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => onSelectTab('all')}
                        className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                            activeTab === 'all'
                                ? 'bg-[var(--text)] text-[var(--bg)] font-semibold'
                                : 'bg-[var(--card)] text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--bg-elevated)]'
                        }`}
                    >
                        Все ({totalCount})
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelectTab('cars')}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                            activeTab === 'cars'
                                ? 'bg-[var(--text)] text-[var(--bg)] font-semibold'
                                : 'bg-[var(--card)] text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--bg-elevated)]'
                        }`}
                    >
                        <CarFront className="h-3.5 w-3.5" />
                        Новые авто ({carCount})
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelectTab('parts')}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                            activeTab === 'parts'
                                ? 'bg-[var(--text)] text-[var(--bg)] font-semibold'
                                : 'bg-[var(--card)] text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--bg-elevated)]'
                        }`}
                    >
                        <Package className="h-3.5 w-3.5" />
                        Запчасти ({partCount})
                    </button>
                </div>
            </div>
        </div>
    );
}