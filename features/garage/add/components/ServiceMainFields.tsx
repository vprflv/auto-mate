'use client';

import {
    CalendarIcon,
} from 'lucide-react';

import {
    format,
    parse,
} from 'date-fns';

import {
    ru,
} from 'date-fns/locale';

import {
    Calendar,
} from '@/components/ui/calendar';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

type Props = {
    title: string;
    date: string;
    mileage: string;
    description: string;
    cost: string;

    onTitleChange: (v: string) => void;
    onDateChange: (v: string) => void;
    onMileageChange: (v: string) => void;
    onDescriptionChange: (v: string) => void;
    onCostChange: (v: string) => void;
};

const inputClass =
    'w-full rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)] px-5 py-3.5 text-[var(--text)] placeholder:text-[var(--text-dim)] transition-all duration-200 hover:border-[var(--border)]/60 focus:border-[var(--link)] focus:outline-none focus:ring-2 focus:ring-[var(--link)]/10';

const labelClass =
    'mb-2 block text-sm font-medium text-[var(--text-muted)]';

export default function ServiceMainFields({
                                              title,
                                              date,
                                              mileage,
                                              description,
                                              cost,
                                              onTitleChange,
                                              onDateChange,
                                              onMileageChange,
                                              onDescriptionChange,
                                              onCostChange,
                                          }: Props) {
    const handleMileageChange = (
        value: string
    ) => {
        const normalized = value.replace(
            /[^0-9]/g,
            ''
        );

        onMileageChange(normalized);
    };

    const handleCostChange = (
        value: string
    ) => {
        const normalized = value
            .replace(',', '.')
            .replace(/[^0-9.]/g, '')
            .replace(/(\..*)\./g, '$1');

        onCostChange(normalized);
    };

    const selectedDate = date
        ? parse(
            date,
            'yyyy-MM-dd',
            new Date()
        )
        : undefined;

    const formattedDate = selectedDate
        ? format(
            selectedDate,
            'd MMMM yyyy',
            {
                locale: ru,
            }
        )
        : 'Выберите дату';

    return (
        <div className="space-y-5 rounded-3xl border border-[var(--border)]/30 bg-[var(--card)] p-5 transition-colors duration-200 sm:p-6">
            <div>
                <label className={labelClass}>
                    Название работы
                </label>

                <input
                    value={title}
                    onChange={(e) =>
                        onTitleChange(
                            e.target.value
                        )
                    }
                    required
                    placeholder="Замена масла, колодки, диагностика..."
                    className={inputClass}
                />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label className={labelClass}>
                        Дата
                    </label>

                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className={`${inputClass} flex items-center justify-between text-left ${
                                    date
                                        ? 'text-[var(--text)]'
                                        : 'text-[var(--text-dim)]'
                                }`}
                            >
                                <span>
                                    {
                                        formattedDate
                                    }
                                </span>

                                <CalendarIcon
                                    size={18}
                                    className="shrink-0 text-[var(--text-muted)]"
                                />
                            </button>
                        </PopoverTrigger>

                        <PopoverContent
                            align="start"
                            className="border-[var(--border)]/40 bg-[var(--card)] p-3"
                        >
                            <Calendar
                                selected={
                                    selectedDate
                                }
                                onSelect={(
                                    selectedDate
                                ) => {
                                    if (
                                        !selectedDate
                                    ) {
                                        return;
                                    }

                                    onDateChange(
                                        format(
                                            selectedDate,
                                            'yyyy-MM-dd'
                                        )
                                    );
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div>
                    <label className={labelClass}>
                        Пробег (км)
                    </label>

                    <input
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        value={mileage}
                        onChange={(e) =>
                            handleMileageChange(
                                e.target.value
                            )
                        }
                        onKeyDown={(e) => {
                            if (
                                e.key === '-' ||
                                e.key === '+' ||
                                e.key.toLowerCase() ===
                                'e'
                            ) {
                                e.preventDefault();
                            }
                        }}
                        placeholder="125000"
                        className={inputClass}
                    />

                    <p className="mt-2 ml-2 cursor-default text-xs leading-relaxed text-[var(--text-muted)] underline decoration-dashed underline-offset-4 decoration-[var(--text-muted)]/40 transition-colors duration-200 hover:text-[var(--link)] hover:decoration-[var(--link)]/40">
                        Если это последнее ТО по дате,
                        указанный пробег обновит пробег
                        автомобиля.
                    </p>
                </div>
            </div>

            <div>
                <label className={labelClass}>
                    Комментарий
                </label>

                <textarea
                    value={description}
                    onChange={(e) =>
                        onDescriptionChange(
                            e.target.value
                        )
                    }
                    rows={3}
                    placeholder="Что ещё важно помнить..."
                    className={`${inputClass} resize-none`}
                />
            </div>

            <div>
                <label className={labelClass}>
                    Стоимость (₽)
                </label>

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={cost}
                    onChange={(e) =>
                        handleCostChange(
                            e.target.value
                        )
                    }
                    onKeyDown={(e) => {
                        if (
                            e.key === '-' ||
                            e.key === '+' ||
                            e.key.toLowerCase() ===
                            'e'
                        ) {
                            e.preventDefault();
                        }
                    }}
                    placeholder="4500"
                    className={inputClass}
                />
            </div>
        </div>
    );
}