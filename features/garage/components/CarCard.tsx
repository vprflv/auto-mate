'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { Car } from '@/types';
import { CarIcon } from 'lucide-react';

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
        <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6 hover:border-[#39FF14]/40 transition h-full flex flex-col">
            <div className="aspect-[16/10] bg-[#0A0A0A] rounded-2xl overflow-hidden mb-5">
                {car.photos?.[0] ? (
                    <img
                        src={car.photos[0]}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <CarIcon className="w-12 h-12 text-[#3A3A3A]" />
                    </div>
                )}
            </div>

            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-2xl font-semibold leading-tight text-[#F5F5F5]">
                        {title}
                    </h2>
                    <p className="text-[#A3A3A3] mt-1">
                        {car.make} {car.model} • {car.year}
                        {car.color ? ` • ${car.color}` : ''}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleRemove}
                    className="text-[#666666] hover:text-red-400 text-sm transition"
                    title="Удалить"
                >
                    Удалить
                </button>
            </div>

            <p className="font-mono text-xs text-[#666666] mb-5 tracking-wide">
                {car.vin}
            </p>

            <div className="space-y-2 text-sm">
                {car.bodyClass && (
                    <div className="flex justify-between gap-3">
                        <span className="text-[#666666]">Кузов</span>
                        <span className="text-right text-[#F5F5F5]">{car.bodyClass}</span>
                    </div>
                )}
                {car.displacementL && (
                    <div className="flex justify-between gap-3">
                        <span className="text-[#666666]">Двигатель</span>
                        <span className="text-right text-[#F5F5F5]">
                            {car.displacementL} л
                            {car.cylinders ? ` • ${car.cylinders} цил.` : ''}
                        </span>
                    </div>
                )}
                {car.fuel && (
                    <div className="flex justify-between gap-3">
                        <span className="text-[#666666]">Топливо</span>
                        <span className="text-right text-[#F5F5F5]">{car.fuel}</span>
                    </div>
                )}
                {car.driveType && (
                    <div className="flex justify-between gap-3">
                        <span className="text-[#666666]">Привод</span>
                        <span className="text-right text-[#F5F5F5]">{car.driveType}</span>
                    </div>
                )}
                {car.transmission && (
                    <div className="flex justify-between gap-3">
                        <span className="text-[#666666]">КПП</span>
                        <span className="text-right text-[#F5F5F5]">{car.transmission}</span>
                    </div>
                )}
            </div>

            <div className="mt-auto pt-5 border-t border-[#2A2A2A] flex gap-3">
                <Link
                    href={`/garage/${car.id}`}
                    className="flex-1 text-center bg-[#1F1F1F] hover:bg-[#2A2A2A] py-3 rounded-xl text-sm font-medium text-[#F5F5F5] transition"
                >
                    Открыть
                </Link>
                <Link
                    href={`/garage/${car.id}/edit`}
                    className="flex-1 text-center bg-[#1F1F1F] hover:bg-[#2A2A2A] py-3 rounded-xl text-sm font-medium text-[#F5F5F5] transition"
                >
                    Редактировать
                </Link>
                <Link
                    href={`/garage/${car.id}/service/add`}
                    className="flex-1 text-center bg-[#39FF14] hover:bg-[#57FF3A] py-3 rounded-xl text-sm font-medium text-black transition"
                >
                    + ТО
                </Link>
            </div>
        </div>
    );
}