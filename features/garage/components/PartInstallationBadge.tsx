import type { PartInstallation } from '@/types/partInstallation';

import {
    PART_AXLE_LABELS,
    PART_SIDE_LABELS,
} from '@/types/partInstallation';

type Props = {
    value: PartInstallation;
};

export function PartInstallationBadge({ value }: Props) {
    const labels = [
        value.axle ? PART_AXLE_LABELS[value.axle] : '',
        value.side ? PART_SIDE_LABELS[value.side] : '',
    ].filter(Boolean);

    if (!labels.length) return null;

    return (
        <span className="mt-1 flex flex-wrap gap-1.5">
            {labels.map(label => (
                <span
                    key={label}
                    className="rounded-md bg-[var(--bg-elevated)] px-2 py-1 text-[11px] font-normal text-[var(--text-muted)]"
                >
                    {label}
                </span>
            ))}
        </span>
    );
}