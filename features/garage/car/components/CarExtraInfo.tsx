import { Car } from '@/types';

type Props = {
    car: Car;
};

export default function CarExtraInfo({ car }: Props) {
    return (
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-lg font-semibold mb-5">Дополнительно</h2>
            <div className="space-y-3 text-sm">
                {car.currentMileage !== undefined && (
                    <div className="flex justify-between gap-4">
                        <span className="text-zinc-500">Пробег</span>
                        <span className="text-right">
 {car.currentMileage.toLocaleString('ru-RU')} км
 </span>
                    </div>
                )}
                {car.color && (
                    <div className="flex justify-between gap-4">
                        <span className="text-zinc-500">Цвет</span>
                        <span className="text-right">{car.color}</span>
                    </div>
                )}
                {car.nickname && (
                    <div className="flex justify-between gap-4">
                        <span className="text-zinc-500">Прозвище</span>
                        <span className="text-right">{car.nickname}</span>
                    </div>
                )}
                <div className="flex justify-between gap-4">
                    <span className="text-zinc-500">Добавлен</span>
                    <span className="text-right">
 {new Date(car.addedAt).toLocaleDateString('ru-RU')}
 </span>
                </div>
                {car.updatedAt && (
                    <div className="flex justify-between gap-4">
                        <span className="text-zinc-500">Обновлён</span>
                        <span className="text-right">
 {new Date(car.updatedAt).toLocaleDateString('ru-RU')}
 </span>
                    </div>
                )}
            </div>

            {car.notes && (
                <div className="mt-6 pt-5 border-t border-zinc-800">
                    <p className="text-zinc-500 text-sm mb-2">Заметки</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {car.notes}
                    </p>
                </div>
            )}
        </section>
    );
}