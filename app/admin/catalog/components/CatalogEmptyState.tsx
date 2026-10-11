import { Layers } from 'lucide-react';

export function CatalogEmptyState() {
    return (
        <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center">
            <Layers className="h-8 w-8 text-[var(--text-dim)]" />
            <p className="mt-2 text-sm font-medium text-[var(--text)]">
                Марки и модели не найдены
            </p>
        </div>
    );
}