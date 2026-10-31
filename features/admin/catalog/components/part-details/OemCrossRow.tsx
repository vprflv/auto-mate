'use client';

import { Trash2 } from 'lucide-react';

import { ConfirmDeleteDialog } from '@/components/ui/ConfirmDeleteDialog';

import {
    OemCrossSelect,
    type OemSuggestion
} from '@/features/admin/catalog-inbox/components/part-moderation/OemCrossSelect';

interface Props {
    index: number;
    value: string;
    suggestions: OemSuggestion[];
    isLastOem: boolean;
    onChange: (value: string) => void;
    onRemove: () => boolean;
}

export function OemCrossRow({
                                index,
                                value,
                                suggestions,
                                isLastOem,
                                onChange,
                                onRemove
                            }: Props) {
    return (
        <div className="flex items-start gap-2">
            <OemCrossSelect
                compact
                label={`OEM-номер ${index + 1}`}
                value={value}
                onChange={onChange}
                suggestions={suggestions}
            />

            <ConfirmDeleteDialog
                title={
                    value.trim()
                        ? `Удалить OEM-номер «${value.trim()}»?`
                        : 'Удалить пустую строку?'
                }
                description="Строка будет убрана из списка. Изменение вступит в силу после нажатия «Сохранить»."
                onConfirm={onRemove}
            >
                <button
                    type="button"
                    disabled={isLastOem}
                    aria-label={`Удалить OEM-номер ${index + 1}`}
                    title={
                        isLastOem
                            ? 'У аналога должен оставаться хотя бы один OEM-номер'
                            : 'Удалить OEM-номер'
                    }
                    className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-red-500/10 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--text-muted)]"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </ConfirmDeleteDialog>
        </div>
    );
}