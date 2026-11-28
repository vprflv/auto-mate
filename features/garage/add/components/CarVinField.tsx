'use client';

import { useId } from 'react';
import { ScanLine } from 'lucide-react';
import { normalizeIdentifierLetters, VIN_LENGTH } from '../lib/config/vin';

interface Props {
    value: string;
    onChange: (value: string) => void;
    frame?: boolean;
}

export function CarVinField({ value, onChange, frame = false }: Props) {
    const id = useId();

    return (
        <section className="space-y-3 rounded-3xl border border-[var(--link)]/30 bg-[var(--bg-elevated)] p-6">
            <label
                htmlFor={id}
                className="flex items-center gap-2 text-lg font-semibold text-[var(--text)]"
            >
                <ScanLine className="h-5 w-5 text-[var(--link)]" />
                {frame ? 'Номер кузова (Frame)' : 'VIN автомобиля'}
            </label>

            <input
                id={id}
                type="text"
                value={value}
                maxLength={frame ? undefined : VIN_LENGTH}
                autoComplete="off"
                spellCheck={false}
                placeholder={frame ? 'Например, NZE141-1234567' : 'Введите VIN'}
                onChange={event => {
                    const value = normalizeIdentifierLetters(event.target.value);
                    if (frame || /^[A-Z0-9]*$/.test(value)) onChange(value);
                }}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 font-mono text-lg tracking-widest text-[var(--text)] outline-none transition focus:border-[var(--link)]"
            />

            <p className="text-xs text-[var(--text-muted)]">
                Поле можно оставить пустым.
            </p>
        </section>
    );
}
