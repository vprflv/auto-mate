import Image from 'next/image';

import { CarFluidItem } from '@/types/oil';
import {Package} from "lucide-react";

type Props = {
    item: CarFluidItem;
    onClick: () => void;
};

export default function FluidCard({ item, onClick }: Props) {
    const photo = item.photos?.[0];

    return (
        <button
            type="button"
            onClick={onClick}
            className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] text-left transition hover:border-[var(--btn-primary)] hover:bg-[var(--bg-elevated)]"
        >
            {/* Photo */}
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
                        <Package className="h-10 w-10" />
                        <span className="text-xs">Нет фотографии</span>
                    </div>
                )}
            </div>

            {/* Info */}
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
                        <span className="shrink-0 text-sm font-medium text-[var(--text-accent)]">
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
    );
}