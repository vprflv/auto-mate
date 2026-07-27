'use client';



import {useGarage} from "@/features/garage/hooks/useGarage";
import GarageHeader from "@/features/garage/components/GarageHeader";
import GarageTitle from "@/features/garage/components/GarageTitle";
import GarageEmpty from "@/features/garage/components/GarageEmpty";
import CarCard from "@/features/garage/components/CarCard";
import GarageServiceStub from "@/features/garage/components/GarageServiceStub";

export default function GaragePage() {
    const { cars, loading, removeCar, carsLabel } = useGarage();

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                <p className="text-zinc-400">Загрузка...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
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
                        <GarageServiceStub />
                    </>
                )}
            </main>
        </div>
    );
}