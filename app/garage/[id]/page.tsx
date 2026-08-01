'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCar } from '@/features/garage/car/hooks/useCar';
import CarHeader from '@/features/garage/car/components/CarHeader';
import CarTitle from '@/features/garage/car/components/CarTitle';
import CarSpecs from '@/features/garage/car/components/CarSpecs';
import CarExtraInfo from '@/features/garage/car/components/CarExtraInfo';
import ServiceHistory from '@/features/garage/car/components/ServiceHistory';
import DangerZone from '@/features/garage/car/components/DangerZone';
import CarFluidsCard from '@/features/garage/components/CarFluidsCard';
import CarPartsCard from '@/features/garage/components/CarPartsCard';

type Section =
    | 'overview'
    | 'fluids'
    | 'parts'
    | 'service'
    | 'danger';

const MENU: { id: Section; label: string }[] = [
    { id: 'overview', label: 'Обзор' },
    { id: 'fluids', label: 'Масла и жидкости' },
    { id: 'parts', label: 'Запчасти' },
    { id: 'service', label: 'История ТО' },
    { id: 'danger', label: 'Опасная зона' },
];

export default function CarPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();



    const { car, records, loading, deleteCar, updateCar} = useCar(id);
    const [section, setSection] = useState<Section>('overview');

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                <p className="text-zinc-400">Загрузка...</p>
            </div>
        );
    }

    if (!car) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4">
                <p className="text-zinc-400">Автомобиль не найден</p>
                <Link href="/garage" className="text-white underline">
                    Вернуться в гараж
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <CarHeader />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Заголовок всегда сверху */}
                <CarTitle car={car} />

                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* ===== Левое меню ===== */}
                    <aside className="md:w-56 shrink-0">
                        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                            {MENU.map((item) => {
                                const active = section === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setSection(item.id)}
                                        className={`
                      whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium transition text-left
                      ${
                                            active
                                                ? 'bg-zinc-800 text-white'
                                                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                                        }
                      ${item.id === 'danger' ? 'md:mt-4 text-red-400/80 hover:text-red-400' : ''}
                      ${active && item.id === 'danger' ? 'bg-red-950/40 text-red-400' : ''}
                    `}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* ===== Правый контент ===== */}
                    <div className="flex-1 min-w-0">
                        {section === 'overview' && (
                            <div className="grid gap-6 md:grid-cols-2">
                                <CarSpecs car={car} />
                                <CarExtraInfo car={car} />
                            </div>
                        )}

                        {section === 'fluids' && (
                            <CarFluidsCard
                                fluids={car.fluids}
                                onEdit={() => {
                                    // позже: router.push(`/garage/${car.id}/fluids/edit`)
                                }}
                            />
                        )}

                        {section === 'parts' && (
                            <CarPartsCard
                                parts={car.partsCatalog}
                                carId={car.id}
                                onUpdateParts={(partsCatalog) => {
                                    updateCar({
                                        ...car,
                                        partsCatalog,
                                        updatedAt: new Date().toISOString(),
                                    });
                                }}
                            />
                        )}

                        {section === 'service' && (
                            <ServiceHistory carId={car.id} records={records} />
                        )}

                        {section === 'danger' && <DangerZone onDelete={deleteCar} />}
                    </div>
                </div>
            </main>
        </div>
    );
}