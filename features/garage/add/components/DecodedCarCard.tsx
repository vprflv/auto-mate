import { DecodedCar } from '@/types';

type Props = {
    car: DecodedCar;
    onSave: () => void;
};

export default function DecodedCarCard({ car, onSave }: Props) {
    const rows = [
        { label: 'VIN', value: car.vin, mono: true },
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
        <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-1">
                {car.make} {car.model}
            </h2>
            <p className="text-zinc-400 mb-6">{car.year} год</p>

            <div className="space-y-3 text-sm">
                {rows.map((row) => (
                    <div key={row.label} className="flex justify-between gap-4">
                        <span className="text-zinc-400">{row.label}</span>
                        <span className={`text-right ${row.mono ? 'font-mono' : ''}`}>
              {row.value}
            </span>
                    </div>
                ))}
            </div>

            <button
                onClick={onSave}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-medium py-4 rounded-2xl transition"
            >
                Сохранить в гараж
            </button>
        </div>
    );
}