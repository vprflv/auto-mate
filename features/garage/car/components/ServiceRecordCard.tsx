
'use client';

import { ServiceRecord } from '@/types';
import { Pencil, Trash2 } from 'lucide-react';
import ServicePhotoViewer from './ServicePhotoViewer';

type Props = {
    record: ServiceRecord;
    onEdit: (record: ServiceRecord) => void;
    onDelete?: (id: string) => void;
};

export default function ServiceRecordCard({
    record,
    onEdit,
    onDelete,
}: Props) {
    return (
        <div className="rounded-2xl border border-[var(--border)]/30 bg-[var(--card)] p-5 transition-colors duration-200">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-[var(--text)]">
                        {record.title}
                    </h3>

                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        {new Date(
                            record.date
                        ).toLocaleDateString('ru-RU')}
                        {record.mileage
                            ? ` • ${record.mileage.toLocaleString(
    'ru-RU'
)} км`
                            : ''}
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    {record.cost !== undefined && (
                        <span className="mr-2 whitespace-nowrap text-sm font-medium text-[var(--text)]">
                            {record.cost.toLocaleString(
                                'ru-RU'
                            )}{' '}
                            ₽
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={() => onEdit(record)}
                        className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] active:scale-95"
                        title="Редактировать"
                    >
                        <Pencil size={16} />
                    </button>

                    {onDelete && (
                        <button
                            type="button"
                            onClick={() =>
                                onDelete(record.id)
                            }
                            className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--danger)] active:scale-95"
                            title="Удалить"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {record.description && (
                <p className="mt-3 text-sm text-[var(--text-muted)]">
                    {record.description}
                </p>
            )}

            {record.parts &&
                Array.isArray(record.parts) &&
                record.parts.length > 0 && (
                    <div className="mt-3 space-y-1">
                        {record.parts.map((part) => (
                            <p
                                key={part.id}
                                className="text-sm text-[var(--text-dim)]"
                            >
                                {part.quantity}× {part.name}
                                {part.brand
                                    ? ` (${part.brand})`
                                    : ''}
                                {part.oemNumber
                                    ? ` • ${part.oemNumber}`
                                    : ''}
                            </p>
                        ))}
                    </div>
                )}

            {record.photos &&
                Array.isArray(record.photos) &&
                record.photos.length > 0 && (
                    <ServicePhotoViewer
                        photos={record.photos}
                    />
                )}
        </div>
    );
}

