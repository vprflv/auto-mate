import Link from 'next/link';

type Props = {
    carsLabel: string;
};

export default function GarageTitle({ carsLabel }: Props) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
                <h1 className="text-4xl font-bold text-[#F5F5F5]">Мой Гараж</h1>
                <p className="text-[#A3A3A3] mt-1">{carsLabel}</p>
            </div>

            <Link
                href="/garage/add"
                className="inline-flex items-center justify-center bg-[#39FF14] text-black px-6 py-3 rounded-2xl font-medium hover:bg-[#57FF3A] transition shadow-[0_0_16px_rgba(57,255,20,0.25)]"
            >
                + Добавить автомобиль
            </Link>
        </div>
    );
}