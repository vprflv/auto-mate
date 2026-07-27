
import ServicePartCard from './ServicePartCard';
import {PartForm} from "@/features/garage/add/types/serviceForm";

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
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">Расходники</h2>
                <button
                    type="button"
                    onClick={onAdd}
                    className="bg-zinc-800 hover:bg-zinc-700 text-sm px-4 py-2 rounded-xl transition"
                >
                    + Добавить
                </button>
            </div>

            {parts.length === 0 && (
                <p className="text-zinc-500 text-sm text-center py-6">
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