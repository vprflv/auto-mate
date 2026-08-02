'use client';

import { ServiceRecord } from '@/types';
import { Pencil, Trash2 } from 'lucide-react';

type Props = {
    record: ServiceRecord;
    onEdit: (record: ServiceRecord) => void;
    onDelete?: (id: string) => void;
};

export default function ServiceRecordCard({ record, onEdit, onDelete }: Props) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h3 className="font-semibold text-lg">{record.title}</h3>
                    <p className="text-zinc-400 text-sm mt-1">
                        {new Date(record.date).toLocaleDateString('ru-RU')}
                        {record.mileage
                            ? ` • ${record.mileage.toLocaleString('ru-RU')} км`
                            : ''}
                    </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {record.cost !== undefined && (
                        <span className="text-sm font-medium whitespace-nowrap mr-2">
              {record.cost.toLocaleString('ru-RU')} ₽
            </span>
                    )}

                    <button
                        type="button"
                        onClick={() => onEdit(record)}
                        className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                        title="Редактировать"
                    >
                        <Pencil size={16} />
                    </button>

                    {onDelete && (
                        <button
                            type="button"
                            onClick={() => onDelete(record.id)}
                            className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition"
                            title="Удалить"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {record.description && (
                <p className="text-sm text-zinc-400 mt-3">{record.description}</p>
            )}

            {record.parts && Array.isArray(record.parts) && record.parts.length > 0 && (
                <div className="mt-3 space-y-1">
                    {record.parts.map((part) => (
                        <p key={part.id} className="text-sm text-zinc-500">
                            {part.quantity}× {part.name}
                            {part.brand ? ` (${part.brand})` : ''}
                            {part.oemNumber ? ` • ${part.oemNumber}` : ''}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}