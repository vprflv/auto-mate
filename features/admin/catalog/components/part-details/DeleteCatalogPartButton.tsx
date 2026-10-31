'use client';

import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { ConfirmDeleteDialog } from '@/components/ui/ConfirmDeleteDialog';
import { deleteCatalogPart } from '@/features/admin/lib/system-store/actions/deleteCatalogPart';

import type { StoredPartItem } from '@/features/admin/lib/system-store/types';

interface Props {
    part: StoredPartItem;
    nodeId: string;
    onDeleted: () => void;
}

export function DeleteCatalogPartButton({
                                            part,
                                            nodeId,
                                            onDeleted
                                        }: Props) {
    const description = [
        `${part.brand} · ${part.article}`,
        'Запчасть будет удалена из этого узла каталога. Это действие нельзя отменить.',
        part.isOem
            ? 'Автоматическая применимость связанных аналогов будет пересчитана.'
            : ''
    ]
        .filter(Boolean)
        .join('\n\n');

    const handleDelete = (): boolean => {
        try {
            deleteCatalogPart({
                nodeId,
                partId: part.id
            });
        } catch (error: unknown) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Не удалось удалить запчасть.'
            );

            return false;
        }

        toast.success('Запчасть удалена');
        onDeleted();

        return true;
    };

    return (
        <div className="flex justify-end border-t border-[var(--border)]/40 pt-4">
            <ConfirmDeleteDialog
                title={`Удалить запчасть «${part.name}»?`}
                description={description}
                onConfirm={handleDelete}
            >
                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2 text-xs font-bold text-red-500 transition hover:bg-red-500/10"
                >
                    <Trash2 className="h-4 w-4" />
                    Удалить запчасть
                </button>
            </ConfirmDeleteDialog>
        </div>
    );
}