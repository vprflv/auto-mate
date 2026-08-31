import Link from 'next/link';
import { ArrowLeft, RefreshCw, Search } from 'lucide-react';
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
        <div className="sticky top-0 z-10 bg-[#0A0A0A]/90 backdrop-blur border-b border-[#2A2A2A] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <Link
                        href={`/garage/${car.id}`}
                        className="text-[#A3A3A3] hover:text-[#39FF14] transition"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="min-w-0">
                        <h1 className="font-semibold truncate text-[#F5F5F5]">
                            Каталог · {car.make} {car.model}
                        </h1>
                        <p className="text-xs text-[#666666]">{car.year} г.</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={isFetching}
                    className="p-2 rounded-lg hover:bg-[#1F1F1F] text-[#A3A3A3] hover:text-[#39FF14] disabled:opacity-50 transition"
                    title="Обновить каталог"
                >
                    <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="mt-3 relative">
                <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]"
                />
                <input
                    type="text"
                    placeholder="Поиск по названию или артикулу..."
                    value={search}
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full bg-[#161616] border border-[#2A2A2A] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#F5F5F5] placeholder:text-[#666666] focus:outline-none focus:border-[#39FF14] transition"
                />
            </div>

            {showDisclaimer && (
                <div className="mt-3 rounded-2xl border border-[#2A2A2A] bg-[#161616] px-4 py-3 text-sm text-[#A3A3A3]">
                    <p className="font-medium text-[#F5F5F5]">Справочный каталог</p>
                    <p className="mt-1">
                        Подбор выполнен автоматически и может содержать неточности.
                        Перед покупкой обязательно проверяйте применимость по VIN
                        и оригинальным каталогам производителя.
                    </p>
                </div>
            )}
        </div>
    );
}