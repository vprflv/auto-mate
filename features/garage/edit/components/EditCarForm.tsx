'use client';

import Link from 'next/link';
import { useEditCar } from '../hooks/useEditCar';
import EditCarBasics from './EditCarBasics';
import EditCarExtra from './EditCarExtra';
import EditCarSpecs from './EditCarSpecs';

export default function EditCarForm() {
    const { car, loading, saving, form, handleChange, handleSave } = useEditCar();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <p className="text-[#A3A3A3]">Загрузка...</p>
            </div>
        );
    }

    if (!car) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <p className="text-[#A3A3A3]">Автомобиль не найден</p>
                <Link href="/garage" className="text-[#39FF14] underline hover:text-[#57FF3A]">
                    Вернуться в гараж
                </Link>
            </div>
        );
    }

    return (
        <main className="max-w-3xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold mb-2 text-[#F5F5F5]">
                {car.make} {car.model}
            </h1>
            <p className="text-[#A3A3A3] mb-8">
                {car.year} • {car.vin}
            </p>

            <form onSubmit={handleSave} className="space-y-8">
                <EditCarBasics form={form} onChange={handleChange} />
                <EditCarExtra form={form} onChange={handleChange} />
                <EditCarSpecs form={form} onChange={handleChange} />

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-[#39FF14] hover:bg-[#57FF3A] text-black font-medium py-4 rounded-2xl transition disabled:opacity-50"
                    >
                        {saving ? 'Сохраняем...' : 'Сохранить изменения'}
                    </button>
                    <Link
                        href="/garage"
                        className="flex-1 text-center bg-[#1F1F1F] hover:bg-[#2A2A2A] py-4 rounded-2xl font-medium text-[#F5F5F5] transition"
                    >
                        Отмена
                    </Link>
                </div>
            </form>
        </main>
    );
}