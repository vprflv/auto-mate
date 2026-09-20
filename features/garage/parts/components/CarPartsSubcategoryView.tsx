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
        <div className="space-y-3 bg-transparent">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {subs.map((s) => {
                    const count = inCategory.filter(
                        (i) => (i.subcategory || 'other') === s.id
                    ).length;

                    return (
                        /*
                          Заменили фоны на bg-[var(--bg-elevated)] (пастельно-бежевый в светлой теме).
                          Ховер-рамка теперь мягко подсвечивается в цвет активной ссылки темы.
                        */
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => onOpenSub(s.id)}
                            className="bg-[var(--bg-elevated)] border border-[var(--border)]/20 hover:border-[var(--link)]/50 rounded-2xl px-4 py-4 text-left transition-all duration-200 cursor-pointer active:scale-[0.98]"
                        >
                            {/* Текст подкатегории использует основной цвет текста активной темы */}
                            <p className="text-sm font-bold text-[var(--text)]">
                                {s.label}
                                {s.isCustom ? ' ★' : ''}
                            </p>
                            {/* Текст количества позиций переведён на var(--text-dim) */}
                            <p className="text-xs text-[var(--text-dim)] mt-1.5 font-medium">
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
