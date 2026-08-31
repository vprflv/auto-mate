import { DecodedCar } from '@/types';

type Props = {
    car: DecodedCar;
    onSave: () => void;
    onEdit: () => void;
};

export default function DecodedCarCard({ car, onSave, onEdit }: Props) {
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
        <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-1 text-[#F5F5F5]">
                {car.make} {car.model}
            </h2>
            <p className="text-[#A3A3A3] mb-6">{car.year} год</p>

            <div className="space-y-3 text-sm">
                {rows.map((row) => (
                    <div key={row.label} className="flex justify-between gap-4">
                        <span className="text-[#39FF14]">{row.label}</span>
                        <span className={`text-right text-[#F5F5F5] ${row.mono ? 'font-mono' : ''}`}>
                            {row.value}
                        </span>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={onSave}
                className="w-full mt-6 bg-[#39FF14] hover:bg-[#57FF3A] text-black font-medium py-4 rounded-2xl transition"
            >
                Сохранить в гараж
            </button>

            <button
                type="button"
                onClick={onEdit}
                className="w-full mt-3 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-[#F5F5F5] font-medium py-4 rounded-2xl transition"
            >
                Добавить / редактировать данные
            </button>
        </div>
    );
}