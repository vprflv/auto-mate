'use client';

import Link from 'next/link';
import { Package } from 'lucide-react';
import { CarPartItem } from '@/types';

type Props = {
    carId: string;
    item: CarPartItem;
    onEdit: (item: CarPartItem) => void;
};

export default function CarPartItemCard({ carId, item, onEdit }: Props) {
    return (
        /*
          Заменили bg-[#0A0A0A] на var(--bg-elevated) (пастельно-бежевая подложка в светлой теме).
          Ховер-рамка теперь мягко подсвечивается в цвет активной ссылки темы var(--link)
        */
        <div className="bg-[var(--bg-elevated)] border border-[var(--border)]/20 hover:border-[var(--link)]/50 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col h-full group outline-none focus-within:ring-2 focus-within:ring-[var(--link)]/40">
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
                className="cursor-pointer flex-1 flex flex-col"
            >
                {/* Окно превью фото товара или иконка-заглушка */}
                <div className="aspect-[4/3] bg-[var(--bg)] flex items-center justify-center border-b border-[var(--border)]/10 overflow-hidden relative">
                    {item.photo ? (
                        <img
                            src={item.photo}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                    ) : (
                        <Package
                            className="w-10 h-10 text-[var(--text-dim)] transition-all duration-500 group-hover:text-[var(--link)]/40 group-hover:scale-110"
                            strokeWidth={1.5}
                        />
                    )}
                </div>

                {/* Текстовый блок описания запчасти */}
                <div className="p-3 pb-2 flex-1 flex flex-col justify-between">
                    <div>
                        {item.brand && (
                            /* Бренд переведён на var(--text-accent) */
                            <p className="text-xs text-[var(--text-accent)] font-semibold mb-0.5 truncate">
                                {item.brand}
                            </p>
                        )}
                        <p className="text-sm text-[var(--text)] font-bold leading-snug line-clamp-2">
                            {item.quantity && item.quantity > 1
                                ? `${item.quantity}× `
                                : ''}
                            {item.name}
                        </p>
                    </div>
                    {item.oemNumber && (
                        /* Артикул OEM теперь использует моноширинный var(--text-dim) */
                        <p className="text-xs font-mono text-[var(--text-dim)] mt-1.5 truncate font-medium">
                            {item.oemNumber}
                        </p>
                    )}
                </div>
            </div>

            {/* Блок нижних кнопок действий */}
            <div className="px-3 pb-3 flex gap-2 mt-auto">
                <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="flex-1 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)]/40 hover:bg-[var(--border)]/20 text-xs font-semibold text-[var(--text)] transition-all duration-200 cursor-pointer active:scale-95"
                >
                    Изменить
                </button>

                {/*
                  Умная кнопка «Где купить»:
                  В светлой теме она автоматически станет сочно-оранжевой, в тёмной — неоново-зелёной.
                  Свечение shadow активируется только для тёмного режима.
                */}
                <Link
                    href={`/garage/${carId}/buy?name=${encodeURIComponent(item.name)}&oem=${encodeURIComponent(item.oemNumber || '')}&brand=${encodeURIComponent(item.brand || '')}&analog=${encodeURIComponent(item.analogNumber || '')}`}
                    className="flex-1 py-2 rounded-xl bg-[var(--btn-primary)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)] text-xs font-bold transition-all duration-200 text-center flex items-center justify-center cursor-pointer active:scale-95 [html[data-theme=dark]_&]:shadow-[0_0_12px_rgba(57,255,20,0.2)]"
                >
                    Где купить
                </Link>
            </div>
        </div>
    );
}
