'use client';

import { CarPartItem } from '@/types';
import CarPartItemCard from './CarPartItemCard';
import CarPartsDashedButton from './CarPartsDashedButton';

type Props = {
    carId: string;
    items: CarPartItem[];
    onEdit: (item: CarPartItem) => void;
    onAdd: () => void;
};

export default function CarPartsItemsView({
                                              carId,
                                              items,
                                              onEdit,
                                              onAdd,
                                          }: Props) {
    return (
        <div className="space-y-3 bg-transparent">
            {items.length === 0 ? (
                /* Перевели цвет текста на var(--text-dim) под нашу палитру */
                <p className="text-center text-[var(--text-dim)] text-sm py-6 font-medium">
                    Пока нет записей
                </p>
            ) : (
                /* Сетка карточек товаров на чистом прозрачном слое */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10">
                    {items.map((item) => (
                        <CarPartItemCard
                            key={item.id}
                            carId={carId}
                            item={item}
                            onEdit={onEdit}
                        />
                    ))}
                </div>
            )}

            <CarPartsDashedButton
                label="Добавить в этот раздел"
                onClick={onAdd}
            />
        </div>
    );
}
