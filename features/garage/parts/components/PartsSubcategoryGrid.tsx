import { CarPartItem, PartCategory } from '@/types';
import { getSubcategoriesFor } from '@/features/garage/lib/getSubcategories';

type Props = {
    category: PartCategory;
    items: CarPartItem[];
    onSelect: (subcategory: string) => void;
};

export default function PartsSubcategoryGrid({
                                                 category,
                                                 items,
                                                 onSelect,
                                             }: Props) {
    const subs = getSubcategoriesFor(category);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {subs.map((s) => {
                const count = items.filter(
                    (i) => (i.subcategory || 'other') === s.id
                ).length;

                return (
                    <button
                        key={s.id}
                        type="button"
                        onClick={() => onSelect(s.id)}
                        className="bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-2xl px-4 py-4 text-left transition"
                    >
                        <p className="text-sm font-medium text-white">
                            {s.label}
                            {s.isCustom ? ' ★' : ''}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                            {count > 0 ? `${count} поз.` : 'пусто'}
                        </p>
                    </button>
                );
            })}
        </div>
    );
}