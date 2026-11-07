import type {
    CatalogModification,
} from '@/features/admin/lib/system-store/types';

import type {
    PartInstallation,
    PartInstallationMap,
} from '@/types/partInstallation';

import {
    PartInstallationFields,
} from '@/features/garage/components/PartInstallationFields';

import {
    PartInstallationBadge,
} from '@/features/garage/components/PartInstallationBadge';

type Props = {
    modifications: CatalogModification[];
    partName?: string;
    value: PartInstallationMap;
    proposed?: PartInstallation;
    onChange: (value: PartInstallationMap) => void;
};

export function PartInstallationsBlock({
                                           partName = '',
                                           modifications,
                                           value,
                                           proposed,
                                           onChange,
                                       }: Props) {
    const hasProposal = Boolean(
        proposed?.axle || proposed?.side
    );

    return (
        <section className="mt-4 space-y-4 rounded-2xl border border-[var(--border)] p-4">
            <h3 className="text-sm font-semibold text-[var(--text)]">
                Расположение по модификациям
            </h3>

            {hasProposal && (
                <div className="text-xs text-[var(--text-muted)]">
                    Предложение пользователя:
                    <PartInstallationBadge value={proposed!} />
                </div>
            )}

            {!modifications.length && (
                <p className="text-xs text-[var(--text-muted)]">
                    Выберите модификации для подтверждения
                    расположения.
                </p>
            )}

            {modifications.map(modification => {
                const positions = value[modification.id] ?? [];

                const changePositions = (
                    next: PartInstallation[]
                ) => {
                    onChange({
                        ...value,
                        [modification.id]: next,
                    });
                };

                return (
                    <div
                        key={modification.id}
                        className="space-y-3 border-t border-[var(--border)] pt-3"
                    >
                        <p className="text-sm font-medium text-[var(--text)]">
                            {modification.name}
                        </p>

                        {positions.map((position, index) => (
                            <div key={index} className="space-y-2">
                                <PartInstallationFields
                                    partName={partName}
                                    value={position}
                                    onChange={patch =>
                                        changePositions(
                                            positions.map(
                                                (item, itemIndex) =>
                                                    itemIndex === index
                                                        ? { ...item, ...patch }
                                                        : item
                                            )
                                        )
                                    }
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        changePositions(
                                            positions.filter(
                                                (_, itemIndex) =>
                                                    itemIndex !== index
                                            )
                                        )
                                    }
                                    className="text-xs text-[var(--danger)]"
                                >
                                    Убрать расположение
                                </button>
                            </div>
                        ))}

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    changePositions([
                                        ...positions,
                                        {},
                                    ])
                                }
                                className="text-xs text-[var(--link)]"
                            >
                                + Добавить расположение
                            </button>

                            {hasProposal && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        changePositions([
                                            ...positions,
                                            { ...proposed },
                                        ])
                                    }
                                    className="text-xs text-[var(--link)]"
                                >
                                    + Принять предложение пользователя
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </section>
    );
}