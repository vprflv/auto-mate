'use client';

import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { ConfirmDeleteDialog } from '@/components/ui/ConfirmDeleteDialog';
import { deleteCatalogPart } from '@/features/admin/lib/system-store/actions/deleteCatalogPart';

import type { StoredCatalogNode, StoredPartItem } from '@/features/admin/lib/system-store/types';
import { storage } from '@/features/admin/lib/system-store/storage';
import { getFluidAnalogFamily } from '@/features/admin/lib/system-store/fluidAnalogFamily';
import { detachFluidAnalog } from '@/features/admin/lib/system-store/actions/detachFluidAnalog';
import { FLUID_CATALOG_CATEGORY } from '@/features/catalog/lib/catalogSections';

interface Props {
    part: StoredPartItem;
    node: StoredCatalogNode;
    onDeleted: () => void;
}

export function DeleteCatalogPartButton({
                                            part,
                                            node,
                                            onDeleted
                                        }: Props) {
    const isFluid = node.category === FLUID_CATALOG_CATEGORY;
    const family = isFluid ? getFluidAnalogFamily(storage.getState().catalogNodes, node, part) : null;
    const localIds = new Set(node.items.map(item => item.id));
    const members = family?.members.filter(item => localIds.has(item.id)) ?? [];
    const familyIds = family?.linked ? members.map(item => item.id) : undefined;

    const description = isFluid
        ? familyIds
            ? ['Из этой ветки будут удалены:', ...members.map(item => `• ${item.name} · ${item.brand} ${item.article}`)].join('\n')
            : `${part.brand} · ${part.article}\n\nЖидкость будет удалена из ветки «${node.title}».`
        : [
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
                nodeId: node.id,
                partId: part.id,
                familyIds
            });
        } catch (error: unknown) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Не удалось удалить запчасть.'
            );

            return false;
        }

        toast.success(isFluid ? familyIds ? 'Цепочка удалена из ветки' : 'Жидкость удалена из ветки' : 'Запчасть удалена');
        onDeleted();

        return true;
    };

    const handleDetach = (): boolean => {
        try {
            detachFluidAnalog(node.id, part.id);
            toast.success('Жидкость отвязана в этой ветке');
            return true;
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Не удалось отвязать жидкость.');
            return false;
        }
    };

    const label = isFluid
        ? familyIds ? 'Удалить цепочку из ветки' : 'Удалить жидкость'
        : 'Удалить запчасть';

    return (
        <div className="space-y-2 border-t border-[var(--border)]/40 pt-4">
            {family?.ambiguous && (
                <p className="text-xs text-[var(--text-muted)]">
                    OEM-цепочки пересекаются. Уточните номера для группового удаления или отвяжите эту жидкость.
                </p>
            )}
            <div className="flex flex-wrap justify-end gap-2">
                {family?.linked && (
                    <ConfirmDeleteDialog
                        title={`Отвязать «${part.name}» от аналогов?`}
                        description={`OEM-связи этой позиции будут сняты в ветке «${node.title}». После этого позицию можно удалить отдельно.`}
                        confirmLabel="Отвязать"
                        onConfirm={handleDetach}
                    >
                        <button type="button" className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-semibold">
                            Отвязать от аналогов
                        </button>
                    </ConfirmDeleteDialog>
                )}
                {!family?.ambiguous && (
                    <ConfirmDeleteDialog
                        title={familyIds ? 'Удалить цепочку из этой ветки?' : `${label} «${part.name}»?`}
                        description={description}
                        onConfirm={handleDelete}
                    >
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2 text-xs font-bold text-red-500 transition hover:bg-red-500/10"
                        >
                            <Trash2 className="h-4 w-4" />
                            {label}
                        </button>
                    </ConfirmDeleteDialog>
                )}
            </div>
        </div>
    );
}