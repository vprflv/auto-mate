import { CarParts, CarPartItem, PartCategory } from '@/types';
import {PART_CATEGORY_LABELS, PART_CATEGORY_ORDER} from "@/features/garage/lib/config/partCategories";
import Link from "next/link";


type Props = {
    parts?: CarParts;
    onEdit?: () => void;
    carId?: string;
};

function formatPart(item: CarPartItem) {
    const main = [
        item.brand,
        item.oemNumber,
        item.analogNumber ? `аналог ${item.analogNumber}` : null,
    ].filter(Boolean);

    return main.join(' • ');
}

export default function CarPartsCard({ parts, onEdit, carId }: Props) {
    const items = parts?.items || [];
    const hasData = items.length > 0;

    const grouped = PART_CATEGORY_ORDER
        .map((category) => ({
            category,
            items: items.filter((item) => item.category === category),
        }))
        .filter((group) => group.items.length > 0);

    return (
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">Запчасти и расходники</h2>
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="text-sm text-blue-400 hover:text-blue-300 transition"
                    >
                        Изменить
                    </button>
                )}
            </div>

            {!hasData ? (
                <div className="text-center py-6">
                    <p className="text-zinc-500 text-sm mb-1">Пока не указано</p>
                    <p className="text-zinc-600 text-xs">
                        Добавь фильтры, колодки, свечи и другие расходники по категориям
                    </p>
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="mt-4 text-sm text-white underline"
                        >
                            Заполнить
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {grouped.map((group) => (
                        <div key={group.category}>
                            <h3 className="text-sm font-medium text-zinc-300 mb-3">
                                {PART_CATEGORY_LABELS[group.category as PartCategory]}
                            </h3>

                            <div className="space-y-3">
                                {group.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between gap-4 text-sm"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-white">
                                                {item.quantity && item.quantity > 1
                                                    ? `${item.quantity}× `
                                                    : ''}
                                                {item.name}
                                            </p>
                                            {(item.brand || item.oemNumber || item.analogNumber) && (
                                                <p className="text-zinc-500 text-xs mt-0.5">
                                                    {formatPart(item)}
                                                </p>
                                            )}
                                            {item.notes && (
                                                <p className="text-zinc-600 text-xs mt-0.5">
                                                    {item.notes}
                                                </p>
                                            )}
                                            {carId && (
                                                <Link
                                                    href={`/garage/${carId}/parts/edit`}
                                                    className="text-sm text-blue-400 hover:text-blue-300 transition"
                                                >
                                                    Изменить
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <p className="text-xs text-zinc-600 mt-5 leading-relaxed">
                Справочная информация по вашей машине. Перед покупкой сверяйте
                применимость по VIN и каталогам.
            </p>
        </section>
    );
}