'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { usePartPriceSearch } from '@/features/price/hooks/usePartPriceSearch';

function getCarFromStorage(carId: string) {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('automate-garage');
        if (!raw) return null;
        const cars = JSON.parse(raw);
        return cars.find((c: any) => c.id === carId) || null;
    } catch {
        return null;
    }
}

export default function BuyPage({
                                    params,
                                }: {
    params: Promise<{ id: string }>;
}) {
    const { id: carId } = use(params);
    const searchParams = useSearchParams();

    const name = searchParams.get('name') || '';
    const oem = searchParams.get('oem') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const analog = searchParams.get('analog') || undefined;

    const car = getCarFromStorage(carId);

    const request = useMemo(() => {
        if (!car || !name) return null;
        return {
            carId,
            make: car.make,
            model: car.model,
            year: car.year,
            vin: car.vin,
            name,
            brand,
            oemNumber: oem,
            analogNumber: analog,
        };
    }, [car, carId, name, brand, oem, analog]);

    const { data: offers = [], isLoading } = usePartPriceSearch(request);

    if (!car) {
        return (
            <div className="p-6 text-center text-zinc-400">Машина не найдена</div>
        );
    }

    if (!name) {
        return (
            <div className="p-6 text-center text-zinc-400">
                Не выбрана запчасть
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-4 py-3">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/garage/${carId}/catalog`}
                        className="text-zinc-400 hover:text-white"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="min-w-0">
                        <h1 className="font-semibold truncate">Где купить</h1>
                        <p className="text-xs text-zinc-500 truncate">
                            {car.make} {car.model} • {name}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-6 max-w-3xl mx-auto">
                {/* Карточка запроса */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
                    {oem && (
                        <p className="text-xs font-mono text-zinc-400 mb-1">{oem}</p>
                    )}
                    <h2 className="font-medium">{name}</h2>
                    {brand && <p className="text-sm text-zinc-500 mt-1">{brand}</p>}
                </div>

                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 mb-5">
                    Цены и наличие нужно проверять на сайте продавца.
                    Мы пока открываем умный поиск, а не гарантируем точную позицию.
                </div>

                {isLoading ? (
                    <p className="text-center text-zinc-500 py-10">Ищем предложения...</p>
                ) : (
                    <div className="space-y-3">
                        {offers.map((offer) => (
                            <a
                                key={offer.id}
                                href={offer.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-4 transition"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm text-zinc-400 mb-0.5">{offer.shop}</p>
                                    <p className="font-medium truncate">{offer.title}</p>
                                    {offer.note && (
                                        <p className="text-xs text-zinc-500 mt-1">{offer.note}</p>
                                    )}
                                </div>
                                <ExternalLink size={18} className="text-zinc-500 shrink-0" />
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}