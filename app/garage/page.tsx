'use client';

import {useGarage} from "@/features/garage/hooks/useGarage";
import GarageHeader from "@/features/garage/components/GarageHeader";
import GarageTitle from "@/features/garage/components/GarageTitle";
import GarageEmpty from "@/features/garage/components/GarageEmpty";
import CarCard from "@/features/garage/components/CarCard";


export default function GaragePage() {
    const { cars, loading, removeCar, carsLabel } = useGarage();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex items-center justify-center">
                <p className="text-[#A3A3A3]">Загрузка...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5]">
            <GarageHeader />

            <main className="max-w-5xl mx-auto px-6 py-10">
                <GarageTitle carsLabel={carsLabel} />

                {cars.length === 0 ? (
                    <GarageEmpty />
                ) : (
                    <>
                        <div className="grid gap-6 md:grid-cols-2">
                            {cars.map((car) => (
                                <CarCard key={car.id} car={car} onRemove={removeCar} />
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}