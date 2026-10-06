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
    'w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-dim)] transition-colors focus:border-[var(--link)] focus:outline-none focus:ring-2 focus:ring-[var(--link)]/10';

export default function ManualCarForm({
                                          form,
                                          error,
                                          onChange,
                                          onSubmit,
                                          onCancel,
                                          fromDecode,
                                      }: Props) {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {fromDecode ? (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm leading-relaxed text-[var(--text-muted)]">
                    Данные из VIN уже подставлены. Можно поправить и дополнить перед сохранением.
                </div>
            ) : (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm leading-relaxed text-[var(--text-muted)]">
                    VIN не найден в базе. Заполни данные вручную — VIN уже подставлен.
                </div>
            )}

            <div className="space-y-5 rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
                <h2 className="text-lg font-semibold text-[var(--text)]">
                    Основное
                </h2>

                <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                        VIN
                    </label>
                    <input
                        value={form.vin}
                        onChange={(e) =>
                            onChange('vin', e.target.value.toUpperCase())
                        }
                        maxLength={17}
                        className={`${inputClass} font-mono tracking-wide`}
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                            Марка *
                        </label>
                        <input
                            value={form.make}
                            onChange={(e) => onChange('make', e.target.value)}
                            required
                            placeholder="Geely, Haval, Chery..."
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                            Модель *
                        </label>
                        <input
                            value={form.model}
                            onChange={(e) => onChange('model', e.target.value)}
                            required
                            placeholder="Coolray, Jolion..."
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                            Год *
                        </label>
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
                        <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                            Цвет
                        </label>
                        <input
                            value={form.color}
                            onChange={(e) => onChange('color', e.target.value)}
                            placeholder="Белый"
                            className={inputClass}
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                            Прозвище
                        </label>
                        <input
                            value={form.nickname}
                            onChange={(e) =>
                                onChange('nickname', e.target.value)
                            }
                            placeholder="Мой хавал"
                            className={inputClass}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-5 rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
                <h2 className="text-lg font-semibold text-[var(--text)]">
                    Характеристики
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                            Кузов
                        </label>
                        <input
                            value={form.bodyClass}
                            onChange={(e) =>
                                onChange('bodyClass', e.target.value)
                            }
                            placeholder="SUV, седан..."
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                            Объём двигателя (л)
                        </label>
                        <input
                            value={form.displacementL}
                            onChange={(e) =>
                                onChange('displacementL', e.target.value)
                            }
                            placeholder="1.5"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                            Топливо
                        </label>
                        <input
                            value={form.fuel}
                            onChange={(e) =>
                                onChange('fuel', e.target.value)
                            }
                            placeholder="Бензин"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                            КПП
                        </label>
                        <input
                            value={form.transmission}
                            onChange={(e) =>
                                onChange('transmission', e.target.value)
                            }
                            placeholder="Автомат / механика"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                            Привод
                        </label>
                        <input
                            value={form.driveType}
                            onChange={(e) =>
                                onChange('driveType', e.target.value)
                            }
                            placeholder="Передний / полный"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                            Двигатель
                        </label>
                        <input
                            value={form.engine}
                            onChange={(e) =>
                                onChange('engine', e.target.value)
                            }
                            className={inputClass}
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3">
                    <p className="text-sm text-[var(--danger)]">
                        {error}
                    </p>
                </div>
            )}

            <div className="flex gap-4">
                <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-[var(--btn-primary)] py-4 font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)]"
                >
                    Сохранить в гараж
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] py-4 font-medium text-[var(--text)] transition-colors hover:border-[var(--text-muted)] hover:bg-[var(--border)]"
                >
                    Отмена
                </button>
            </div>
        </form>
    );
}