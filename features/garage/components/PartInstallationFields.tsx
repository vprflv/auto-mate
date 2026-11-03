'use client';

import { useId } from 'react';

import type {
    PartAxle,
    PartSide,
    PartInstallation,
} from '@/types/partInstallation';

import {
    PART_AXLE_LABELS,
    PART_SIDE_LABELS,
} from '@/types/partInstallation';

type Props = {
    value: PartInstallation;
    onChange: (patch: PartInstallation) => void;
};

const inputClassName =
    'w-full rounded-xl border border-[var(--border)] ' +
    'bg-[var(--bg-elevated)] px-3 py-2.5 text-sm ' +
    'text-[var(--text)] outline-none focus:border-[var(--link)]';

export function PartInstallationFields({
                                           value,
                                           onChange,
                                       }: Props) {
    const id = useId();

    return (
        <details
            key={Boolean(value.axle || value.side) ? 'filled' : 'empty'}
            open={Boolean(value.axle || value.side) || undefined}
            className="rounded-xl border border-[var(--border)] p-3"
        >
            <summary className="cursor-pointer text-sm text-[var(--text-muted)]">
                Расположение · необязательно
            </summary>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                    <label
                        htmlFor={`${id}-axle`}
                        className="mb-1.5 block text-xs text-[var(--text-muted)]"
                    >
                        Ось
                    </label>

                    <select
                        id={`${id}-axle`}
                        value={value.axle ?? ''}
                        onChange={event =>
                            onChange({
                                axle: event.target.value
                                    ? event.target.value as PartAxle
                                    : undefined,
                            })
                        }
                        className={inputClassName}
                    >
                        <option value="">Не указано</option>

                        {Object.entries(PART_AXLE_LABELS).map(
                            ([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            )
                        )}
                    </select>
                </div>

                <div>
                    <label
                        htmlFor={`${id}-side`}
                        className="mb-1.5 block text-xs text-[var(--text-muted)]"
                    >
                        Сторона
                    </label>

                    <select
                        id={`${id}-side`}
                        value={value.side ?? ''}
                        onChange={event =>
                            onChange({
                                side: event.target.value
                                    ? event.target.value as PartSide
                                    : undefined,
                            })
                        }
                        className={inputClassName}
                    >
                        <option value="">Не указано</option>

                        {Object.entries(PART_SIDE_LABELS).map(
                            ([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            )
                        )}
                    </select>
                </div>
            </div>

            <p className="mt-3 text-xs text-[var(--text-muted)]">
                Сторона определяется по ходу движения автомобиля.
            </p>
        </details>
    );
}