'use client';

import { Plus } from 'lucide-react';
import { CarPartItem } from '@/types';

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
    const activeSubs = subs.filter((sub) => {
        if (sub.isCustom) {
            return true;
        }

        return inCategory.some(
            (item) => (item.subcategory || 'other') === sub.id
        );
    });

    return (
        <div className="flex min-h-[280px] flex-col">
            <div className="flex-1">
                {activeSubs.length === 0 ? (
                    <div className="flex min-h-[220px] items-center justify-center">
                        <div className="text-center">
                            <p className="text-sm font-medium text-[var(--text)]">
                                Подкатегорий пока нет
                            </p>

                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                                Создайте первую подкатегорию для этой категории
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {activeSubs.map((sub) => {
                            const count = inCategory.filter(
                                (item) =>
                                    (item.subcategory || 'other') ===
                                    sub.id
                            ).length;

                            return (
                                <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => onOpenSub(sub.id)}
                                    className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-left transition-all hover:border-[var(--btn-primary)] active:scale-[0.98]"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm font-semibold text-[var(--text)]">
                                            {sub.isCustom && (
                                                <span className="mr-1 text-[var(--text-accent)]">
                                                    ★
                                                </span>
                                            )}

                                            {sub.label}
                                        </p>

                                        <span className="shrink-0 text-xs font-medium text-[var(--text-dim)]">
                                            {count}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-xs text-[var(--text-dim)]">
                                        {count === 0
                                            ? 'Пусто'
                                            : count === 1
                                                ? '1 позиция'
                                                : count < 5
                                                    ? `${count} позиции`
                                                    : `${count} позиций`}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="mt-6">
                <button
                    type="button"
                    onClick={onCreateSub}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] transition hover:border-[var(--btn-primary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
                >
                    <Plus size={17} />
                    Создать подкатегорию
                </button>
            </div>
        </div>
    );
}