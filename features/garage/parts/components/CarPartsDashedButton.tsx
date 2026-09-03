'use client';

import { Plus } from 'lucide-react';

type Props = {
    label: string;
    onClick: () => void;
};

export default function CarPartsDashedButton({ label, onClick }: Props) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-[#2A2A2A] text-[#A3A3A3] hover:border-[#39FF14] hover:text-[#39FF14] transition"
        >
            <Plus size={18} />
            {label}
        </button>
    );
}