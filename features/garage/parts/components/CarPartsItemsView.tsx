'use client';

import { Plus } from 'lucide-react';
import { CarPartItem } from '@/types';
import CarPartItemCard from './CarPartItemCard';

type Props = {
    carId: string;
    items: CarPartItem[];
    onEdit: (item: CarPartItem) => void;
    onAdd: () => void;
    onBack: () => void;
    title: string;
};

export default function CarPartsItemsView({
                                              carId,
                                              items,
                                              onEdit,
                                              onAdd,
                                              onBack,
                                              title,
                                          }: Props) {
    return (
        <div className="flex min-h-[280px] flex-col">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <button
                        type="button"
                        onClick={onBack}
                        className="mb-1 text-sm text-[var(--text-muted)] transition hover:text-[var(--text)]"
                    >
                        ← Назад
                    </button>

                    <h3 className="truncate text-base font-semibold text-[var(--text)]">
                        {title}
                    </h3>

                    <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                        {items.length === 0
                            ? 'Пока ничего не добавлено'
                            : items.length === 1
                                ? '1 позиция'
                                : items.length < 5
                                    ? `${items.length} позиции`
                                    : `${items.length} позиций`}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onAdd}
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[var(--btn-primary)] px-3 py-2 text-sm font-semibold text-[var(--btn-primary-text)] transition hover:bg-[var(--btn-primary-hover)]"
                >
                    <Plus size={17} />

                    <span className="hidden sm:inline">
                        Добавить
                    </span>
                </button>
            </div>

            {items.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <CarPartItemCard
                            key={item.id}
                            carId={carId}
                            item={item}
                            onEdit={onEdit}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-elevated)]/30">
                    <div className="text-center">
                        <p className="text-sm font-medium text-[var(--text)]">
                            В этом разделе пока пусто
                        </p>

                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            Добавьте первую запчасть
                        </p>

                        <button
                            type="button"
                            onClick={onAdd}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--btn-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--btn-primary-text)] transition hover:bg-[var(--btn-primary-hover)]"
                        >
                            <Plus size={17} />
                            Добавить запчасть
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}