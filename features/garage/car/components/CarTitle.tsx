'use client';

import type { Car } from '@/types';

type Props = {
    car: Car;
};

export default function CarTitle({ car }: Props) {
    return (
        <div className="bg-transparent">
            <h1 className="text-3xl font-bold leading-tight text-[var(--text)] sm:text-4xl">
                {car.nickname ||
                    `${car.make} ${car.model}`}
            </h1>

            <p className="mt-2 text-base text-[var(--text-muted)] sm:text-lg">
                {car.make} {car.model} • {car.year}
                {car.color ? ` • ${car.color}` : ''}
            </p>

            <p className="mt-3 inline-block rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1 font-mono text-sm tracking-wide text-[var(--text-muted)]">
                {car.vin || 'НЕТ VIN'}
            </p>
        </div>
    );
}