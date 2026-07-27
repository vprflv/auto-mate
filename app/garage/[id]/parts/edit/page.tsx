'use client';

import { useParams, useRouter } from 'next/navigation';
import {useCar} from "@/features/garage/car/hooks/useCar";
import EditPartsForm from "@/features/garage/components/EditPartsForm";


export default function EditPartsPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { car, loading, updateCar } = useCar(id);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-zinc-400 flex items-center justify-center">
                Загрузка…
            </div>
        );
    }

    if (!car) {
        return (
            <div className="min-h-screen bg-zinc-950 text-zinc-400 flex items-center justify-center">
                Авто не найдено
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <EditPartsForm
                    initialParts={car.partsCatalog}
                    onSave={(parts) => {
                        updateCar({
                            ...car,
                            partsCatalog: parts,
                            updatedAt: new Date().toISOString(),
                        });
                        router.push(`/garage/${id}`);
                    }}
                    onCancel={() => router.back()}
                />
            </div>
        </div>
    );
}