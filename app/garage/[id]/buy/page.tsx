'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';

import { usePartPriceSearch } from '@/features/price/hooks/usePartPriceSearch';

function getCarFromStorage(carId: string) {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const raw =
            localStorage.getItem('automate-garage');

        if (!raw) {
            return null;
        }

        const cars = JSON.parse(raw);

        return (
            cars.find(
                (c: any) => c.id === carId
            ) || null
        );
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
    const oem =
        searchParams.get('oem') || undefined;
    const brand =
        searchParams.get('brand') || undefined;
    const analog =
        searchParams.get('analog') || undefined;

    const car = getCarFromStorage(carId);

    const request = useMemo(() => {
        if (!car || !name) {
            return null;
        }

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
    }, [
        car,
        carId,
        name,
        brand,
        oem,
        analog,
    ]);

    const {
        data: offers = [],
        isLoading,
    } = usePartPriceSearch(request);

    if (!car) {
        return (
            <div className="p-6 text-center text-[var(--text-muted)]">
                Машина не найдена
            </div>
        );
    }

    if (!name) {
        return (
            <div className="p-6 text-center text-[var(--text-muted)]">
                Не выбрана запчасть
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
            <div className="sticky top-0 z-10 bg-[var(--bg)]/90 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/garage/${carId}/catalog`}
                        className="text-[var(--text-muted)] transition-colors hover:text-[var(--link)]"
                    >
                        <ArrowLeft size={20} />
                    </Link>

                    <div className="min-w-0">
                        <h1 className="truncate font-semibold">
                            Где купить
                        </h1>

                        <p className="truncate text-xs text-[var(--text-dim)]">
                            {car.make} {car.model} •{' '}
                            {name}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-3xl p-4 md:p-6">
                {/* Карточка запроса */}
                <div className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                    {oem && (
                        <p className="mb-1 font-mono text-xs text-[var(--text-muted)]">
                            {oem}
                        </p>
                    )}

                    <h2 className="font-medium">
                        {name}
                    </h2>

                    {brand && (
                        <p className="mt-1 text-sm text-[var(--text-dim)]">
                            {brand}
                        </p>
                    )}
                </div>

                <div className="mb-5 rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
                    Цены и наличие нужно проверять на
                    сайте продавца. Мы пока открываем
                    умный поиск, а не гарантируем точную
                    позицию.
                </div>

                {isLoading ? (
                    <p className="py-10 text-center text-[var(--text-dim)]">
                        Ищем предложения...
                    </p>
                ) : (
                    <div className="space-y-3">
                        {offers.map((offer) => (
                            <a
                                key={offer.id}
                                href={offer.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 transition-colors hover:border-[var(--text-muted)]"
                            >
                                <div className="min-w-0">
                                    <p className="mb-0.5 text-sm text-[var(--text-muted)]">
                                        {offer.shop}
                                    </p>

                                    <p className="truncate font-medium">
                                        {offer.title}
                                    </p>

                                    {offer.note && (
                                        <p className="mt-1 text-xs text-[var(--text-dim)]">
                                            {offer.note}
                                        </p>
                                    )}
                                </div>

                                <ExternalLink
                                    size={18}
                                    className="shrink-0 text-[var(--text-dim)]"
                                />
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}