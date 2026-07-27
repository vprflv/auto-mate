import { ServiceRecord } from '@/types';

type Props = {
    record: ServiceRecord;
};

export default function ServiceRecordCard({ record }: Props) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="font-semibold text-lg">{record.title}</h3>
                    <p className="text-zinc-400 text-sm mt-1">
                        {new Date(record.date).toLocaleDateString('ru-RU')}
                        {record.mileage
                            ? ` • ${record.mileage.toLocaleString('ru-RU')} км`
                            : ''}
                    </p>
                </div>
                {record.cost !== undefined && (
                    <span className="text-sm font-medium whitespace-nowrap">
 {record.cost.toLocaleString('ru-RU')} ₽
 </span>
                )}
            </div>

            {record.description && (
                <p className="text-sm text-zinc-400 mt-3">{record.description}</p>
            )}

            {record.parts && (
                <div className="mt-3 space-y-1">
                    {Array.isArray(record.parts) ? (
                        record.parts.map((part) => (
                            < p key={part.id} className="text-sm text-zinc-500">
                                {part.quantity}× {part.name}
                                {part.brand ? ` (${part.brand})` : ''}
                                {part.oemNumber ? ` • ${part.oemNumber}` : ''}
                            </p>
                        ))
                    ) : (
                        <p className="text-sm text-zinc-500">
                            Расходники: {String(record.parts)}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}