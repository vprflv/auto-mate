import Link from 'next/link';

import {
    ArrowLeft,
    RefreshCw,
    Search,
} from 'lucide-react';

import { Car } from '@/types';

type Props = {
    car: Car;
    search: string;
    onSearch: (value: string) => void;
    onRefresh: () => void;
    isFetching: boolean;
    showDisclaimer?: boolean;
};

export default function CatalogHeader({
                                          car,
                                          search,
                                          onSearch,
                                          onRefresh,
                                          isFetching,
                                          showDisclaimer,
                                      }: Props) {
    return (
        <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg)]/90 px-4 py-3 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <Link
                        href={`/garage/${car.id}`}
                        className="text-[var(--text-muted)] transition-colors hover:text-[var(--link)]"
                    >
                        <ArrowLeft size={20} />
                    </Link>

                    <div className="min-w-0">
                        <h1 className="truncate font-semibold text-[var(--text)]">
                            Каталог · {car.make}{' '}
                            {car.model}
                        </h1>

                        <p className="text-xs text-[var(--text-dim)]">
                            {car.year} г.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={isFetching}
                    className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--link)] disabled:opacity-50"
                    title="Обновить каталог"
                >
                    <RefreshCw
                        size={18}
                        className={
                            isFetching
                                ? 'animate-spin'
                                : ''
                        }
                    />
                </button>
            </div>

            <div className="relative mt-3">
                <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"
                />

                <input
                    type="text"
                    placeholder="Поиск по названию или артикулу..."
                    value={search}
                    onChange={(e) =>
                        onSearch(e.target.value)
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] py-2.5 pl-10 pr-4 text-sm text-[var(--text)] placeholder:text-[var(--text-dim)] transition-colors focus:border-[var(--link)] focus:outline-none"
                />
            </div>

            {showDisclaimer && (
                <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-muted)]">
                    <p className="font-medium text-[var(--text)]">
                        Справочный каталог
                    </p>

                    <p className="mt-1">
                        Подбор выполнен автоматически и
                        может содержать неточности.
                        Перед покупкой обязательно
                        проверяйте применимость по VIN
                        и оригинальным каталогам
                        производителя.
                    </p>
                </div>
            )}
        </div>
    );
}