'use client';

import { Package } from 'lucide-react';
import { CarPartItem } from '@/types';
import CopyButton from './CopyButton';

type Props = {
    item: CarPartItem;
    onEdit?: (item: CarPartItem) => void;
};

export default function PartListItem({ item, onEdit }: Props) {
    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            {/* Фото */}
            <div className="aspect-[4/3] bg-zinc-900 relative">
                {item.photo ? (
                    <img
                        src={item.photo}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-zinc-700" strokeWidth={1.5} />
                    </div>
                )}
            </div>

            {/* Контент */}
            <div className="p-4">
                {item.brand && (
                    <p className="text-xs text-zinc-500 mb-1">{item.brand}</p>
                )}

                <p className="text-sm font-medium text-white leading-snug">
                    {item.quantity && item.quantity > 1 ? `${item.quantity}× ` : ''}
                    {item.name}
                </p>

                {item.oemNumber && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="text-zinc-500">Ориг.</span>
                        <CopyButton value={item.oemNumber} label="ориг. номер" />
                    </div>
                )}

                {/* Кнопки */}
                <div className="mt-4 flex gap-2">
                    <button
                        type="button"
                        onClick={() => onEdit?.(item)}
                        className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm transition"
                    >
                        Редактировать
                    </button>
                </div>
            </div>
        </div>
    );
}