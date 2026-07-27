'use client';

import Link from 'next/link';

import ServiceFormHeader from './ServiceFormHeader';
import ServiceMainFields from './ServiceMainFields';
import ServicePartsSection from './ServicePartsSection';
import {useAddService} from "@/features/garage/add/hooks/useAddService";

type Props = {
    carId: string;
};

export default function AddServiceForm({ carId }: Props) {
    const {
        car,
        loading,
        saving,
        title,
        setTitle,
        date,
        setDate,
        mileage,
        setMileage,
        description,
        setDescription,
        cost,
        setCost,
        parts,
        addPart,
        updatePart,
        removePart,
        submit,
    } = useAddService(carId);

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
            <ServiceFormHeader carId={carId} />

            <main className="max-w-2xl mx-auto px-6 py-10">
                <h1 className="text-3xl font-bold mb-2">Добавить ТО</h1>
                <p className="text-zinc-400 mb-8">
                    {car.make} {car.model} • {car.year}
                </p>

                <form onSubmit={submit} className="space-y-6">
                    <ServiceMainFields
                        title={title}
                        date={date}
                        mileage={mileage}
                        description={description}
                        cost={cost}
                        onTitleChange={setTitle}
                        onDateChange={setDate}
                        onMileageChange={setMileage}
                        onDescriptionChange={setDescription}
                        onCostChange={setCost}
                    />

                    <ServicePartsSection
                        parts={parts}
                        onAdd={addPart}
                        onChange={updatePart}
                        onRemove={removePart}
                    />

                    <div className="flex gap-4 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-white text-black font-medium py-4 rounded-2xl hover:bg-zinc-200 transition disabled:opacity-50"
                        >
                            {saving ? 'Сохраняем...' : 'Сохранить запись'}
                        </button>
                        <Link
                            href={`/garage/${carId}`}
                            className="flex-1 text-center bg-zinc-800 hover:bg-zinc-700 py-4 rounded-2xl font-medium transition"
                        >
                            Отмена
                        </Link>
                    </div>
                </form>
            </main>
        </div>
    );
}