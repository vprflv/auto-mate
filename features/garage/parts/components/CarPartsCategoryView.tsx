'use client';

import { Plus, Trash2 } from 'lucide-react';

type CategoryOption = {
    id: string;
    label: string;
    isCustom?: boolean;
};

type Props = {
    categories: CategoryOption[];
    activeCategory: string | null;
    onOpenCategory: (id: string) => void;
    onCreateCategory: () => void;
    onDeleteCategory: (id: string) => void;
};

export default function CarPartsCategoryView({
                                                 categories,
                                                 activeCategory,
                                                 onOpenCategory,
                                                 onCreateCategory,
                                                 onDeleteCategory,
                                             }: Props) {
    return (
        <aside className="flex h-full w-full flex-col">
            <div className="flex-1 p-3">
                {categories.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-[var(--text-dim)]">
                        Пока нет категорий
                    </p>
                ) : (
                    <div className="flex flex-col gap-1">
                        {categories.map((category) => {
                            const isActive =
                                activeCategory === category.id;

                            return (
                                <div
                                    key={category.id}
                                    className={[
                                        'flex w-full items-center gap-1 rounded-xl transition-all',
                                        isActive
                                            ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)]'
                                            : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]',
                                    ].join(' ')}
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onOpenCategory(category.id)
                                        }
                                        className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium"
                                    >
                                        {category.isCustom && (
                                            <span
                                                className={
                                                    isActive
                                                        ? 'opacity-100'
                                                        : 'text-[var(--text-accent)]'
                                                }
                                            >
                                                ★
                                            </span>
                                        )}

                                        <span className="truncate">
                                            {category.label}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onDeleteCategory(category.id)
                                        }
                                        className={[
                                            'mr-1 rounded-lg p-1.5 transition active:scale-95',
                                            isActive
                                                ? 'text-[var(--btn-primary-text)]/70 hover:bg-black/10 hover:text-[var(--btn-primary-text)]'
                                                : 'text-[var(--text-dim)] hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]',
                                        ].join(' ')}
                                        title="Удалить категорию"
                                        aria-label={`Удалить категорию ${category.label}`}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="border-t border-[var(--border)] p-3">
                <button
                    type="button"
                    onClick={onCreateCategory}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] transition hover:border-[var(--btn-primary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
                >
                    <Plus size={17} />
                    Создать категорию
                </button>
            </div>
        </aside>
    );
}