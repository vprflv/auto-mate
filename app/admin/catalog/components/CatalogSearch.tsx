import { Search, X } from 'lucide-react';

interface Props {
    value: string;
    onChange: (value: string) => void;
}

export function CatalogSearch({ value, onChange }: Props) {
    return (
        <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-dim)]" />
            <input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Поиск по марке или модели авто..."
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-10 pr-9 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-dim)] focus:border-[var(--btn-primary)]"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text)]"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}