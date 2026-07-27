import { ManualCarForm as ManualCarFormType } from '@/features/garage/add/hooks/useAddCar';

type Props = {
    form: ManualCarFormType;
    error: string;
    onChange: (field: keyof ManualCarFormType, value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
};

export default function ManualCarForm({
                                          form,
                                          error,
                                          onChange,
                                          onSubmit,
                                          onCancel,
                                      }: Props) {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-sm text-amber-200">
                VIN не найден в базе. Заполни данные вручную — VIN уже подставлен.
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-5">
                <h2 className="text-lg font-semibold">Основное</h2>

                <div>
                    <label className="block text-sm text-zinc-400 mb-2">VIN</label>
                    <input
                        value={form.vin}
                        onChange={(e) => onChange('vin', e.target.value.toUpperCase())}
                        maxLength={17}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 font-mono tracking-wide focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">Марка *</label>
                        <input
                            value={form.make}
                            onChange={(e) => onChange('make', e.target.value)}
                            required
                            placeholder="Geely, Haval, Chery..."
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">Модель *</label>
                        <input
                            value={form.model}
                            onChange={(e) => onChange('model', e.target.value)}
                            required
                            placeholder="Coolray, Jolion..."
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">Год *</label>
                        <input
                            type="number"
                            value={form.year}
                            onChange={(e) => onChange('year', e.target.value)}
                            required
                            placeholder="2023"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">Цвет</label>
                        <input
                            value={form.color}
                            onChange={(e) => onChange('color', e.target.value)}
                            placeholder="Белый"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm text-zinc-400 mb-2">Прозвище</label>
                        <input
                            value={form.nickname}
                            onChange={(e) => onChange('nickname', e.target.value)}
                            placeholder="Мой хавал"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-5">
                <h2 className="text-lg font-semibold">Характеристики</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">Кузов</label>
                        <input
                            value={form.bodyClass}
                            onChange={(e) => onChange('bodyClass', e.target.value)}
                            placeholder="SUV, седан..."
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">Объём двигателя (л)</label>
                        <input
                            value={form.displacementL}
                            onChange={(e) => onChange('displacementL', e.target.value)}
                            placeholder="1.5"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">Топливо</label>
                        <input
                            value={form.fuel}
                            onChange={(e) => onChange('fuel', e.target.value)}
                            placeholder="Бензин"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">КПП</label>
                        <input
                            value={form.transmission}
                            onChange={(e) => onChange('transmission', e.target.value)}
                            placeholder="Автомат / механика"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">Привод</label>
                        <input
                            value={form.driveType}
                            onChange={(e) => onChange('driveType', e.target.value)}
                            placeholder="Передний / полный"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">Двигатель</label>
                        <input
                            value={form.engine}
                            onChange={(e) => onChange('engine', e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-4">
                <button
                    type="submit"
                    className="flex-1 bg-white text-black font-medium py-4 rounded-2xl hover:bg-zinc-200 transition"
                >
                    Сохранить в гараж
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-4 rounded-2xl font-medium transition"
                >
                    Отмена
                </button>
            </div>
        </form>
    );
}