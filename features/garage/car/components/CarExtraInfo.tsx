import { Car } from '@/types';

type Props = {
    car: Car;
};

export default function CarExtraInfo({ car }: Props) {
    return (
        /*
          Фон карточки совпадает с CarSpecs — var(--card) (песочный в светлой теме),
          с утонченной полупрозрачной рамкой border-[var(--border)]/20
        */
        <section className="bg-[var(--card)] border border-[var(--border)]/20 rounded-3xl p-6 transition-colors duration-200">
            <h2 className="text-lg font-bold mb-5 text-[var(--text)]">Дополнительно</h2>

            <div className="space-y-3.5 text-sm">
                {car.currentMileage !== undefined && (
                    <div className="flex justify-between gap-4 items-baseline border-b border-[var(--border)]/10 pb-2.5 last:border-0 last:pb-0">
                        <span className="text-[var(--text-accent)] font-medium">Пробег</span>
                        <span className="text-right text-[var(--link)] font-semibold">
                            {car.currentMileage.toLocaleString('ru-RU')} км
                        </span>
                    </div>
                )}
                {car.color && (
                    <div className="flex justify-between gap-4 items-baseline border-b border-[var(--border)]/10 pb-2.5 last:border-0 last:pb-0">
                        <span className="text-[var(--text-accent)] font-medium">Цвет</span>
                        <span className="text-right text-[var(--link)] font-semibold truncate max-w-[65%]">{car.color}</span>
                    </div>
                )}
                {car.nickname && (
                    <div className="flex justify-between gap-4 items-baseline border-b border-[var(--border)]/10 pb-2.5 last:border-0 last:pb-0">
                        <span className="text-[var(--text-accent)] font-medium">Прозвище</span>
                        <span className="text-right text-[var(--link)] font-semibold truncate max-w-[65%]">{car.nickname}</span>
                    </div>
                )}
                <div className="flex justify-between gap-4 items-baseline border-b border-[var(--border)]/10 pb-2.5 last:border-0 last:pb-0">
                    <span className="text-[var(--text-accent)] font-medium">Добавлен</span>
                    <span className="text-right text-[var(--link)] font-semibold">
                        {new Date(car.addedAt).toLocaleDateString('ru-RU')}
                    </span>
                </div>
                {car.updatedAt && (
                    <div className="flex justify-between gap-4 items-baseline border-b border-[var(--border)]/10 pb-2.5 last:border-0 last:pb-0">
                        <span className="text-[var(--text-accent)] font-medium">Обновлён</span>
                        <span className="text-right text-[var(--link)] font-semibold">
                            {new Date(car.updatedAt).toLocaleDateString('ru-RU')}
                        </span>
                    </div>
                )}
            </div>

            {/* Блок пользовательских заметок */}
            {car.notes && (
                <div className="mt-6 pt-5 border-t border-[var(--border)]/20">
                    <p className="text-[var(--text-accent)] font-semibold text-sm mb-2">Заметки</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--link)] font-medium">
                        {car.notes}
                    </p>
                </div>
            )}
        </section>
    );
}
