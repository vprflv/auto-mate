'use client';

import { useId } from 'react';
import { ScanLine } from 'lucide-react';

interface Props {
    value: string;
    onChange: (value: string) => void;
}

export function CarVinField({ value, onChange }: Props) {
    const id = useId();

    return (
        <section className="space-y-3 rounded-3xl border border-[var(--link)]/30 bg-[var(--bg-elevated)] p-6">
            <label
                htmlFor={id}
                className="flex items-center gap-2 text-lg font-semibold text-[var(--text)]"
            >
                <ScanLine className="h-5 w-5 text-[var(--link)]" />
                VIN автомобиля
            </label>

            <input
                id={id}
                type="text"
                value={value}
                maxLength={17}
                autoComplete="off"
                spellCheck={false}
                placeholder="Введите VIN"
                onChange={event =>
                    onChange(event.target.value.toUpperCase())
                }
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 font-mono text-lg tracking-widest text-[var(--text)] outline-none transition focus:border-[var(--link)]"
            />

            <p className="text-xs text-[var(--text-muted)]">
                Укажите VIN, если он известен.
                Поле можно оставить пустым.
            </p>
        </section>
    );
}