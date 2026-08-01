import Link from 'next/link';
import { CarPartItem } from '@/types';
import PartListItem from './PartListItem';

type Props = {
    items: CarPartItem[];
    subcategory: string | null;
    carId?: string;
};

export default function PartsItemList({ items, subcategory, carId }: Props) {
    const list = subcategory
        ? items.filter((i) => (i.subcategory || 'other') === subcategory)
        : items;

    return (
        <div className="space-y-3">
            {list.length === 0 ? (
                <p className="text-center text-zinc-500 text-sm py-6">
                    Пока нет записей
                </p>
            ) : (
                list.map((item) => <PartListItem key={item.id} item={item} />)
            )}

            {carId && (
                <Link
                    href={`/garage/${carId}/parts/edit`}
                    className="inline-block mt-2 text-sm text-blue-400 hover:text-blue-300 transition"
                >
                    Редактировать каталог
                </Link>
            )}
        </div>
    );
}