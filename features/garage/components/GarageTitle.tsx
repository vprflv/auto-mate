import Link from 'next/link';

type Props = {
    carsLabel: string;
};

export default function GarageTitle({ carsLabel }: Props) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
                <h1 className="text-4xl font-bold">Мой Гараж</h1>
                <p className="text-zinc-400 mt-1">{carsLabel}</p>
            </div>

            <Link
                href="/garage/add"
                className="inline-flex items-center justify-center bg-white text-black px-6 py-3 rounded-2xl font-medium hover:bg-zinc-200 transition"
            >
                + Добавить автомобиль
            </Link>
        </div>
    );
}