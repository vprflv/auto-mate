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
                <h2 className="text-2xl font-bold text-[#F5F5F5]">История обслуживания</h2>
                <Link
                    href={`/garage/${carId}/service/add`}
                    className="text-sm text-[#39FF14] hover:text-[#57FF3A] transition"
                >
                    + Добавить запись
                </Link>
            </div>

            {sorted.length === 0 ? (
                <div className="bg-[#161616]/70 border border-[#2A2A2A] rounded-3xl p-10 text-center">
                    <p className="text-[#A3A3A3] mb-2">Пока нет записей</p>
                    <p className="text-sm text-[#666666]">
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