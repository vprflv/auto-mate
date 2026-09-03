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
        <div className="bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#39FF14]/40 rounded-2xl overflow-hidden transition">
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
                className="cursor-pointer"
            >
                <div className="aspect-[4/3] bg-[#161616] flex items-center justify-center">
                    {item.photo ? (
                        <img
                            src={item.photo}
                            alt={item.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Package
                            className="w-10 h-10 text-[#3A3A3A]"
                            strokeWidth={1.5}
                        />
                    )}
                </div>

                <div className="p-3 pb-2">
                    {item.brand && (
                        <p className="text-xs text-[#666666] mb-0.5 truncate">
                            {item.brand}
                        </p>
                    )}
                    <p className="text-sm text-[#F5F5F5] font-medium leading-snug line-clamp-2">
                        {item.quantity && item.quantity > 1
                            ? `${item.quantity}× `
                            : ''}
                        {item.name}
                    </p>
                    {item.oemNumber && (
                        <p className="text-xs font-mono text-[#A3A3A3] mt-1 truncate">
                            {item.oemNumber}
                        </p>
                    )}
                </div>
            </div>

            <div className="px-3 pb-3 flex gap-2">
                <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="flex-1 py-2 rounded-xl bg-[#1F1F1F] hover:bg-[#2A2A2A] text-xs font-medium text-[#F5F5F5] transition"
                >
                    Изменить
                </button>

                <Link
                    href={`/garage/${carId}/buy?name=${encodeURIComponent(item.name)}&oem=${encodeURIComponent(item.oemNumber || '')}&brand=${encodeURIComponent(item.brand || '')}&analog=${encodeURIComponent(item.analogNumber || '')}`}
                    className="flex-1 py-2 rounded-xl bg-[#39FF14] hover:bg-[#57FF3A] text-black text-xs font-medium transition text-center"
                >
                    Где купить
                </Link>
            </div>
        </div>
    );
}