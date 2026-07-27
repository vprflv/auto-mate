'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car } from '@/types';

export default function EditCarPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Форма
    const [form, setForm] = useState({
        make: '',
        model: '',
        year: '',
        vin: '',
        bodyClass: '',
        displacementL: '',
        cylinders: '',
        engine: '',
        fuel: '',
        driveType: '',
        transmission: '',
        doors: '',
        plantCountry: '',
        color: '',
        nickname: '',
        currentMileage: '',
        notes: '',
    });

    useEffect(() => {
        const data = localStorage.getItem('automate-garage');
        if (!data) {
            setLoading(false);
            return;
        }

        const cars: Car[] = JSON.parse(data);
        const found = cars.find((c) => c.id === id);

        if (found) {
            setCar(found);
            setForm({
                make: found.make || '',
                model: found.model || '',
                year: String(found.year || ''),
                vin: found.vin || '',
                bodyClass: found.bodyClass || '',
                displacementL: found.displacementL || '',
                cylinders: found.cylinders || '',
                engine: found.engine || '',
                fuel: found.fuel || '',
                driveType: found.driveType || '',
                transmission: found.transmission || '',
                doors: found.doors || '',
                plantCountry: found.plantCountry || '',
                color: found.color || '',
                nickname: found.nickname || '',
                currentMileage: found.currentMileage ? String(found.currentMileage) : '',
                notes: found.notes || '',
            });
        }

        setLoading(false);
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!car) return;

        setSaving(true);

        const data = localStorage.getItem('automate-garage');
        const cars: Car[] = data ? JSON.parse(data) : [];

        const updatedCars = cars.map((c) => {
            if (c.id !== id) return c;

            return {
                ...c,
                make: form.make.trim() || c.make,
                model: form.model.trim() || c.model,
                year: parseInt(form.year) || c.year,
                vin: form.vin.trim().toUpperCase() || c.vin,
                bodyClass: form.bodyClass.trim() || undefined,
                displacementL: form.displacementL.trim() || undefined,
                cylinders: form.cylinders.trim() || undefined,
                engine: form.engine.trim() || undefined,
                fuel: form.fuel.trim() || undefined,
                driveType: form.driveType.trim() || undefined,
                transmission: form.transmission.trim() || undefined,
                doors: form.doors.trim() || undefined,
                plantCountry: form.plantCountry.trim() || undefined,
                color: form.color.trim() || undefined,
                nickname: form.nickname.trim() || undefined,
                currentMileage: form.currentMileage
                    ? parseInt(form.currentMileage)
                    : undefined,
                notes: form.notes.trim() || undefined,
                updatedAt: new Date().toISOString(),
            };
        });

        localStorage.setItem('automate-garage', JSON.stringify(updatedCars));
        setSaving(false);
        router.push('/garage');
    };

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
            {/* Шапка */}
            <header className="border-b border-zinc-800">
                <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
                    <Link href="/garage" className="text-zinc-400 hover:text-white transition text-sm">
                        ← Назад в гараж
                    </Link>
                    <span className="font-semibold">Редактирование</span>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-10">
                <h1 className="text-3xl font-bold mb-2">
                    {car.make} {car.model}
                </h1>
                <p className="text-zinc-400 mb-8">{car.year} • {car.vin}</p>

                <form onSubmit={handleSave} className="space-y-8">
                    {/* Основное */}
                    <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-5">
                        <h2 className="text-lg font-semibold">Основное</h2>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Марка</label>
                                <input
                                    name="make"
                                    value={form.make}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Модель</label>
                                <input
                                    name="model"
                                    value={form.model}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Год</label>
                                <input
                                    name="year"
                                    type="number"
                                    value={form.year}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">VIN</label>
                                <input
                                    name="vin"
                                    value={form.vin}
                                    onChange={handleChange}
                                    maxLength={17}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-mono tracking-wide"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Ручные данные */}
                    <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-5">
                        <h2 className="text-lg font-semibold">Дополнительно (вручную)</h2>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Прозвище</label>
                                <input
                                    name="nickname"
                                    value={form.nickname}
                                    onChange={handleChange}
                                    placeholder="Например: Белая стрела"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Цвет</label>
                                <input
                                    name="color"
                                    value={form.color}
                                    onChange={handleChange}
                                    placeholder="Чёрный, белый..."
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Текущий пробег (км)</label>
                                <input
                                    name="currentMileage"
                                    type="number"
                                    value={form.currentMileage}
                                    onChange={handleChange}
                                    placeholder="125000"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Заметки</label>
                            <textarea
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Особенности, комплектация, что важно помнить..."
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 resize-none"
                            />
                        </div>
                    </section>

                    {/* Технические данные */}
                    <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-5">
                        <h2 className="text-lg font-semibold">Технические характеристики</h2>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Кузов</label>
                                <input
                                    name="bodyClass"
                                    value={form.bodyClass}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Объём двигателя (л)</label>
                                <input
                                    name="displacementL"
                                    value={form.displacementL}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Цилиндры</label>
                                <input
                                    name="cylinders"
                                    value={form.cylinders}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Двигатель</label>
                                <input
                                    name="engine"
                                    value={form.engine}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Топливо</label>
                                <input
                                    name="fuel"
                                    value={form.fuel}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Привод</label>
                                <input
                                    name="driveType"
                                    value={form.driveType}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">КПП</label>
                                <input
                                    name="transmission"
                                    value={form.transmission}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Двери</label>
                                <input
                                    name="doors"
                                    value={form.doors}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm text-zinc-400 mb-2">Страна сборки</label>
                                <input
                                    name="plantCountry"
                                    value={form.plantCountry}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Кнопки */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-white text-black font-medium py-4 rounded-2xl hover:bg-zinc-200 transition disabled:opacity-50"
                        >
                            {saving ? 'Сохраняем...' : 'Сохранить изменения'}
                        </button>
                        <Link
                            href="/garage"
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