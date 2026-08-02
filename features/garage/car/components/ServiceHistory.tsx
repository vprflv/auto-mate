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
    const [editRecord, setEditRecord] = useState<ServiceRecord | null>(null);

    const sorted = [...records].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold">История обслуживания</h2>
                <Link
                    href={`/garage/${carId}/service/add`}
                    className="text-sm text-blue-400 hover:text-blue-300 transition"
                >
                    + Добавить запись
                </Link>
            </div>

            {sorted.length === 0 ? (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-10 text-center">
                    <p className="text-zinc-500 mb-2">Пока нет записей</p>
                    <p className="text-sm text-zinc-600">
                        Добавь первое ТО — масло, фильтры, колодки и т.д.
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