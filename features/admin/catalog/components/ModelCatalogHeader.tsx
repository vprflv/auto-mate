'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    ChevronLeft,
    CarFront,
    Users,
    CheckCircle2,
    Trash2,
} from 'lucide-react';

import type { StoredMasterModel } from '@/features/admin/lib/system-store/types';
import { ConfirmDeleteDialog } from '@/components/ui/ConfirmDeleteDialog';
import { deleteCatalogModel, getCatalogModelDeletionCounts } from '@/features/admin/lib/system-store/actions/deleteCatalogModel';

interface Props {
    model: StoredMasterModel;
}

export function ModelCatalogHeader({ model }: Props) {
    const router = useRouter();
    const [counts, setCounts] = useState<ReturnType<typeof getCatalogModelDeletionCounts> | null>(null);
    const [deleteError, setDeleteError] = useState('');

    function openDeleteConfirmation() {
        setDeleteError('');
        setCounts(null);
        try {
            setCounts(getCatalogModelDeletionCounts(model));
        } catch (error) {
            setDeleteError(error instanceof Error ? error.message : 'Не удалось открыть подтверждение.');
        }
    }

    function confirmDelete(): boolean {
        if (!counts) return false;
        try {
            deleteCatalogModel(model, counts);
        } catch (error) {
            setDeleteError(error instanceof Error ? error.message : 'Не удалось удалить модель.');
            return false;
        }
        toast.success('Модель удалена из каталога');
        router.replace('/admin/catalog');
        return true;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                    href="/admin/catalog"
                    className="inline-flex items-center gap-1 text-sm font-medium text-[var(--text-muted)] transition hover:text-[var(--link)]"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Назад к списку марок
                </Link>
                <ConfirmDeleteDialog
                    title={`Удалить «${model.brandName} ${model.modelName}» из каталога?`}
                    description="Будут удалены карточка модели, её модификации, VIN-правила и разделы с запчастями и жидкостями."
                    confirmLabel="Удалить модель"
                    onOpen={openDeleteConfirmation}
                    onConfirm={confirmDelete}
                    content={(
                        <div className="mt-3 space-y-2 text-sm">
                            {counts && (
                                <ul className="text-[var(--text-muted)]">
                                    <li>Модификации · {counts.modifications}</li>
                                    <li>VIN-правила и исключения · {counts.vinRules}</li>
                                    <li>Разделы модели · {counts.sections}</li>
                                    <li>Записи запчастей и жидкостей · {counts.items}</li>
                                </ul>
                            )}
                            {deleteError && <p role="alert" className="text-[var(--danger)]">{deleteError}</p>}
                        </div>
                    )}
                >
                    <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-[var(--danger)]/30 px-3 py-2 text-sm font-semibold text-[var(--danger)] hover:bg-[var(--danger)]/10">
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Удалить модель
                    </button>
                </ConfirmDeleteDialog>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-[var(--border)]/40 bg-[var(--card)] p-6 shadow-sm sm:p-8">
                <div className="pointer-events-none absolute -right-10 -top-10 text-[var(--bg-elevated)]/50">
                    <CarFront className="h-64 w-64 rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                    <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="break-words text-3xl font-extrabold tracking-tight text-[var(--text)]">
                                {model.brandName}{' '}
                                {model.modelName}
                            </h1>

                            {model.verified && (
                                <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-500">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Эталон
                                </span>
                            )}
                        </div>

                        <p className="text-sm text-[var(--text-muted)]">
                            Годы выпуска:{' '}
                            <span className="text-[var(--text)]">
                                {model.years}
                            </span>
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-[var(--border)]/50 bg-[var(--bg-elevated)]/60 px-5 py-3">
                        <Users className="h-5 w-5 text-[var(--link)]" />

                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">
                                В гаражах пользователей
                            </p>
                            <p className="text-xl font-black text-[var(--text)]">
                                {model.registeredCount || 0} авто
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
