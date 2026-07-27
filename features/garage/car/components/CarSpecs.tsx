import { Car } from '@/types';

type Props = {
    car: Car;
};

export default function CarSpecs({ car }: Props) {
    const rows = [
        { label: 'Кузов', value: car.bodyClass },
        { label: 'Объём двигателя', value: car.displacementL ? `${car.displacementL} л` : undefined },
        { label: 'Цилиндры', value: car.cylinders },
        { label: 'Двигатель', value: car.engine },
        { label: 'Топливо', value: car.fuel },
        { label: 'Привод', value: car.driveType },
        { label: 'КПП', value: car.transmission },
        { label: 'Двери', value: car.doors },
        { label: 'Страна сборки', value: car.plantCountry },
    ].filter((row) => row.value);

    return (
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-lg font-semibold mb-5">Характеристики</h2>
            <div className="space-y-3 text-sm">
                {rows.map((row) => (
                    <div key={row.label} className="flex justify-between gap-4">
                        <span className="text-zinc-500">{row.label}</span>
                        <span className="text-right">{row.value}</span>
                    </div>
                ))}
                {rows.length === 0 && (
                    <p className="text-zinc-500">Нет данных</p>
                )}
            </div>
        </section>
    );
}