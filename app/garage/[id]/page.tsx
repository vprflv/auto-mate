'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { useCar } from '@/features/garage/car/hooks/useCar';

import CarHeader from '@/features/garage/car/components/CarHeader';
import CarTitle from '@/features/garage/car/components/CarTitle';
import CarSectionNav from '@/features/garage/car/components/CarSectionNav';
import CarSectionContent from '@/features/garage/car/components/CarSectionContent';

import type { CarSection } from '@/features/garage/car/types/types';

const CONTENT_ID = 'car-section-content';

export default function CarPage() {
    const { id } = useParams<{ id: string }>();

    const {
        car,
        records,
        loading,
        deleteCar,
        updateCar,
        deleteRecord,
        updateRecord,
    } = useCar(id);

    const [section, setSection] =
        useState<CarSection>('overview');

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text)]">
                <p className="animate-pulse text-lg font-medium text-[var(--text-muted)]">
                    Загрузка...
                </p>
            </div>
        );
    }

    if (!car) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg)] text-[var(--text)]">
                <p className="text-lg text-[var(--text-muted)]">
                    Автомобиль не найден
                </p>

                <Link
                    href="/garage"
                    className="font-semibold text-[var(--link)] underline underline-offset-4"
                >
                    Вернуться в гараж
                </Link>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full bg-[var(--bg)] text-[var(--text)] transition-colors duration-200">
            <CarHeader />

            <main className="relative z-10 mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
                <div className="mb-4 sm:mb-6">
                    <CarTitle car={car} />
                </div>

                <CarSectionNav
                    section={section}
                    onChange={setSection}
                    contentId={CONTENT_ID}
                />

                <div
                    id={CONTENT_ID}
                    role="tabpanel"
                    aria-labelledby={`${CONTENT_ID}-tab-${section}`}
                    className="mt-4 min-w-0 sm:mt-6"
                >
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
            </main>
        </div>
    );
}