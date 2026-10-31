'use client';

import { useState } from 'react';
import { Droplets, Plus, Trash2 } from 'lucide-react';

import type { CarFluids } from '@/types/oil';
import type { CarSummaryInfo } from '@/features/garage/components/CarPartsCard';

import { useCarFluidsCard } from '../hooks/useCarFluidsCard';

import {
    FluidCategoryCreateModal,
    FluidCategoryDeleteModal, FluidDeleteModal,
} from './FluidCategoryModals';

import EditFluidModal from './EditFluidModal';
import FluidCard from './FluidCard';

type Props = {
    carId: string;
    carInfo?: CarSummaryInfo;
    fluids?: CarFluids;
    onUpdateFluids?: (fluids: CarFluids) => void;
};

export default function CarFluidsCard(props: Props) {
    const card = useCarFluidsCard(props);

    const [createForCar, setCreateForCar] =
        useState<string | null>(null);

    const [deleteTarget, setDeleteTarget] = useState<{
        carId: string;
        id: string;
    } | null>(null);

    const [deleteFluidTarget, setDeleteFluidTarget] =
        useState<{
            carId: string;
            id: string;
        } | null>(null);

    const fluidToDelete =
        deleteFluidTarget?.carId === props.carId
            ? card.items.find(
                (item) => item.id === deleteFluidTarget.id
            )
            : undefined;

    const target =
        deleteTarget?.carId === props.carId
            ? card.categories.find(
                (option) =>
                    option.id === deleteTarget.id
            )
            : undefined;

    return (
        <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)]">
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
                <Droplets
                    size={24}
                    className="text-[var(--link)]"
                    aria-hidden="true"
                />

                <div>
                    <h2 className="text-lg font-semibold text-[var(--text)]">
                        Масла и техжидкости
                    </h2>

                    <p className="text-sm text-[var(--text-muted)]">
                        Спецификации и жидкости автомобиля
                    </p>
                </div>
            </div>

            <div className="flex min-h-[320px] flex-col md:flex-row">
                <nav
                    aria-label="Категории жидкостей"
                    className="flex gap-2 overflow-x-auto border-b border-[var(--border)] p-3 md:w-56 md:shrink-0 md:flex-col md:overflow-visible md:border-b-0 md:border-r"
                >
                    {card.categories.map((option) => {
                        const active =
                            option.id === card.category;

                        return (
                            <div
                                key={option.id}
                                className={[
                                    'flex shrink-0 items-center rounded-xl',
                                    active
                                        ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)]'
                                        : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]',
                                ].join(' ')}
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        card.openCategory(option.id)
                                    }
                                    className="flex min-w-0 flex-1 items-center gap-2 px-3 py-3 text-left text-sm font-medium"
                                >
                                    <span>
                                        {option.isCustom && '★ '}
                                        {option.label}
                                    </span>

                                    <span className="ml-auto text-xs">
                                        {option.count}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    aria-label={`Удалить категорию ${option.label}`}
                                    onClick={() =>
                                        setDeleteTarget({
                                            carId: props.carId,
                                            id: option.id,
                                        })
                                    }
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-opacity hover:opacity-70"
                                >
                                    <Trash2
                                        size={16}
                                        aria-hidden="true"
                                    />
                                </button>
                            </div>
                        );
                    })}

                    <button
                        type="button"
                        onClick={() =>
                            setCreateForCar(props.carId)
                        }
                        className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] px-3 py-3 text-sm text-[var(--text-muted)]"
                    >
                        <Plus
                            size={17}
                            aria-hidden="true"
                        />
                        Категория
                    </button>
                </nav>

                <div className="min-w-0 flex-1 p-4 md:p-5">
                    {!card.category ? (
                        <div className="flex min-h-[250px] items-center justify-center text-center text-sm text-[var(--text-muted)]">
                            Выберите или добавьте категорию
                            жидкости
                        </div>
                    ) : (
                        <>
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <h3 className="text-base font-semibold text-[var(--text)]">
                                    {card.title}
                                </h3>

                                <button
                                    type="button"
                                    onClick={() => card.openCreate()}
                                    className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[var(--btn-primary)] px-3 py-2 text-sm text-[var(--btn-primary-text)]"
                                >
                                    <Plus
                                        size={17}
                                        aria-hidden="true"
                                    />
                                    Добавить
                                </button>
                            </div>

                            {card.displayItems.length === 0 ? (
                                <p className="py-8 text-center text-sm text-[var(--text-muted)]">
                                    В этой категории пока нет
                                    жидкостей
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {card.displayItems.map((item) => (
                                        <FluidCard
                                            key={item.id}
                                            item={item}
                                            onClick={() => card.openEdit(item)}
                                            onDelete={(id) =>
                                                setDeleteFluidTarget({
                                                    carId: props.carId,
                                                    id,
                                                })
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <EditFluidModal
                open={Boolean(card.editItem)}
                item={card.editItem}
                isCreating={card.isCreating}
                onClose={card.closeEdit}
                onSave={card.saveItem}
                onDelete={
                    card.isCreating
                        ? undefined
                        : card.deleteItem
                }
                customCategories={card.customCategories}
                onCreateCategory={card.handleCreateCategory}
            />

            <FluidCategoryCreateModal
                open={createForCar === props.carId}
                options={card.suggestedCategories}
                activeIds={card.categories.map(
                    (option) => option.id
                )}
                onClose={() => setCreateForCar(null)}
                onSelect={card.openCategory}
                onCreate={card.handleCreateCategory}
            />

            <FluidCategoryDeleteModal
                target={target}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() =>
                    target
                        ? card.deleteCategory(target.id)
                        : false
                }
            />
            <FluidDeleteModal
                target={fluidToDelete}
                onClose={() => setDeleteFluidTarget(null)}
                onConfirm={() =>
                    fluidToDelete
                        ? card.deleteItem(fluidToDelete.id)
                        : false
                }
            />
        </section>
    );
}