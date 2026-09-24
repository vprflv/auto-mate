'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ServiceRecord } from '@/types';
import ServiceRecordCard from './ServiceRecordCard';
import EditServiceModal from './EditServiceModal';

type Props = {
    carId: string;
    records: ServiceRecord[];
    onUpdateRecord: (record: ServiceRecord) => void;
    onDeleteRecord: (id: string) => void;
};

export default function ServiceHistory({
                                           carId,
                                           records,
                                           onUpdateRecord,
                                           onDeleteRecord,
                                       }: Props) {
    const [editRecord, setEditRecord] =
        useState<ServiceRecord | null>(null);

    const sorted = [...records].sort(
        (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
    );

    return (
        <section className="mb-10">
            <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-[var(--text)]">
                    История обслуживания
                </h2>

                <Link
                    href={`/garage/${carId}/service/add`}
                    className="text-sm text-[var(--text-accent)] transition hover:text-[var(--btn-primary-hover)]"
                >
                    + Добавить запись
                </Link>
            </div>

            {sorted.length === 0 ? (
                <div className="rounded-3xl border border-[var(--border)]/30 bg-[var(--card)] p-10 text-center transition-colors duration-200">
                    <p className="mb-2 text-[var(--text-muted)]">
                        Пока нет записей
                    </p>

                    <p className="text-sm text-[var(--text-dim)]">
                        Добавь первое ТО — масло, фильтры,
                        колодки и т.д.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sorted.map((record) => (
                        <ServiceRecordCard
                            key={record.id}
                            record={record}
                            onEdit={setEditRecord}
                            onDelete={onDeleteRecord}
                        />
                    ))}
                </div>
            )}

            <EditServiceModal
                open={!!editRecord}
                record={editRecord}
                onClose={() => setEditRecord(null)}
                onSave={onUpdateRecord}
                onDelete={onDeleteRecord}
            />
        </section>
    );
}