'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCar } from '@/features/garage/car/hooks/useCar';
import CarHeader from '@/features/garage/car/components/CarHeader';
import CarTitle from '@/features/garage/car/components/CarTitle';
import CarSectionNav from '@/features/garage/car/components/CarSectionNav';
import CarSectionContent from '@/features/garage/car/components/CarSectionContent';
import {CarSection} from "@/features/garage/car/types/types";


export default function CarPage() {
    const params = useParams();
    const id = params.id as string;

    const { car, records, loading, deleteCar, updateCar, deleteRecord, updateRecord } = useCar(id);
    const [section, setSection] = useState<CarSection>('overview');

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex items-center justify-center">
                <p className="text-[#A3A3A3]">Загрузка...</p>
            </div>
        );
    }

    if (!car) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col items-center justify-center gap-4">
                <p className="text-[#A3A3A3]">Автомобиль не найден</p>
                <Link href="/garage" className="text-[#39FF14] underline hover:text-[#57FF3A] transition">
                    Вернуться в гараж
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5]">
            <CarHeader />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <CarTitle car={car} />

                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    <CarSectionNav section={section} onChange={setSection} />

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