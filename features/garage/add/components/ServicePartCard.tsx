
import {
    FLUID_CATEGORY_OPTIONS,
    PART_CATEGORY_OPTIONS,
} from '@/features/garage/lib/config/serviceItemCategories';
import {PartForm} from "@/features/garage/add/types/serviceForm";

type Props = {
    part: PartForm;
    index: number;
    onChange: (id: string, field: keyof PartForm, value: string) => void;
    onRemove: (id: string) => void;
};

export default function ServicePartCard({
                                            part,
                                            index,
                                            onChange,
                                            onRemove,
                                        }: Props) {
    return (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Расходник #{index + 1}</span>
                <button
                    type="button"
                    onClick={() => onRemove(part.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                >
                    Удалить
                </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div>
                    <label className="block text-xs text-zinc-500 mb-1">Тип</label>
                    <select
                        value={part.itemType}
                        onChange={(e) => onChange(part.id, 'itemType', e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    >
                        <option value="part">Запчасть / расходник</option>
                        <option value="fluid">Жидкость / масло</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs text-zinc-500 mb-1">Категория</label>
                    {part.itemType === 'fluid' ? (
                        <select
                            value={part.fluidCategory}
                            onChange={(e) =>
                                onChange(part.id, 'fluidCategory', e.target.value)
                            }
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                        >
                            {FLUID_CATEGORY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <select
                            value={part.partCategory}
                            onChange={(e) =>
                                onChange(part.id, 'partCategory', e.target.value)
                            }
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                        >
                            {PART_CATEGORY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div>
                    <label className="block text-xs text-zinc-500 mb-1">Ориг. номер</label>
                    <input
                        value={part.oemNumber}
                        onChange={(e) => onChange(part.id, 'oemNumber', e.target.value)}
                        placeholder="90915-YZZD3"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-xs text-zinc-500 mb-1">Фирма</label>
                    <input
                        value={part.brand}
                        onChange={(e) => onChange(part.id, 'brand', e.target.value)}
                        placeholder="Mann, Motul, Bosch..."
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-xs text-zinc-500 mb-1">Название *</label>
                    <input
                        value={part.name}
                        onChange={(e) => onChange(part.id, 'name', e.target.value)}
                        required
                        placeholder="Масляный фильтр"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-xs text-zinc-500 mb-1">Количество</label>
                    <input
                        type="number"
                        min="1"
                        value={part.quantity}
                        onChange={(e) => onChange(part.id, 'quantity', e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>
        </div>
    );
}