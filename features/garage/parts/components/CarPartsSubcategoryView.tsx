'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import type { CarPartItem } from '@/types';

import { isSuggestedPartSubcategory } from '@/features/garage/lib/config/partSubcategorySuggestions';

import {
    hidePartSubcategory,
    useHiddenPartSubcategories,
} from '@/features/garage/parts/hooks/useEnabledPartSubcategories';

import ConfirmDeleteSubcategoryModal from './ConfirmDeleteSubcategoryModal';

type SubOption = {
    id: string;
    label: string;
    isCustom?: boolean;
};

type Props = {
    carId: string;
    categoryId: string;
    subs: SubOption[];
    inCategory: CarPartItem[];
    enabledSubcategoryIds?: string[];
    suggestedNames?: string[];
    onOpenSub: (id: string) => void;
    onCreateSub: () => void;
};

function getCountLabel(count: number): string {
    if (count === 0) return 'Пусто';

    const last = count % 10;
    const lastTwo = count % 100;

    if (lastTwo >= 11 && lastTwo <= 14) {
        return `${count} позиций`;
    }

    if (last === 1) {
        return `${count} позиция`;
    }

    if (last >= 2 && last <= 4) {
        return `${count} позиции`;
    }

    return `${count} позиций`;
}

export default function CarPartsSubcategoryView({
                                                    carId,
                                                    categoryId,
                                                    subs,
                                                    inCategory,
                                                    enabledSubcategoryIds = [],
                                                    suggestedNames = [],
                                                    onOpenSub,
                                                    onCreateSub,
                                                }: Props) {
    const hiddenIds = new Set(
        useHiddenPartSubcategories(carId, categoryId)
    );

    const enabledIds = new Set<string>(
        enabledSubcategoryIds ?? []
    );

    const [deleteId, setDeleteId] =
        useState<string | null>(null);

    const [error, setError] = useState('');

    const counts = new Map<string, number>();

    for (const item of inCategory) {
        const id = item.subcategory || 'other';

        counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    // Если в подкатегории появились детали,
    // она всегда остаётся доступной.
    const activeSubs = subs.filter(
        (sub) =>
            (counts.get(sub.id) ?? 0) > 0 ||
            (!hiddenIds.has(sub.id) &&
                (sub.isCustom || enabledIds.has(sub.id)))
    );

    const target = subs.find(
        (sub) => sub.id === deleteId
    );

    const targetCount = deleteId
        ? counts.get(deleteId) ?? 0
        : 0;

    const closeDelete = () => {
        setDeleteId(null);
        setError('');
    };

    const confirmDelete = () => {
        if (!target || target.id === 'other') return;

        // Повторная проверка при подтверждении.
        if ((counts.get(target.id) ?? 0) > 0) return;

        try {
            hidePartSubcategory(
                carId,
                categoryId,
                target.id
            );

            closeDelete();
        } catch {
            setError(
                'Не удалось сохранить изменение. Подкатегория не удалена. Попробуйте ещё раз.'
            );
        }
    };

    return (
        <div className="flex min-h-[280px] flex-col">
            <div className="flex-1">
                {activeSubs.length === 0 ? (
                    <div className="flex min-h-[220px] items-center justify-center text-center">
                        <div>
                            <p className="text-sm font-medium text-[var(--text)]">
                                Подкатегорий пока нет
                            </p>

                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                                Выберите готовую подкатегорию
                                или создайте свою
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {activeSubs.map((sub) => {
                            const count =
                                counts.get(sub.id) ?? 0;

                            const showStar =
                                Boolean(sub.isCustom) &&
                                !isSuggestedPartSubcategory(
                                    sub.label,
                                    suggestedNames
                                );

                            return (
                                <div
                                    key={sub.id}
                                    className="flex items-start rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] transition-colors hover:border-[var(--btn-primary)]"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onOpenSub(sub.id)
                                        }
                                        className="min-w-0 flex-1 rounded-2xl p-4 text-left"
                                    >
                                        <span className="flex items-start justify-between gap-3">
                                            <span className="text-sm font-semibold text-[var(--text)]">
                                                {showStar && (
                                                    <span className="mr-1 text-[var(--link)]">
                                                        ★
                                                    </span>
                                                )}

                                                {sub.label}
                                            </span>

                                            <span className="shrink-0 text-xs text-[var(--text-muted)]">
                                                {count}
                                            </span>
                                        </span>

                                        <span className="mt-2 block text-xs text-[var(--text-muted)]">
                                            {getCountLabel(count)}
                                        </span>
                                    </button>

                                    {sub.id !== 'other' && (
                                        <button
                                            type="button"
                                            aria-label={`Удалить подкатегорию ${sub.label}`}
                                            onClick={() => {
                                                setError('');
                                                setDeleteId(sub.id);
                                            }}
                                            className="mr-1 mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[var(--text-muted)] transition-colors hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]"
                                        >
                                            <Trash2
                                                size={16}
                                                aria-hidden="true"
                                            />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="mt-6">
                <button
                    type="button"
                    onClick={onCreateSub}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] transition hover:border-[var(--btn-primary)] hover:text-[var(--text)]"
                >
                    <Plus
                        size={17}
                        aria-hidden="true"
                    />

                    Создать подкатегорию
                </button>
            </div>

            <ConfirmDeleteSubcategoryModal
                open={Boolean(target)}
                name={target?.label ?? ''}
                itemCount={targetCount}
                error={error}
                onClose={closeDelete}
                onConfirm={confirmDelete}
            />
        </div>
    );
}