'use client';

import { Package, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { useCarFluidsCard } from '../hooks/useCarFluidsCard';
import EditFluidModal from './EditFluidModal';


import { CarFluids } from '@/types/oil';
import ConfirmDeleteCategoryModal from "@/features/garage/components/ConfirmDeleteCategoryModal";

type CarFluidsCardProps = {
    fluids?: CarFluids;
    onUpdateFluids?: (fluids: CarFluids) => void;
};

export default function CarFluidsCard({
                                          fluids,
                                          onUpdateFluids,
                                      }: CarFluidsCardProps) {
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const {
        items,
        category,
        setCategory,
        editItem,
        setEditItem,
        isCreating,
        setIsCreating,
        customCategories,
        activeCategories,
        displayItems,
        title,
        getCategoryLabel,
        saveItem,
        deleteItem,
        deleteCategory,
        openCreate,
        handleCreateCategory,
    } = useCarFluidsCard({ fluids, onUpdateFluids });

    const handleCloseModal = () => {
        setEditItem(null);
        setIsCreating(false);
    };

    const handleDeleteCategory = () => {
        if (!deleteTarget) return;

        deleteCategory(deleteTarget);
        setDeleteTarget(null);
    };

    const deleteItemCount = deleteTarget
        ? items.filter(
            (item) =>
                item.category === deleteTarget &&
                item.name !== 'Маркер категории'
        ).length
        : 0;

    return (
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--text-accent)]">
                    <Package size={20} />
                </div>

                <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-[var(--text)]">
                        Масла и техжидкости
                    </h2>

                    <p className="text-sm text-[var(--text-muted)]">
                        Расходники и жидкости автомобиля
                    </p>
                </div>
            </div>

            {/* Mobile categories */}
            <div className="border-b border-[var(--border)] px-4 py-3 md:hidden">
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {activeCategories.map((c) => {
                        const count = items.filter(
                            (item) =>
                                item.category === c &&
                                item.name !== 'Маркер категории'
                        ).length;

                        const isCustom = c.startsWith('custom_');

                        return (
                            <div
                                key={c}
                                className="flex shrink-0 items-stretch gap-1"
                            >
                                <button
                                    type="button"
                                    onClick={() => setCategory(c)}
                                    className="min-w-0 rounded-2xl border border-[var(--border)]/20 bg-[var(--bg-elevated)] px-4 py-4 text-left transition duration-200 hover:border-[var(--link)]/50 active:scale-[0.98]"
                                >
                                    <p className="text-sm font-bold text-[var(--text)]">
                                        {getCategoryLabel(c)}
                                        {isCustom ? ' ★' : ''}
                                    </p>

                                    <p className="mt-1.5 text-xs font-medium text-[var(--text-dim)]">
                                        {count} поз.
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setDeleteTarget(c);
                                    }}
                                    className="flex w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)]/20 bg-[var(--bg-elevated)] text-[var(--text-dim)] transition hover:border-[var(--danger)]/30 hover:bg-[var(--danger)]/10 hover:text-[var(--danger)] active:scale-95"
                                    title={`Удалить категорию ${getCategoryLabel(c)}`}
                                    aria-label={`Удалить категорию ${getCategoryLabel(c)}`}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        );
                    })}

                    <button
                        type="button"
                        onClick={() => openCreate()}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-dashed border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition hover:border-[var(--btn-primary)] hover:text-[var(--text)]"
                    >
                        <Plus size={16} />
                        Категория
                    </button>
                </div>
            </div>

            {/* Main layout */}
            <div className="flex min-h-[320px]">
                {/* Sidebar */}
                <aside className="hidden w-56 shrink-0 border-r border-[var(--border)] bg-[var(--bg-elevated)]/40 md:flex md:flex-col">
                    <div className="flex-1 p-3">
                        <div className="flex flex-col gap-1">
                            {activeCategories.map((cat) => {
                                const isActive = category === cat;
                                const isCustom = cat.startsWith('custom_');

                                return (
                                    <div
                                        key={cat}
                                        className={[
                                            'flex w-full items-center gap-1 rounded-xl transition',
                                            isActive
                                                ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)]'
                                                : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]',
                                        ].join(' ')}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setCategory(cat)}
                                            className="min-w-0 flex-1 rounded-xl px-3 py-2.5 text-left text-sm font-medium"
                                        >
                                            <span className="flex min-w-0 items-center gap-2">
                                                {isCustom && (
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
                                                    {getCategoryLabel(cat)}
                                                </span>
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setDeleteTarget(cat)}
                                            className={[
                                                'mr-1 shrink-0 rounded-lg p-1.5 transition active:scale-95',
                                                isActive
                                                    ? 'text-[var(--btn-primary-text)]/70 hover:bg-black/10 hover:text-[var(--btn-primary-text)]'
                                                    : 'text-[var(--text-dim)] hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]',
                                            ].join(' ')}
                                            title={`Удалить категорию ${getCategoryLabel(cat)}`}
                                            aria-label={`Удалить категорию ${getCategoryLabel(cat)}`}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Create category */}
                    <div className="border-t border-[var(--border)] p-3">
                        <button
                            type="button"
                            onClick={() => openCreate()}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] transition hover:border-[var(--btn-primary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
                        >
                            <Plus size={17} />
                            Создать категорию
                        </button>
                    </div>
                </aside>

                {/* Content */}
                <div className="min-w-0 flex-1 p-4 md:p-5">
                    {!category ? (
                        <div className="flex min-h-[280px] items-center justify-center">
                            <div className="max-w-sm text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-elevated)] text-[var(--text-accent)]">
                                    <Package size={22} />
                                </div>

                                <h3 className="font-medium text-[var(--text)]">
                                    Выберите категорию
                                </h3>

                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    Выберите категорию слева, чтобы посмотреть
                                    жидкости и расходники.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Content header */}
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="truncate text-base font-semibold text-[var(--text)]">
                                        {title}
                                    </h3>

                                    <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                                        {displayItems.length > 0
                                            ? `${displayItems.length} ${
                                                displayItems.length === 1
                                                    ? 'позиция'
                                                    : displayItems.length < 5
                                                        ? 'позиции'
                                                        : 'позиций'
                                            }`
                                            : 'Пока ничего не добавлено'}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => openCreate(category)}
                                    className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[var(--btn-primary)] px-3 py-2 text-sm font-semibold text-[var(--btn-primary-text)] transition hover:bg-[var(--btn-primary-hover)]"
                                >
                                    <Plus size={17} />

                                    <span className="hidden sm:inline">
                                        Добавить
                                    </span>
                                </button>
                            </div>

                            {/* Items */}
                            {displayItems.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                    {displayItems.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setEditItem(item)}
                                            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-left transition hover:border-[var(--btn-primary)] hover:bg-[var(--bg-elevated)]"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h4 className="truncate font-medium text-[var(--text)]">
                                                        {item.name}
                                                    </h4>

                                                    {item.brand && (
                                                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                                                            {item.brand}
                                                        </p>
                                                    )}
                                                </div>

                                                {item.volume && (
                                                    <span className="shrink-0 text-sm font-medium text-[var(--text-accent)]">
                                                        {item.volume}
                                                    </span>
                                                )}
                                            </div>

                                            {item.spec && (
                                                <p className="mt-3 line-clamp-2 text-sm text-[var(--text-muted)]">
                                                    {item.spec}
                                                </p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-elevated)]/30">
                                    <div className="text-center">
                                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                                            <Package size={19} />
                                        </div>

                                        <p className="text-sm font-medium text-[var(--text)]">
                                            В категории пока пусто
                                        </p>

                                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                                            Добавьте первую жидкость
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => openCreate(category)}
                                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--btn-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--btn-primary-text)] transition hover:bg-[var(--btn-primary-hover)]"
                                        >
                                            <Plus size={17} />
                                            Добавить жидкость
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Edit fluid modal */}
            <EditFluidModal
                open={!!editItem}
                item={isCreating ? null : editItem}
                onClose={handleCloseModal}
                onSave={saveItem}
                onDelete={deleteItem}
                customCategories={customCategories}
                onCreateCategory={handleCreateCategory}
            />

            {/* Delete category confirmation */}
            <ConfirmDeleteCategoryModal
                open={deleteTarget !== null}
                categoryName={
                    deleteTarget
                        ? getCategoryLabel(deleteTarget)
                        : ''
                }
                itemCount={deleteItemCount}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteCategory}
            />
        </section>
    );
}