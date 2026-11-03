'use client';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';

type Props = {
    value: string;
};

export function CopyNumberButton({ value }: Props) {
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success('Номер скопирован');
        } catch {
            toast.error('Не удалось скопировать номер');
        }
    };

    return (
        <button
            type="button"
            onClick={event => {
                event.stopPropagation();
                void copy();
            }}
            aria-label={`Скопировать ${value}`}
            title="Скопировать номер"
            className="shrink-0 rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--border)] hover:text-[var(--link)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--link)]"
        >
            <Copy className="h-4 w-4" aria-hidden="true" />
        </button>
    );
}