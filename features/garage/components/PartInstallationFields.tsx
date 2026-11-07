'use client';

import { useId, useState } from 'react';

import type {
    PartAxle,
    PartInstallation,
    PartSide,
} from '@/types/partInstallation';

import {
    getPartInstallationFields,
    PART_AXLE_LABELS,
    PART_SIDE_LABELS,
} from '@/types/partInstallation';

type Props = {
    partName: string;
    value: PartInstallation;
    onChange: (patch: PartInstallation) => void;
};

const inputClassName =
    'w-full rounded-xl border border-[var(--border)] ' +
    'bg-[var(--bg-elevated)] px-3 py-2.5 text-sm ' +
    'text-[var(--text)] outline-none focus:border-[var(--link)]';

export function PartInstallationFields({
                                           partName,
                                           value,
                                           onChange,
                                       }: Props) {
    const id = useId();

    const [manualEnabled, setManualEnabled] =
        useState<boolean | null>(null);

    const suggested = getPartInstallationFields(partName);
    const hasSuggestion = suggested.axle || suggested.side;
    const hasValue = Boolean(value.axle || value.side);
    const enabled = manualEnabled ?? (hasValue || hasSuggestion);

    const showAxle =
        !hasSuggestion || suggested.axle || Boolean(value.axle);

    const showSide =
        !hasSuggestion || suggested.side || Boolean(value.side);

    return (
        <div className="rounded-xl border border-[var(--border)] p-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text)]">
                <input
                    type="checkbox"
                    checked={enabled}
                    onChange={event => {
                        const checked = event.target.checked;
                        setManualEnabled(checked);

                        if (!checked) {
                            onChange({
                                axle: undefined,
                                side: undefined,
                            });
                        }
                    }}
                    className="h-4 w-4 accent-[var(--btn-primary)]"
                />

                Указать расположение
            </label>

            {enabled && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {showAxle && (
                        <div>
                            <label
                                htmlFor={`${id}-axle`}
                                className="mb-1.5 block text-xs text-[var(--text-muted)]"
                            >
                                Ось / перед–зад
                            </label>

                            <select
                                id={`${id}-axle`}
                                value={value.axle ?? ''}
                                onChange={event => {
                                    const axle = event.target.value as
                                        | PartAxle
                                        | '';

                                    onChange({ axle: axle || undefined });
                                }}
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
                    )}

                    {showSide && (
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
                                onChange={event => {
                                    const side = event.target.value as
                                        | PartSide
                                        | '';

                                    onChange({ side: side || undefined });
                                }}
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
                    )}
                </div>
            )}
        </div>
    );
}