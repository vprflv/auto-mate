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
        <div className="space-y-3">
            {items.length === 0 ? (
                <p className="text-center text-[#666666] text-sm py-6">
                    Пока нет записей
                </p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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