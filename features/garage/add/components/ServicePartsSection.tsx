import ServicePartCard from './ServicePartCard';
import { PartForm } from '@/features/garage/add/types/serviceForm';

type Props = {
    parts: PartForm[];
    onAdd: () => void;
    onChange: (id: string, field: keyof PartForm, value: string) => void;
    onRemove: (id: string) => void;
};

export default function ServicePartsSection({
                                                parts,
                                                onAdd,
                                                onChange,
                                                onRemove,
                                            }: Props) {
    return (
        <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-[#F5F5F5]">Расходники</h2>
                <button
                    type="button"
                    onClick={onAdd}
                    className="bg-[#1F1F1F] hover:bg-[#2A2A2A] text-sm px-4 py-2 rounded-xl text-[#F5F5F5] transition"
                >
                    + Добавить
                </button>
            </div>

            {parts.length === 0 && (
                <p className="text-[#666666] text-sm text-center py-6">
                    Пока нет расходников. Нажми «+ Добавить»
                </p>
            )}

            <div className="space-y-4">
                {parts.map((part, index) => (
                    <ServicePartCard
                        key={part.id}
                        part={part}
                        index={index}
                        onChange={onChange}
                        onRemove={onRemove}
                    />
                ))}
            </div>
        </div>
    );
}