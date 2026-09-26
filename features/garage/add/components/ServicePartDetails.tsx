
import { PartForm } from '@/features/garage/add/types/serviceForm';

type Props = {
    part: PartForm;
    onChange: (
        id: string,
        field: keyof PartForm,
        value: string
    ) => void;
};

const fieldClass =
    'w-full rounded-xl border border-[var(--border)]/40 bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-dim)] transition-all duration-200 hover:border-[var(--border)]/60 focus:border-[var(--link)] focus:outline-none focus:ring-2 focus:ring-[var(--link)]/10';

const labelClass =
    'mb-1.5 block text-xs font-medium text-[var(--text-muted)]';

export default function ServicePartDetails({
    part,
    onChange,
}: Props) {
    return (
        <div className="border-t border-[var(--border)]/20 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className={labelClass}>
                        Ориг. номер
                    </label>

                    <input
                        value={part.oemNumber}
                        onChange={(e) =>
                            onChange(
                                part.id,
                                'oemNumber',
                                e.target.value
                            )
                        }
                        placeholder="90915-YZZD3"
                        className={fieldClass}
                    />
                </div>

                <div>
                    <label className={labelClass}>
                        Фирма
                    </label>

                    <input
                        value={part.brand}
                        onChange={(e) =>
                            onChange(
                                part.id,
                                'brand',
                                e.target.value
                            )
                        }
                        placeholder="Mann, Motul, Bosch..."
                        className={fieldClass}
                    />
                </div>

                <div>
                    <label className={labelClass}>
                        Название *
                    </label>

                    <input
                        value={part.name}
                        onChange={(e) =>
                            onChange(
                                part.id,
                                'name',
                                e.target.value
                            )
                        }
                        required
                        placeholder="Масляный фильтр"
                        className={fieldClass}
                    />
                </div>

                <div>
                    <label className={labelClass}>
                        Количество
                    </label>

                    <input
                        type="text"
                        inputMode="numeric"
                        minLength={1}
                        value={part.quantity}
                        onChange={(e) => {
                            const normalized = e.target.value.replace(/\D/g, '');

                            onChange(
                                part.id,
                                'quantity',
                                normalized
                            );
                        }}
                        onKeyDown={(e) => {
                            if (
                                e.key === '-' ||
                                e.key === '+' ||
                                e.key.toLowerCase() === 'e'
                            ) {
                                e.preventDefault();
                            }
                        }}
                        className={fieldClass}
                    />
                </div>
            </div>
        </div>
    );
}

