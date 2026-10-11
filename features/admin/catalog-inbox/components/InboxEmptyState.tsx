import * as React from 'react';
import { CheckCircle2 } from 'lucide-react';

export function InboxEmptyState() {
    return (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <p className="mt-3 text-sm font-medium text-[var(--text)]">
                Очередь модерации пуста
            </p>
            <p className="mt-1 text-xs text-[var(--text-dim)]">
                Все входящие автомобили и детали проверены
            </p>
        </div>
    );
}