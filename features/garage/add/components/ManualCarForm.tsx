import type { ManualCarForm as ManualCarFormValues } from '@/types';

type Props = {
    form: ManualCarFormValues;
    error: string;
    fromDecode?: boolean;
    onChange: (field: keyof ManualCarFormValues, value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
};

const inputClass =
    'w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-[#F5F5F5] placeholder:text-[#666666] focus:outline-none focus:border-[#39FF14] transition';

export default function ManualCarForm({
                                          form,
                                          error,
                                          onChange,
                                          onSubmit,
                                          onCancel,
                                          fromDecode
                                      }: Props) {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {fromDecode ? (
                <div className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-4 text-sm text-[#A3A3A3]">
                    Данные из VIN уже подставлены. Можно поправить и дополнить перед сохранением.
                </div>
            ) : (
                <div className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-4 text-sm text-[#A3A3A3]">
                    VIN не найден в базе. Заполни данные вручную — VIN уже подставлен.
                </div>
            )}

            <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6 space-y-5">
                <h2 className="text-lg font-semibold text-[#F5F5F5]">Основное</h2>

                <div>
                    <label className="block text-sm text-[#39FF14] mb-2">VIN</label>
                    <input
                        value={form.vin}
                        onChange={(e) => onChange('vin', e.target.value.toUpperCase())}
                        maxLength={17}
                        className={`${inputClass} font-mono tracking-wide`}
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm text-[#39FF14] mb-2">Марка *</label>
                        <input
                            value={form.make}
                            onChange={(e) => onChange('make', e.target.value)}
                            required
                            placeholder="Geely, Haval, Chery..."
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[#39FF14] mb-2">Модель *</label>
                        <input
                            value={form.model}
                            onChange={(e) => onChange('model', e.target.value)}
                            required
                            placeholder="Coolray, Jolion..."
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[#39FF14] mb-2">Год *</label>
                        <input
                            type="number"
                            value={form.year}
                            onChange={(e) => onChange('year', e.target.value)}
                            required
                            placeholder="2023"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[#39FF14] mb-2">Цвет</label>
                        <input
                            value={form.color}
                            onChange={(e) => onChange('color', e.target.value)}
                            placeholder="Белый"
                            className={inputClass}
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm text-[#39FF14] mb-2">Прозвище</label>
                        <input
                            value={form.nickname}
                            onChange={(e) => onChange('nickname', e.target.value)}
                            placeholder="Мой хавал"
                            className={inputClass}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6 space-y-5">
                <h2 className="text-lg font-semibold text-[#F5F5F5]">Характеристики</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm text-[#39FF14] mb-2">Кузов</label>
                        <input
                            value={form.bodyClass}
                            onChange={(e) => onChange('bodyClass', e.target.value)}
                            placeholder="SUV, седан..."
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[#39FF14] mb-2">Объём двигателя (л)</label>
                        <input
                            value={form.displacementL}
                            onChange={(e) => onChange('displacementL', e.target.value)}
                            placeholder="1.5"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[#39FF14] mb-2">Топливо</label>
                        <input
                            value={form.fuel}
                            onChange={(e) => onChange('fuel', e.target.value)}
                            placeholder="Бензин"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[#39FF14] mb-2">КПП</label>
                        <input
                            value={form.transmission}
                            onChange={(e) => onChange('transmission', e.target.value)}
                            placeholder="Автомат / механика"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[#39FF14] mb-2">Привод</label>
                        <input
                            value={form.driveType}
                            onChange={(e) => onChange('driveType', e.target.value)}
                            placeholder="Передний / полный"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[#39FF14] mb-2">Двигатель</label>
                        <input
                            value={form.engine}
                            onChange={(e) => onChange('engine', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-4">
                <button
                    type="submit"
                    className="flex-1 bg-[#39FF14] hover:bg-[#57FF3A] text-black font-medium py-4 rounded-2xl transition"
                >
                    Сохранить в гараж
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-[#F5F5F5] py-4 rounded-2xl font-medium transition"
                >
                    Отмена
                </button>
            </div>
        </form>
    );
}