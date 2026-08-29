'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Loader2 } from 'lucide-react';
import { Car } from '@/types';
import {
    getCachedCatalog,
    saveCatalog,
} from '@/features/catalog/lib/storage';
import { catalogProvider } from '@/features/catalog/lib/providers';

type Props = {
    car: Car;
};

export default function CarTitle({ car }: Props) {
    const router = useRouter();
    const [hasCatalog, setHasCatalog] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        setHasCatalog(!!getCachedCatalog(car.id));
    }, [car.id]);

    const handleGenerateCatalog = async () => {
        if (getCachedCatalog(car.id)) {
            router.push(`/garage/${car.id}/catalog`);
            return;
        }

        try {
            setIsGenerating(true);

            const catalog = await catalogProvider.getCatalog({
                carId: car.id,
                vin: car.vin,
                make: car.make,
                model: car.model,
                year: car.year,
            });

            saveCatalog(catalog);
            setHasCatalog(true);
            router.push(`/garage/${car.id}/catalog`);
        } catch (e) {
            console.error(e);
            alert('Не удалось сгенерировать каталог');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10">
            <div>
                <h1 className="text-4xl font-bold leading-tight text-[#F5F5F5]">
                    {car.nickname || `${car.make} ${car.model}`}
                </h1>
                <p className="text-[#A3A3A3] mt-2 text-lg">
                    {car.make} {car.model} • {car.year}
                    {car.color ? ` • ${car.color}` : ''}
                </p>
                <p className="font-mono text-sm text-[#666666] mt-2 tracking-wide">
                    {car.vin}
                </p>
            </div>

            <div className="flex flex-wrap gap-3">
                <Link
                    href={`/garage/${car.id}/edit`}
                    className="bg-[#1F1F1F] hover:bg-[#2A2A2A] px-5 py-3 rounded-xl text-sm font-medium text-[#F5F5F5] transition"
                >
                    Редактировать
                </Link>

                <button
                    type="button"
                    onClick={handleGenerateCatalog}
                    disabled={isGenerating}
                    className="inline-flex items-center justify-center gap-2 bg-[#1F1F1F] hover:bg-[#2A2A2A] disabled:opacity-60 px-5 py-3 rounded-xl text-sm font-medium text-[#F5F5F5] transition"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Генерация...
                        </>
                    ) : (
                        <>
                            <BookOpen size={16} />
                            {hasCatalog ? 'Открыть каталог' : 'Сгенерировать каталог'}
                        </>
                    )}
                </button>

                <Link
                    href={`/garage/${car.id}/service/add`}
                    className="bg-[#39FF14] hover:bg-[#57FF3A] px-5 py-3 rounded-xl text-sm font-medium text-black transition shadow-[0_0_16px_rgba(57,255,20,0.25)]"
                >
                    + Добавить ТО
                </Link>
            </div>
        </div>
    );
}