'use client';

import { Plus } from 'lucide-react';

import type { StoredPartItem } from '@/features/admin/lib/system-store/types';

import { useOemCrossEditor } from '../hooks/useOemCrossEditor';
import { OemCrossRow } from './part-details/OemCrossRow';

interface Props {
    part: StoredPartItem;
    nodeId: string;
}

export function OemCrossEditor({ part, nodeId }: Props) {
    const editor = useOemCrossEditor({ part, nodeId });

    return (
        <section className="space-y-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
            <h3 className="text-sm font-bold text-[var(--text)]">
                Связанные OEM-номера
            </h3>

            <p className="text-xs text-[var(--text-muted)]">
                Начните вводить номер и выберите подсказку
                или укажите его вручную.
                Каждый OEM-номер — в отдельной строке.
            </p>

            {editor.rows.map((value, index) => {
                const row = editor.getRowData(index);

                return (
                    <OemCrossRow
                        key={index}
                        index={index}
                        value={value}
                        suggestions={row.suggestions}
                        isLastOem={row.isLastOem}
                        onChange={nextValue =>
                            editor.updateRow(index, nextValue)
                        }
                        onRemove={() => editor.removeRow(index)}
                    />
                );
            })}

            {editor.error && (
                <p role="alert" className="text-xs text-red-500">
                    {editor.error}
                </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                    type="button"
                    onClick={editor.addRow}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-blue-500 transition hover:bg-blue-500/10"
                >
                    <Plus className="h-4 w-4" />
                    Добавить номер
                </button>

                <div className="flex gap-2">
                    {editor.dirty && (
                        <button
                            type="button"
                            onClick={editor.cancel}
                            className="rounded-lg px-3 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                        >
                            Отменить
                        </button>
                    )}

                    <button
                        type="button"
                        disabled={!editor.dirty}
                        onClick={editor.save}
                        className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </section>
    );
}