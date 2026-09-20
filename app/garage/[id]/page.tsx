'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCar } from '@/features/garage/car/hooks/useCar';
import CarHeader from '@/features/garage/car/components/CarHeader';
import CarTitle from '@/features/garage/car/components/CarTitle';
import CarSectionNav from '@/features/garage/car/components/CarSectionNav';
import CarSectionContent from '@/features/garage/car/components/CarSectionContent';
import { CarSection } from "@/features/garage/car/types/types";

export default function CarPage() {
    const params = useParams();
    const id = params.id as string;

    const { car, records, loading, deleteCar, updateCar, deleteRecord, updateRecord } = useCar(id);
    const [section, setSection] = useState<CarSection>('overview');

    // Экран загрузки на переменных темы с эффектом пульсации
    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center transition-colors duration-200">
                <p className="text-[var(--text-muted)] text-lg font-medium animate-pulse">
                    Загрузка...
                </p>
            </div>
        );
    }

    // Экран «Автомобиль не найден» с адаптивной ссылкой
    if (!car) {
        return (
            <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col items-center justify-center gap-4 transition-colors duration-200">
                <p className="text-[var(--text-muted)] text-lg">Автомобиль не найден</p>
                <Link
                    href="/garage"
                    className="text-[var(--link)] font-semibold underline decoration-2 underline-offset-4 transition-all duration-200 hover:text-[var(--btn-primary-hover)] active:scale-95"
                >
                    Вернуться в гараж
                </Link>
            </div>
        );
    }

    return (
        /* Главный контейнер страницы полностью на глобальных токенах */
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] relative w-full overflow-x-hidden transition-colors duration-200">
            <CarHeader />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative z-10 bg-transparent">
                <div className="mb-6">
                    <CarTitle car={car} />
                </div>

                {/* Адаптивная структура: колонка на мобильных, гибкий ряд на десктопе */}
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    <div className="md:w-64 shrink-0">
                        <CarSectionNav section={section} onChange={setSection} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <CarSectionContent
                            section={section}
                            car={car}
                            records={records}
                            onUpdateCar={updateCar}
                            onUpdateRecord={updateRecord}
                            onDeleteRecord={deleteRecord}
                            onDeleteCar={deleteCar}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
