'use client';

import { useGarage } from "@/features/garage/hooks/useGarage";
import GarageHeader from "@/features/garage/components/GarageHeader";
import GarageTitle from "@/features/garage/components/GarageTitle";
import GarageEmpty from "@/features/garage/components/GarageEmpty";
import CarCard from "@/features/garage/components/CarCard";

export default function GaragePage() {
    const { cars, loading, removeCar, carsLabel } = useGarage();

    // Загрузка полностью адаптирована под цвета CSS-переменных
    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center">
                <p className="text-[var(--text-muted)] text-lg font-medium animate-pulse">
                    Загрузка...
                </p>
            </div>
        );
    }

    return (
        /* Основной контейнер использует глобальный цвет фона и текста */
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] relative w-full overflow-x-hidden transition-colors duration-200">

            {/* ДЕКОР СВЕТЛОЙ ТЕМЫ: Навешиваем mix-blend-multiply, чтобы силуэт красиво сливался с кремовым фоном #feffd7 */}
            <div
                className="pointer-events-none absolute inset-0 z-0 hidden [html[data-theme=light]_&]:block overflow-hidden"
                aria-hidden
            >
                <img
                    src="/images/decor/sedan-3.png"
                    alt=""
                    className="absolute right-[-50px] bottom-[50px] w-[500px] max-w-none opacity-15 mix-blend-multiply"
                />
            </div>

            {/* КОНТЕНТ ГАРАЖА: Поднят на z-10 и полностью прозрачен по умолчанию */}
            <div className="relative z-10 w-full bg-transparent">
                {/* <GarageHeader /> */}

                <main className="max-w-5xl mx-auto px-6 py-10">

                    {/* Контейнер заголовка */}
                    <div className="mb-10 text-[var(--text)]">
                        <GarageTitle carsLabel={carsLabel} />
                    </div>

                    {cars.length === 0 ? (
                        <GarageEmpty />
                    ) : (
                        /* Умная адаптивная сетка карточек: 1 колонка на смартфонах, 2 колонки на экранах побольше */
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 relative z-10">
                            {cars.map((car) => (
                                <CarCard
                                    key={car.id}
                                    car={car}
                                    onRemove={removeCar}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
