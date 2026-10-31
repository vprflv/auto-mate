'use client';

import Image from 'next/image';
import { Package, Trash2 } from 'lucide-react';

import type { CarFluidItem } from '@/types/oil';

type Props = {
    item: CarFluidItem;
    onClick: () => void;
    onDelete?: (id: string) => void;
};

export default function FluidCard({
                                      item,
                                      onClick,
                                      onDelete,
                                  }: Props) {
    const photo = item.photos?.[0];

    return (
        <div className="relative h-full rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-colors hover:border-[var(--btn-primary)]">
            <button
                type="button"
                onClick={onClick}
                className="flex h-full w-full flex-col overflow-hidden rounded-2xl text-left"
            >
                <div className="flex aspect-[4/3] w-full shrink-0 items-center justify-center bg-[var(--bg-elevated)]">
                    {photo ? (
                        <Image
                            src={photo}
                            alt={item.name}
                            width={400}
                            height={300}
                            className="h-full w-full object-contain"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-[var(--text-dim)]">
                            <Package
                                className="h-10 w-10"
                                aria-hidden="true"
                            />

                            <span className="text-xs">
                                Нет фотографии
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h4 className="truncate font-medium text-[var(--text)]">
                                {item.name}
                            </h4>

                            {item.brand && (
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    {item.brand}
                                </p>
                            )}
                        </div>

                        {item.volume && (
                            <span className="shrink-0 text-sm font-medium text-[var(--link)]">
                                {item.volume}
                            </span>
                        )}
                    </div>

                    {item.spec && (
                        <p className="mt-3 line-clamp-2 text-sm text-[var(--text-muted)]">
                            {item.spec}
                        </p>
                    )}
                </div>
            </button>

            {onDelete && (
                <button
                    type="button"
                    aria-label={`Удалить ${item.name}`}
                    onClick={() => onDelete(item.id)}
                    className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] shadow-sm transition-colors hover:border-[var(--danger)] hover:text-[var(--danger)]"
                >
                    <Trash2
                        size={18}
                        aria-hidden="true"
                    />
                </button>
            )}
        </div>
    );
}