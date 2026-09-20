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
        <section className="bg-[var(--card)] border border-[var(--border)]/20 rounded-3xl p-6 transition-colors duration-200">
            {/* Заголовок блока делаем основным цветом текста */}
            <h2 className="text-lg font-bold mb-5 text-[var(--text)]">Характеристики</h2>

            <div className="space-y-3.5 text-sm">
                {rows.map((row) => (
                    <div key={row.label} className="flex justify-between gap-4 items-baseline border-b border-[var(--border)]/10 pb-2.5 last:border-0 last:pb-0">
                        {/* Левая колонка — мягкий графитовый оттенок для подписей */}
                        <span className="text-[var(--text-accent)] font-medium">{row.label}</span>

                        {/* Правая колонка — ИСПРАВЛЕНО: глубокий графитовый/белый акцент для самих значений */}
                        <span className="text-right text-[var(--link)] font-semibold truncate max-w-[65%]">
                            {row.value}
                        </span>
                    </div>
                ))}

                {rows.length === 0 && (
                    <p className="text-[var(--text-dim)] text-center py-4">Нет данных</p>
                )}
            </div>
        </section>
    );
}
