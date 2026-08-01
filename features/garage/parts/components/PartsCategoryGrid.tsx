import { PartCategory, CarPartItem } from '@/types';
import {
    PART_CATEGORY_LABELS,
    PART_CATEGORY_ORDER,
} from '@/features/garage/lib/config/partCategories';

type Props = {
    items: CarPartItem[];
    onSelect: (category: PartCategory) => void;
};

export default function PartsCategoryGrid({ items, onSelect }: Props) {
    const categories = PART_CATEGORY_ORDER.filter((cat) =>
        items.some((i) => i.category === cat)
    );

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((cat) => {
                const count = items.filter((i) => i.category === cat).length;
                return (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => onSelect(cat)}
                        className="bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-2xl px-4 py-4 text-left transition"
                    >
                        <p className="text-sm font-medium text-white">
                            {PART_CATEGORY_LABELS[cat]}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">{count} поз.</p>
                    </button>
                );
            })}
        </div>
    );
}