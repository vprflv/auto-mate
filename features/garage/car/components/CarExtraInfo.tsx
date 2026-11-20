'use client';

import { useState, type FormEvent } from 'react';
import { Pencil } from 'lucide-react';

import type { Car } from '@/types';
import { getGarageCars } from '@/features/garage/add/lib/storage';
import { confirmLowerMileage } from '@/features/garage/lib/confirmLowerMileage';

type Props = {
    car: Car;
    onUpdateCar: (car: Car) => void;
};

export default function CarExtraInfo({ car, onUpdateCar }: Props) {
    const [draft, setDraft] = useState<string | null>(null);
    const [error, setError] = useState('');

    const closeMileageEdit = () => {
        setDraft(null);
        setError('');
    };

    const saveMileage = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (draft === null) return;

        const value = draft.trim();
        const mileage = value ? Number(value) : undefined;
        if (mileage !== undefined && (!/^\d+$/.test(value) || !Number.isSafeInteger(mileage))) {
            setError('Пробег должен быть целым числом от нуля.');
            return;
        }

        try {
            const savedCar = getGarageCars().find(item => item.id === car.id);
            if (!savedCar) {
                setError('Автомобиль больше не найден в гараже.');
                return;
            }

            if (!confirmLowerMileage(mileage, savedCar.currentMileage)) return;

            if (mileage !== savedCar.currentMileage) {
                onUpdateCar({ ...savedCar, currentMileage: mileage, updatedAt: new Date().toISOString() });
            }
            closeMileageEdit();
        } catch {
            setError('Не удалось сохранить пробег. Попробуйте ещё раз.');
        }
    };

    return (
        /*
          Фон карточки совпадает с CarSpecs — var(--card) (песочный в светлой теме),
          с утонченной полупрозрачной рамкой border-[var(--border)]/20
        */
        <section className="bg-[var(--card)] border border-[var(--border)]/20 rounded-3xl p-6 transition-colors duration-200">
            <h2 className="text-lg font-bold mb-5 text-[var(--text)]">Дополнительно</h2>

            <div className="space-y-3.5 text-sm">
                <div className="border-b border-[var(--border)]/10 pb-2.5">
                    {draft === null ? (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-medium text-[var(--text-accent)]">Пробег</span>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-[var(--link)]">
                                    {car.currentMileage == null
                                        ? 'Не указан'
                                        : `${car.currentMileage.toLocaleString('ru-RU')} км`}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setDraft(String(car.currentMileage ?? ''))}
                                    className="rounded-lg p-2 text-[var(--link)] hover:bg-[var(--bg-elevated)]"
                                    title="Изменить пробег"
                                    aria-label="Изменить пробег автомобиля"
                                >
                                    <Pencil size={16} aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={saveMileage} className="space-y-2">
                            <label className="block space-y-1.5">
                                <span className="font-medium text-[var(--text-accent)]">Пробег, км</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    autoFocus
                                    value={draft}
                                    onChange={event => {
                                        setDraft(event.target.value);
                                        setError('');
                                    }}
                                    aria-invalid={!!error}
                                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)] focus:border-[var(--link)] focus:outline-none"
                                />
                            </label>
                            {error && <p role="alert" className="text-[var(--danger)]">{error}</p>}
                            <div className="flex flex-wrap justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeMileageEdit}
                                    className="rounded-lg border border-[var(--border)] px-3 py-2 text-[var(--text)]"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-[var(--btn-primary)] px-3 py-2 font-medium text-[var(--btn-primary-text)]"
                                >
                                    Сохранить
                                </button>
                            </div>
                        </form>
                    )}
                </div>
                {car.color && (
                    <div className="flex justify-between gap-4 items-baseline border-b border-[var(--border)]/10 pb-2.5 last:border-0 last:pb-0">
                        <span className="text-[var(--text-accent)] font-medium">Цвет</span>
                        <span className="text-right text-[var(--link)] font-semibold truncate max-w-[65%]">{car.color}</span>
                    </div>
                )}
                {car.nickname && (
                    <div className="flex justify-between gap-4 items-baseline border-b border-[var(--border)]/10 pb-2.5 last:border-0 last:pb-0">
                        <span className="text-[var(--text-accent)] font-medium">Прозвище</span>
                        <span className="text-right text-[var(--link)] font-semibold truncate max-w-[65%]">{car.nickname}</span>
                    </div>
                )}
                <div className="flex justify-between gap-4 items-baseline border-b border-[var(--border)]/10 pb-2.5 last:border-0 last:pb-0">
                    <span className="text-[var(--text-accent)] font-medium">Добавлен</span>
                    <span className="text-right text-[var(--link)] font-semibold">
                        {new Date(car.addedAt).toLocaleDateString('ru-RU')}
                    </span>
                </div>
                {car.updatedAt && (
                    <div className="flex justify-between gap-4 items-baseline border-b border-[var(--border)]/10 pb-2.5 last:border-0 last:pb-0">
                        <span className="text-[var(--text-accent)] font-medium">Обновлён</span>
                        <span className="text-right text-[var(--link)] font-semibold">
                            {new Date(car.updatedAt).toLocaleDateString('ru-RU')}
                        </span>
                    </div>
                )}
            </div>

            {/* Блок пользовательских заметок */}
            {car.notes && (
                <div className="mt-6 pt-5 border-t border-[var(--border)]/20">
                    <p className="text-[var(--text-accent)] font-semibold text-sm mb-2">Заметки</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--link)] font-medium">
                        {car.notes}
                    </p>
                </div>
            )}
        </section>
    );
}
