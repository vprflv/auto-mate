'use client';

import { useState, type FormEvent } from 'react';

import { updateCommonPartInstallation } from '@/features/admin/lib/system-store/actions/updatePartInstallation';
import type {
    StoredCatalogNode,
    StoredPartItem,
} from '@/features/admin/lib/system-store/types';
import {
    installationKey,
    uniqueInstallations,
} from '@/features/catalog/lib/partInstallations';
import { PartInstallationBadge } from '@/features/garage/components/PartInstallationBadge';
import { PartInstallationFields } from '@/features/garage/components/PartInstallationFields';
import type { PartInstallation } from '@/types/partInstallation';

interface Props {
    part: StoredPartItem;
    node: StoredCatalogNode;
    onClose: () => void;
}

export function EditPartInstallationForm({ part, node, onClose }: Props) {
    const legacyPositions = uniqueInstallations(
        Object.values(part.installationsByModification ?? {}).flat()
    );

    const [position, setPosition] = useState<PartInstallation>(
        part.installation ??
        (legacyPositions.length === 1 ? legacyPositions[0] : {})
    );
    const [error, setError] = useState('');

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');

        if (legacyPositions.length > 0) {
            const message = position.axle || position.side
                ? 'Заменить сохранённые положения по модификациям одним общим расположением?'
                : 'Очистить расположение для всех модификаций этой детали?';

            if (!window.confirm(message)) return;
        }

        try {
            updateCommonPartInstallation({
                nodeId: node.id,
                partId: part.id,
                position,
            });
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Не удалось сохранить расположение.'
            );
            return;
        }

        onClose();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <h3 className="text-sm font-semibold">Расположение детали</h3>

            {legacyPositions.length > 1 && (
                <div className="space-y-2 rounded-xl bg-amber-500/10 p-3">
                    <p className="text-sm">
                        Сейчас у детали сохранены разные положения.
                        Выберите одно общее для всех подходящих модификаций.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {legacyPositions.map(value => (
                            <PartInstallationBadge
                                key={installationKey(value)}
                                value={value}
                            />
                        ))}
                    </div>
                </div>
            )}

            <PartInstallationFields
                partName={part.name}
                value={position}
                onChange={patch => {
                    setPosition(previous => ({ ...previous, ...patch }));
                    setError('');
                }}
            />

            {error && (
                <p role="alert" className="text-sm text-[var(--danger)]">
                    {error}
                </p>
            )}

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm"
                >
                    Отмена
                </button>
                <button
                    type="submit"
                    className="rounded-xl bg-[var(--btn-primary)] px-4 py-2 text-sm font-semibold text-[var(--btn-primary-text)]"
                >
                    Сохранить расположение
                </button>
            </div>
        </form>
    );
}