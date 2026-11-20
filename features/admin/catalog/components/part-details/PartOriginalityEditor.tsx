'use client';

import { useState, type FormEvent } from 'react';
import { setCatalogPartOriginality } from '@/features/admin/lib/system-store/actions/setCatalogPartOriginality';
import { normalizeArticle } from '@/features/admin/lib/system-store/normalizeArticle';
import { getOemCrosses } from '@/features/admin/lib/system-store/oemCrosses';
import type { StoredPartItem } from '@/features/admin/lib/system-store/types';

export function PartOriginalityEditor({ nodeId, part }: {
    nodeId: string;
    part: StoredPartItem;
}) {
    const [linkedOem, setLinkedOem] = useState('');
    const [error, setError] = useState('');
    const needsOem = part.isOem && !getOemCrosses(part).some(
        number => normalizeArticle(number) !== normalizeArticle(part.article)
    );

    function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        try {
            setCatalogPartOriginality(nodeId, part.id, !part.isOem, linkedOem);
            setLinkedOem('');
            setError('');
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'Не удалось изменить тип запчасти.');
        }
    }

    return (
        <form onSubmit={save} className="space-y-2 text-sm">
            <p>Тип запчасти: <strong>{part.isOem ? 'Оригинал (OEM)' : 'Аналог'}</strong></p>
            {needsOem && (
                <label className="block space-y-1">
                    <span>OEM-номер для смены типа на аналог</span>
                    <input
                        value={linkedOem}
                        onChange={event => setLinkedOem(event.target.value)}
                        required
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2"
                    />
                </label>
            )}
            {error && <p role="alert" className="text-[var(--danger)]">{error}</p>}
            <button type="submit" className="font-semibold text-[var(--link)] hover:underline">
                {part.isOem ? 'Отметить как аналог' : 'Отметить как оригинал'}
            </button>
        </form>
    );
}
