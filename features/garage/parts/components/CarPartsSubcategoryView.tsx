'use client';

import { CarPartItem } from '@/types';
import CarPartsDashedButton from './CarPartsDashedButton';

type SubOption = {
    id: string;
    label: string;
    isCustom?: boolean;
};

type Props = {
    subs: SubOption[];
    inCategory: CarPartItem[];
    onOpenSub: (id: string) => void;
    onCreateSub: () => void;
};

export default function CarPartsSubcategoryView({
                                                    subs,
                                                    inCategory,
                                                    onOpenSub,
                                                    onCreateSub,
                                                }: Props) {
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {subs.map((s) => {
                    const count = inCategory.filter(
                        (i) => (i.subcategory || 'other') === s.id
                    ).length;

                    return (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => onOpenSub(s.id)}
                            className="bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#39FF14]/40 rounded-2xl px-4 py-4 text-left transition"
                        >
                            <p className="text-sm font-medium text-[#F5F5F5]">
                                {s.label}
                                {s.isCustom ? ' ★' : ''}
                            </p>
                            <p className="text-xs text-[#666666] mt-1">
                                {count > 0 ? `${count} поз.` : 'пусто'}
                            </p>
                        </button>
                    );
                })}
            </div>

            <CarPartsDashedButton
                label="Добавить подкатегорию"
                onClick={onCreateSub}
            />
        </div>
    );
}