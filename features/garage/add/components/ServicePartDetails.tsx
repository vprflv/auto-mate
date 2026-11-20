
import { Tooltip } from 'radix-ui';
import { CircleHelp } from 'lucide-react';
import { PartForm } from '@/features/garage/add/types/serviceForm';
import { formatFluidVolume } from '@/features/garage/add/lib/formatFluidVolume';
import {PartInstallationFields} from "@/features/garage/components/PartInstallationFields";

type Props = {
    part: PartForm;
    recommendedFillCapacity?: string;
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
    recommendedFillCapacity,
    onChange,
}: Props) {
    const formatVolumeField = (field: 'volume' | 'fillCapacity', value: string) => {
        const formatted = formatFluidVolume(value);
        if (formatted !== value) onChange(part.id, field, formatted);
    };

    return (
        <div className="border-t border-[var(--border)]/20 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className={labelClass}>
                        Артикул
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
                        placeholder="Например, W 610/6"
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

                {part.itemType === 'fluid' && (
                    <label className="block">
                        <span className={labelClass}>Спецификация</span>
                        <input
                            value={part.spec ?? ''}
                            onChange={event => onChange(part.id, 'spec', event.target.value)}
                            placeholder="Например, SAE 5W-30 или DOT 4"
                            className={fieldClass}
                        />
                    </label>
                )}

                {part.itemType === 'fluid' && (
                    <label className="block">
                        <span className={labelClass}>Объём</span>
                        <input
                            value={part.volume ?? ''}
                            onChange={event => onChange(part.id, 'volume', event.target.value)}
                            onBlur={event => formatVolumeField('volume', event.target.value)}
                            placeholder="Например, 4,2 л"
                            className={fieldClass}
                        />
                    </label>
                )}

                {part.itemType === 'fluid' && (
                    <div>
                        <label className="block">
                            <span className={labelClass}>Заправочный объём</span>
                            <input
                                value={part.fillCapacity ?? ''}
                                onChange={event => onChange(part.id, 'fillCapacity', event.target.value)}
                                onBlur={event => formatVolumeField('fillCapacity', event.target.value)}
                                placeholder="Например, 5 л"
                                className={fieldClass}
                            />
                        </label>

                        {recommendedFillCapacity && (
                            <Tooltip.Provider delayDuration={250}>
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <button
                                            type="button"
                                            className="mt-2 inline-flex items-start gap-1.5 rounded text-left text-xs text-[var(--link)] focus-visible:outline focus-visible:outline-2"
                                        >
                                            <span>Рекомендуемый заправочный объём: {recommendedFillCapacity}</span>
                                            <CircleHelp size={14} className="shrink-0" aria-hidden="true" />
                                        </button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content
                                            sideOffset={6}
                                            className="z-[260] max-w-64 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs leading-relaxed text-[var(--text)] shadow-lg"
                                        >
                                            Средний заправочный объём по вашим прошлым ТО для этой жидкости и автомобиля.
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                            </Tooltip.Provider>
                        )}
                    </div>
                )}

                {part.itemType === 'part' && (
                    <div className="mt-4">
                        <PartInstallationFields
                            partName={part.name}
                            value={{
                                axle: part.axle || undefined,
                                side: part.side || undefined,
                            }}
                            onChange={patch => {
                                if ('axle' in patch) {
                                    onChange(
                                        part.id,
                                        'axle',
                                        patch.axle ?? ''
                                    );
                                }

                                if ('side' in patch) {
                                    onChange(
                                        part.id,
                                        'side',
                                        patch.side ?? ''
                                    );
                                }
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

