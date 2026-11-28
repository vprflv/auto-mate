'use client';

import { useId } from 'react';
import { ScanLine } from 'lucide-react';
import { getIdentifierCyrillicWarning, normalizeIdentifierLetters, normalizeVinInput, VIN_LENGTH } from '../lib/config/vin';

interface Props {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    frame?: boolean;
}

export function CarVinField({ value, onChange, onBlur, frame = false }: Props) {
    const id = useId();
    const cyrillicWarning = getIdentifierCyrillicWarning(value);

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
                onBlur={onBlur}
                aria-invalid={Boolean(cyrillicWarning)}
                aria-describedby={cyrillicWarning ? `${id}-warning` : undefined}
                autoComplete="off"
                spellCheck={false}
                placeholder={frame ? 'Например, NZE141-1234567' : 'Введите VIN'}
                onChange={event => {
                    const value = frame ? normalizeIdentifierLetters(event.target.value) : normalizeVinInput(event.target.value);
                    if (frame || value.length <= VIN_LENGTH && /^[A-Z0-9\p{Script=Cyrillic}]*$/u.test(value)) onChange(value);
                }}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 font-mono text-lg tracking-widest text-[var(--text)] outline-none transition focus:border-[var(--link)]"
            />

            {cyrillicWarning && <p id={id + '-warning'} role="alert" className="text-sm text-[var(--danger)]">{cyrillicWarning}</p>}

            <p className="text-xs text-[var(--text-muted)]">
                Поле можно оставить пустым.
            </p>
        </section>
    );
}
