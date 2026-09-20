'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
            toast.error('Не удалось сгенерировать каталог');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10 bg-transparent">
            <div>
                {/* Текст полностью переведён на переменные */}
                <h1 className="text-4xl font-bold leading-tight text-[var(--text)]">
                    {car.nickname || `${car.make} ${car.model}`}
                </h1>
                <p className="text-[var(--text-muted)] mt-2 text-lg">
                    {car.make} {car.model} • {car.year}
                    {car.color ? ` • ${car.color}` : ''}
                </p>
                <p className="font-mono text-sm text-[var(--text-dim)] mt-2 tracking-wide border border-[var(--border)]/20 inline-block px-2 py-0.5 rounded-md bg-[var(--card)]/40">
                    {car.vin || 'НЕТ VIN'}
                </p>
            </div>

            <div className="flex flex-wrap gap-3">
                <Link
                    href={`/garage/${car.id}/edit`}
                    className="bg-[var(--bg-elevated)] border border-[var(--border)]/40 hover:bg-[var(--border)]/20 px-5 py-3 rounded-xl text-sm font-medium text-[var(--text)] transition-all duration-200 cursor-pointer active:scale-95"
                >
                    Редактировать
                </Link>

                {/*
                  Умная кнопка каталога:
                  Если каталог ЕСТЬ: сливается со стилем остальных кнопок на bg-[var(--bg-elevated)]
                  Если каталога НЕТ: берёт главные акценты темы через bg-[var(--btn-primary)] (зелёный в dark, оранжевый в light)
                */}
                <button
                    type="button"
                    onClick={handleGenerateCatalog}
                    disabled={isGenerating}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-60 cursor-pointer active:scale-95 ${
                        hasCatalog
                            ? 'bg-[var(--bg-elevated)] border border-[var(--border)]/40 hover:bg-[var(--border)]/20 text-[var(--text)]'
                            : 'bg-[var(--btn-primary)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] [html[data-theme=dark]_&]:shadow-[0_0_16px_rgba(57,255,20,0.25)]'
                    }`}
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
                    className="bg-[var(--bg-elevated)] border border-[var(--border)]/40 hover:bg-[var(--border)]/20 px-5 py-3 rounded-xl text-sm font-medium text-[var(--text)] transition-all duration-200 cursor-pointer active:scale-95"
                >
                    + Добавить ТО
                </Link>
            </div>
        </div>
    );
}
