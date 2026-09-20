'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { Car } from '@/types';
import { CarIcon, Trash2 } from 'lucide-react';

type Props = {
    car: Car;
    onRemove: (id: string) => void;
};

export default function CarCard({ car, onRemove }: Props) {
    const title = car.nickname || `${car.make} ${car.model}`;

    const handleRemove = () => {
        toast.warning(`Удалить ${title}?`, {
            description: 'Машина пропадёт из гаража. Это нельзя отменить.',
            duration: Infinity,
            action: {
                label: 'Удалить',
                onClick: () => {
                    onRemove(car.id);
                    toast.success(`${title} удалена из гаража`);
                },
            },
            cancel: {
                label: 'Отмена',
                onClick: () => {},
            },
        });
    };

    return (
        /*
          bg-[var(--card)] теперь примет мягкий песочный оттенок в светлой теме.
          Сделали деликатную полупрозрачную рамку border-[var(--border)]/20, чтобы она смотрелась утонченно.
        */
        <div className="group relative bg-[var(--card)] border border-[var(--border)]/20 rounded-3xl p-6 transition-all duration-300 h-full flex flex-col outline-none hover:border-[var(--btn-primary)]/40 hover:shadow-[0_10px_30px_rgba(74,35,0,0.03)] [html[data-theme=dark]_&]:hover:shadow-[0_0_30px_rgba(57,255,20,0.03)] focus-within:ring-2 focus-within:ring-[var(--btn-primary)]/40">

            {/* Изображение / Заглушка */}
            <div className="aspect-[16/10] bg-[var(--bg-elevated)] rounded-2xl overflow-hidden mb-5 relative border border-[var(--border)]/20 transition-colors">
                {car.photos?.[0] ? (
                    <img
                        src={car.photos[0]}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[var(--bg-elevated)] to-[var(--bg)]">
                        <CarIcon className="w-12 h-12 text-[var(--text-dim)] transition-all duration-500 group-hover:text-[var(--btn-primary)]/40 group-hover:scale-110" />
                    </div>
                )}
            </div>

            {/* Заголовок и кнопка удаления */}
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                    <h2 className="text-2xl font-bold leading-tight text-[var(--text)] truncate transition-colors">
                        {title}
                    </h2>
                    <p className="text-[var(--text-muted)] text-sm mt-1 truncate">
                        {car.make} {car.model} • {car.year}
                        {car.color ? ` • ${car.color}` : ''}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleRemove}
                    className="p-2 -mr-2 text-[var(--text-dim)] rounded-xl transition-all duration-200 lg:opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 cursor-pointer"
                    title="Удалить"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* VIN-код в виде моноширинного тега */}
            <div className="mb-5">
                <span className="inline-block font-mono text-[10px] uppercase font-medium bg-[var(--bg-elevated)] text-[var(--text-muted)] px-2.5 py-1 rounded-md tracking-wider border border-[var(--border)]/20">
                    {car.vin || 'НЕТ VIN'}
                </span>
            </div>

            {/* Характеристики автомобиля */}
            <div className="space-y-2.5 text-sm mb-6 border-t border-[var(--border)]/20 pt-4">
                {car.bodyClass && (
                    <div className="flex justify-between gap-3 items-baseline">
                        <span className="text-[var(--text-dim)] font-medium">Кузов</span>
                        <span className="text-right text-[var(--text)] font-medium truncate max-w-[70%]">{car.bodyClass}</span>
                    </div>
                )}
                {car.displacementL && (
                    <div className="flex justify-between gap-3 items-baseline">
                        <span className="text-[var(--text-dim)] font-medium">Двигатель</span>
                        <span className="text-right text-[var(--text)] font-medium">
                            {car.displacementL} л
                            {car.cylinders ? ` • ${car.cylinders} цил.` : ''}
                        </span>
                    </div>
                )}
                {car.fuel && (
                    <div className="flex justify-between gap-3 items-baseline">
                        <span className="text-[var(--text-dim)] font-medium">Топливо</span>
                        <span className="text-right text-[var(--text)] font-medium">{car.fuel}</span>
                    </div>
                )}
                {car.driveType && (
                    <div className="flex justify-between gap-3 items-baseline">
                        <span className="text-[var(--text-dim)] font-medium">Привод</span>
                        <span className="text-right text-[var(--text)] font-medium">{car.driveType}</span>
                    </div>
                )}
                {car.transmission && (
                    <div className="flex justify-between gap-3 items-baseline">
                        <span className="text-[var(--text-dim)] font-medium">КПП</span>
                        <span className="text-right text-[var(--text)] font-medium">{car.transmission}</span>
                    </div>
                )}
            </div>

            {/* Кнопки действий */}
            <div className="mt-auto pt-5 border-t border-[var(--border)]/20 flex gap-3">
                <Link
                    href={`/garage/${car.id}`}
                    className="flex-1 text-center bg-[var(--bg-elevated)] text-[var(--text)] py-3 rounded-xl text-sm font-semibold border border-[var(--border)]/30 transition-all duration-200 cursor-pointer hover:bg-[var(--border)]/60 active:scale-[0.98]"
                >
                    Открыть
                </Link>
                <Link
                    href={`/garage/${car.id}/edit`}
                    className="flex-1 text-center bg-[var(--bg-elevated)] text-[var(--text)] py-3 rounded-xl text-sm font-semibold border border-[var(--border)]/30 transition-all duration-200 cursor-pointer hover:bg-[var(--border)]/60 active:scale-[0.98]"
                >
                    Изменить
                </Link>
                <Link
                    href={`/garage/${car.id}/service/add`}
                    className="flex-1 text-center bg-[var(--btn-primary)] text-[var(--btn-primary-text)] py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer hover:bg-[var(--btn-primary-hover)] active:scale-[0.98] [html[data-theme=dark]_&]:hover:shadow-[0_0_20px_rgba(57,255,20,0.2)]"
                >
                    + ТО
                </Link>
            </div>
        </div>
    );
}
