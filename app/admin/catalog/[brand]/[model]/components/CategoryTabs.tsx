import { mockCategories } from '../data/mockModelCatalog';

interface Props {
    selectedCategory: string;
    onSelectCategory: (catId: string) => void;
}

export function CategoryTabs({ selectedCategory, onSelectCategory }: Props) {
    return (
        <div className="flex gap-2 overflow-x-auto border-b border-[var(--border)]/70 pb-2">
            {mockCategories.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => onSelectCategory(cat.id)}
                        className={`rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                            active
                                ? 'bg-[var(--bg-elevated)] text-[var(--text)] font-semibold border border-[var(--border)] shadow-xs'
                                : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]/50 hover:text-[var(--text)]'
                        }`}
                    >
                        {cat.label}
                    </button>
                );
            })}
        </div>
    );
}