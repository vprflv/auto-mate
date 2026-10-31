'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { storage } from '@/features/admin/lib/system-store/storage';
import {
    getOemCrosses,
    uniqueOemCrosses
} from '@/features/admin/lib/system-store/oemCrosses';
import { normalizeArticle } from '@/features/admin/lib/system-store/normalizeArticle';
import type { StoredPartItem } from '@/features/admin/lib/system-store/types';

import { collectOemSuggestions } from '../lib/collectOemSuggestions';

interface Props {
    part: StoredPartItem;
    nodeId: string;
}

export function useOemCrossEditor({ part, nodeId }: Props) {
    const original = getOemCrosses(part);

    const [rows, setRows] = React.useState<string[]>(
        original.length ? original : ['']
    );

    const [error, setError] = React.useState('');

    const numbers = uniqueOemCrosses(rows);

    const dirty =
        JSON.stringify(numbers) !== JSON.stringify(original);

    const suggestions = React.useMemo(
        () =>
            collectOemSuggestions(
                part,
                nodeId,
                storage.getState().catalogNodes
            ),
        [part, nodeId]
    );

    const addRow = () => {
        setRows(current => [...current, '']);
        setError('');
    };

    const updateRow = (index: number, value: string) => {
        setRows(current =>
            current.map((row, position) =>
                position === index ? value : row
            )
        );

        setError('');
    };

    const getRowData = (index: number) => {
        const otherRows = rows.filter(
            (_, position) => position !== index
        );

        const selectedElsewhere = new Set(
            otherRows.map(normalizeArticle).filter(Boolean)
        );

        return {
            suggestions: suggestions.filter(
                item =>
                    !selectedElsewhere.has(
                        normalizeArticle(item.article)
                    )
            ),

            isLastOem:
                !part.isOem &&
                Boolean(normalizeArticle(rows[index])) &&
                uniqueOemCrosses(otherRows).length === 0
        };
    };

    const removeRow = (index: number): boolean => {
        if (getRowData(index).isLastOem) {
            setError(
                'У аналога должен оставаться хотя бы один OEM-номер.'
            );
            return false;
        }

        const remaining = rows.filter(
            (_, position) => position !== index
        );

        setRows(remaining.length ? remaining : ['']);
        setError('');

        return true;
    };

    const cancel = () => {
        setRows(original.length ? original : ['']);
        setError('');
    };

    const save = () => {
        if (!part.isOem && numbers.length === 0) {
            setError(
                'Укажите хотя бы один OEM-номер для аналога.'
            );
            return;
        }

        const containsOwnArticle =
            part.isOem &&
            numbers.some(
                value =>
                    normalizeArticle(value) ===
                    normalizeArticle(part.article)
            );

        if (containsOwnArticle) {
            setError(
                'Собственный артикул уже учитывается. Укажите другие OEM-номера.'
            );
            return;
        }

        try {
            const saved = storage.updatePartOemCrosses(
                nodeId,
                part.id,
                numbers
            );

            if (!saved) {
                setError(
                    'Деталь не найдена. Закройте карточку и откройте её снова.'
                );
                return;
            }
        } catch (error: unknown) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Не удалось сохранить OEM-номера.'
            );
            return;
        }

        setError('');
        toast.success('OEM-номера сохранены');
    };

    return {
        rows,
        error,
        dirty,
        addRow,
        updateRow,
        getRowData,
        removeRow,
        cancel,
        save
    };
}