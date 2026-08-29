import { Car } from '@/types';

type Props = {
    car: Car;
};

export default function CarExtraInfo({ car }: Props) {
    return (
        <section className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6">
            <h2 className="text-lg font-semibold mb-5 text-[#F5F5F5]">Дополнительно</h2>
            <div className="space-y-3 text-sm">
                {car.currentMileage !== undefined && (
                    <div className="flex justify-between gap-4">
                        <span className="text-[#39FF14]">Пробег</span>
                        <span className="text-right text-[#39FF14]">
                            {car.currentMileage.toLocaleString('ru-RU')} км
                        </span>
                    </div>
                )}
                {car.color && (
                    <div className="flex justify-between gap-4">
                        <span className="text-[#39FF14]">Цвет</span>
                        <span className="text-right text-[#39FF14]">{car.color}</span>
                    </div>
                )}
                {car.nickname && (
                    <div className="flex justify-between gap-4">
                        <span className="text-[#39FF14]">Прозвище</span>
                        <span className="text-right text-[#39FF14]">{car.nickname}</span>
                    </div>
                )}
                <div className="flex justify-between gap-4">
                    <span className="text-[#39FF14]">Добавлен</span>
                    <span className="text-right text-[#39FF14]">
                        {new Date(car.addedAt).toLocaleDateString('ru-RU')}
                    </span>
                </div>
                {car.updatedAt && (
                    <div className="flex justify-between gap-4">
                        <span className="text-[#39FF14]">Обновлён</span>
                        <span className="text-right text-[#39FF14]">
                            {new Date(car.updatedAt).toLocaleDateString('ru-RU')}
                        </span>
                    </div>
                )}
            </div>

            {car.notes && (
                <div className="mt-6 pt-5 border-t border-[#2A2A2A]">
                    <p className="text-[#39FF14] text-sm mb-2">Заметки</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-[#F5F5F5]">
                        {car.notes}
                    </p>
                </div>
            )}
        </section>
    );
}