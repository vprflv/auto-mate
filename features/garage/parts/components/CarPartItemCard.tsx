'use client';

import Link from 'next/link';
import { Package } from 'lucide-react';

import { CarPartItem } from '@/types';

type Props = {
    carId: string;
    item: CarPartItem;
    onEdit: (item: CarPartItem) => void;
};

export default function CarPartItemCard({
                                            carId,
                                            item,
                                            onEdit,
                                        }: Props) {
    return (
        <div
            className="
                flex h-full flex-col overflow-hidden
                rounded-2xl
                border border-[var(--border)]
                bg-[var(--card)]
                text-left
                transition
                hover:border-[var(--btn-primary)]
                hover:bg-[var(--bg-elevated)]
                outline-none
                focus-within:ring-2
                focus-within:ring-[var(--link)]/40
            "
        >
            {/* Карточка запчасти */}
            <div
                role="button"
                tabIndex={0}
                onClick={() => onEdit(item)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onEdit(item);
                    }
                }}
                className="flex flex-1 cursor-pointer flex-col"
            >
                {/* Фото */}
                <div className="flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden bg-[var(--bg-elevated)]">
                    {item.photo ? (
                        <img
                            src={item.photo}
                            alt={item.name}
                            className="
                                h-full w-full
                                object-contain
                                transition-transform duration-500
                                group-hover:scale-105
                            "
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-[var(--text-dim)]">
                            <Package className="h-10 w-10" />
                            <span className="text-xs">Нет фотографии</span>
                        </div>
                    )}
                </div>

                {/* Информация */}
                <div className="flex flex-1 flex-col p-4">
                    <div className="min-w-0">
                        {item.brand && (
                            <p className="mb-1 truncate text-xs font-semibold text-[var(--text-accent)]">
                                {item.brand}
                            </p>
                        )}

                        <p className="line-clamp-2 text-sm font-bold leading-snug text-[var(--text)]">
                            {item.quantity && item.quantity > 1
                                ? `${item.quantity}× `
                                : ''}
                            {item.name}
                        </p>
                    </div>

                    {item.oemNumber && (
                        <p className="mt-2 truncate font-mono text-xs font-medium text-[var(--text-dim)]">
                            {item.oemNumber}
                        </p>
                    )}
                </div>
            </div>

            {/* Кнопки */}
            <div className="mt-auto grid grid-cols-2 gap-2 px-4 pb-4">
                <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="
                        min-w-0 whitespace-nowrap
                        rounded-xl
                        border border-[var(--border)]
                        bg-[var(--card)]
                        py-2
                        text-xs font-semibold
                        text-[var(--text)]
                        transition
                        hover:bg-[var(--bg-elevated)]
                        active:scale-95
                    "
                >
                    Изменить
                </button>

                <Link
                    href={`/garage/${carId}/buy?name=${encodeURIComponent(
                        item.name,
                    )}&oem=${encodeURIComponent(
                        item.oemNumber || '',
                    )}&brand=${encodeURIComponent(
                        item.brand || '',
                    )}&analog=${encodeURIComponent(
                        item.analogNumber || '',
                    )}`}
                    className="
                        flex min-w-0 items-center justify-center
                        whitespace-nowrap
                        rounded-xl
                        bg-[var(--btn-primary)]
                        py-2
                        text-center
                        text-xs font-bold
                        text-[var(--btn-primary-text)]
                        transition
                        hover:bg-[var(--btn-primary-hover)]
                        active:scale-95
                        [html[data-theme=dark]_&]:shadow-[0_0_12px_rgba(57,255,20,0.2)]
                    "
                >
                    Где купить
                </Link>
            </div>
        </div>
    );
}