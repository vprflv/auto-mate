'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Props = {
    title: string;
    description: string;
    href: string;
    actionLabel: string;
    icon: LucideIcon;
};

export default function CarSectionAction({
                                             title,
                                             description,
                                             href,
                                             actionLabel,
                                             icon: Icon,
                                         }: Props) {
    return (
        <section className="flex min-h-[280px] flex-col rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-elevated)] text-[var(--link)]">
                <Icon
                    size={24}
                    aria-hidden="true"
                />
            </div>

            <div className="flex-1">
                <h2 className="text-2xl font-semibold text-[var(--text)]">
                    {title}
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
                    {description}
                </p>
            </div>

            <div className="mt-8 border-t border-[var(--border)] pt-5">
                <Link
                    href={href}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--btn-primary)] px-5 py-3 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)]"
                >
                    {actionLabel}

                    <ArrowUpRight
                        size={17}
                        aria-hidden="true"
                    />
                </Link>
            </div>
        </section>
    );
}