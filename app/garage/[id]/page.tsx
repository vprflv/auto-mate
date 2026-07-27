'use client';

import {useParams, useRouter} from 'next/navigation';
import Link from 'next/link';
import {useCar} from "@/features/garage/car/hooks/useCar";
import CarHeader from "@/features/garage/car/components/CarHeader";
import CarTitle from "@/features/garage/car/components/CarTitle";
import CarSpecs from "@/features/garage/car/components/CarSpecs";
import CarExtraInfo from "@/features/garage/car/components/CarExtraInfo";
import ServiceHistory from "@/features/garage/car/components/ServiceHistory";
import DangerZone from "@/features/garage/car/components/DangerZone";
import CarFluidsCard from "@/features/garage/components/CarFluidsCard";
import CarPartsCard from "@/features/garage/components/CarPartsCard";




export default function CarPage() {
    const params = useParams();
    const id = params.id as string;

    const router = useRouter();

    const { car, records, loading, deleteCar } = useCar(id);

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

            <main className="max-w-4xl mx-auto px-6 py-10">
                <CarTitle car={car} />

                <div className="grid gap-6 md:grid-cols-2 mb-10">
                    <CarSpecs car={car} />
                    <CarExtraInfo car={car} />
                </div>

                <div className="mb-10">
                    <CarFluidsCard
                        fluids={car.fluids}
                        onEdit={() => {
                            // пока можно вести на edit или отдельную страницу
                            // router.push(`/garage/${car.id}/fluids`)
                        }}
                    />
                    <CarPartsCard parts={car.partsCatalog}
                                  carId={car.id}
                                  onEdit={() => router.push(`/garage/${car.id}/parts/edit`)}

                    />
                </div>

                <ServiceHistory carId={car.id} records={records} />
                <DangerZone onDelete={deleteCar} />
            </main>
        </div>
    );
}