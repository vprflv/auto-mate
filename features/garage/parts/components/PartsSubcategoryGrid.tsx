import { CarPartItem, PartCategory } from '@/types';
import {
    PART_SUBCATEGORY_LABELS,
    PART_SUBCATEGORY_ORDER,
} from '@/features/garage/lib/config/partSubcategories';


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
    // Всегда берём список из конфига — Колодки, Диски и т.д. кликабельны
    const subs = PART_SUBCATEGORY_ORDER[category] || ['other'];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {subs.map((sub) => {
                const count = items.filter(
                    (i) => (i.subcategory || 'other') === sub
                ).length;

                return (
                    <button
                        key={sub}
                        type="button"
                        onClick={() => onSelect(sub)}
                        className="bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-2xl px-4 py-4 text-left transition"
                    >
                        <p className="text-sm font-medium text-white">
                            {PART_SUBCATEGORY_LABELS[sub] || sub}
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