import Link from 'next/link';
import { Car } from '@/types';

type Props = {
    car: Car;
};

export default function CarTitle({ car }: Props) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10">
            <div>
                <h1 className="text-4xl font-bold leading-tight">
                    {car.nickname || `${car.make} ${car.model}`}
                </h1>
                <p className="text-zinc-400 mt-2 text-lg">
                    {car.make} {car.model} • {car.year}
                    {car.color ? ` • ${car.color}` : ''}
                </p>
                <p className="font-mono text-sm text-zinc-500 mt-2 tracking-wide">
                    {car.vin}
                </p>
            </div>

            <div className="flex flex-wrap gap-3">
                <Link
                    href={`/garage/${car.id}/edit`}
                    className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-xl text-sm font-medium transition"
                >
                    Редактировать
                </Link>

                <Link
                    href={`/garage/${car.id}/catalog`}
                    className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-xl text-sm font-medium transition"
                >
                    Каталог
                </Link>
                <Link
                    href={`/garage/${car.id}/service/add`}
                    className="bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-xl text-sm font-medium transition"
                >
                    + Добавить ТО
                </Link>
            </div>
        </div>
    );
}