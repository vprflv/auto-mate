import Link from 'next/link';
import { Car } from '@/types';

type Props = {
    car: Car;
    onRemove: (id: string) => void;
};

export default function CarCard({ car, onRemove }: Props) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-600 transition">
            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-2xl font-semibold leading-tight">
                        {car.nickname || `${car.make} ${car.model}`}
                    </h2>
                    <p className="text-zinc-400 mt-1">
                        {car.make} {car.model} • {car.year}
                        {car.color ? ` • ${car.color}` : ''}
                    </p>
                </div>
                <button
                    onClick={() => onRemove(car.id)}
                    className="text-zinc-500 hover:text-red-400 text-sm transition"
                    title="Удалить"
                >
                    Удалить
                </button>
            </div>

            <p className="font-mono text-xs text-zinc-500 mb-5 tracking-wide">
                {car.vin}
            </p>

            <div className="space-y-2 text-sm">
                {car.bodyClass && (
                    <div className="flex justify-between gap-3">
                        <span className="text-zinc-500">Кузов</span>
                        <span className="text-right">{car.bodyClass}</span>
                    </div>
                )}
                {car.displacementL && (
                    <div className="flex justify-between gap-3">
                        <span className="text-zinc-500">Двигатель</span>
                        <span className="text-right">
              {car.displacementL} л
                            {car.cylinders ? ` • ${car.cylinders} цил.` : ''}
            </span>
                    </div>
                )}
                {car.fuel && (
                    <div className="flex justify-between gap-3">
                        <span className="text-zinc-500">Топливо</span>
                        <span className="text-right">{car.fuel}</span>
                    </div>
                )}
                {car.driveType && (
                    <div className="flex justify-between gap-3">
                        <span className="text-zinc-500">Привод</span>
                        <span className="text-right">{car.driveType}</span>
                    </div>
                )}
                {car.transmission && (
                    <div className="flex justify-between gap-3">
                        <span className="text-zinc-500">КПП</span>
                        <span className="text-right">{car.transmission}</span>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-5 border-t border-zinc-800 flex gap-3">
                <Link
                    href={`/garage/${car.id}`}
                    className="flex-1 text-center bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl text-sm font-medium transition"
                >
                    Открыть
                </Link>
                <Link
                    href={`/garage/${car.id}/edit`}
                    className="flex-1 text-center bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl text-sm font-medium transition"
                >
                    Редактировать
                </Link>
                <Link
                    href={`/garage/${car.id}/service/add`}
                    className="flex-1 text-center bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-sm font-medium transition"
                >
                    + ТО
                </Link>
            </div>
        </div>
    );
}