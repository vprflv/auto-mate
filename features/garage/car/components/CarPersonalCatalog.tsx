'use client';

import {ReactElement, useState} from 'react';
import type { ReactNode } from 'react';

import Link from 'next/link';
import {
    ArrowUpRight,
    Component,
    Droplets,
    Sparkles,
} from 'lucide-react';

type CatalogTab = 'parts' | 'fluids';

type Props = {
    carId: string;
    parts: ReactNode;
    fluids: ReactNode;
};

const TABS = [
    {
        id: 'parts',
        label: 'Запчасти',
        icon: Component,
    },
    {
        id: 'fluids',
        label: 'Масла и жидкости',
        icon: Droplets,
    },
] satisfies {
    id: CatalogTab;
    label: string;
    icon: typeof Component;
}[];

export default function CarPersonalCatalog({
                                               carId,
                                               parts,
                                               fluids,
                                           }: Props) {
    const [tab, setTab] =
        useState<CatalogTab>('parts');

    return (
        <section className="space-y-5">
            <div>
                <h2 className="text-xl font-semibold text-[var(--text)]">
                    Мой каталог
                </h2>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Сохранённые запчасти, масла и жидкости
                    этого автомобиля.
                </p>
            </div>

            <div
                role="group"
                aria-label="Раздел личного каталога"
                className="flex flex-wrap gap-2"
            >
                {TABS.map((item) => {
                    const active = tab === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setTab(item.id)}
                            className={[
                                'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                                active
                                    ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)]'
                                    : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text)]',
                            ].join(' ')}
                        >
                            <Icon
                                size={17}
                                aria-hidden="true"
                            />

                            {item.label}
                        </button>
                    );
                })}
            </div>

            <div>
                {tab === 'parts' ? parts : fluids}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-5">
                <p className="text-sm text-[var(--text-muted)]">
                    Нужна деталь, которой здесь ещё нет?
                </p>

                <Link
                    href={`/garage/${carId}/catalog`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[var(--link)] transition-opacity hover:opacity-80"
                >
                    <Sparkles
                        size={17}
                        aria-hidden="true"
                    />

                    Открыть ИИ-каталог

                    <ArrowUpRight
                        size={16}
                        aria-hidden="true"
                    />
                </Link>
            </div>
        </section>
    );
}