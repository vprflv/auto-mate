'use client';

import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { storage } from '@/features/admin/lib/system-store/storage';
import {
    getOemCrosses,
    uniqueOemCrosses
} from '@/features/admin/lib/system-store/oemCrosses';
import { normalizeArticle } from '@/features/admin/lib/system-store/normalizeArticle';
import type { StoredPartItem } from '@/features/admin/lib/system-store/types';

import {
    OemCrossSelect,
    type OemSuggestion
} from '@/features/admin/catalog-inbox/components/part-moderation/OemCrossSelect';

interface Props {
    part: StoredPartItem;
    nodeId: string;
}

export function OemCrossEditor({ part, nodeId }: Props) {
    const original = getOemCrosses(part);

    const [rows, setRows] = React.useState<string[]>(
        original.length ? original : ['']
    );
    const [error, setError] = React.useState('');

    const numbers = uniqueOemCrosses(rows);

    const dirty =
        JSON.stringify(numbers) !== JSON.stringify(original);

    // Собираем номера из всех разделов и моделей каталога.
    const suggestions = React.useMemo<OemSuggestion[]>(() => {
        const state = storage.getState();
        const result = new Map<string, OemSuggestion>();

        const ownArticle = part.isOem
            ? normalizeArticle(part.article)
            : '';

        const addSuggestion = (suggestion: OemSuggestion) => {
            const key = normalizeArticle(suggestion.article);

            if (!key || key === ownArticle) return;

            const existing = result.get(key);

            const replace =
                !existing ||
                (
                    existing.source === 'cross' &&
                    suggestion.source === 'catalog'
                ) ||
                (
                    existing.source === suggestion.source &&
                    !existing.sameNode &&
                    suggestion.sameNode
                );

            if (replace) {
                result.set(key, suggestion);
            }
        };

        for (const node of state.catalogNodes) {
            const sameNode = node.id === nodeId;

            for (const item of node.items) {
                // Номера, которые уже использовались в связях.
                for (const article of getOemCrosses(item)) {
                    addSuggestion({
                        id: `cross:${normalizeArticle(article)}`,
                        article,
                        brand: '',
                        name: '',
                        nodeTitle: node.title,
                        sameNode,
                        source: 'cross'
                    });
                }

                // Оригинальные детали из каталога.
                if (item.isOem && item.article.trim()) {
                    addSuggestion({
                        id: `catalog:${normalizeArticle(item.article)}`,
                        article: item.article,
                        brand: item.brand,
                        name: item.name,
                        nodeTitle: node.title,
                        sameNode,
                        source: 'catalog'
                    });
                }
            }
        }

        return Array.from(result.values());
    }, [part, nodeId]);

    const updateRow = (index: number, value: string) => {
        setRows(current =>
            current.map((row, position) =>
                position === index ? value : row
            )
        );
        setError('');
    };

    const removeRow = (index: number) => {
        setRows(current =>
            current.length === 1
                ? ['']
                : current.filter((_, position) => position !== index)
        );
        setError('');
    };

    const cancel = () => {
        setRows(original.length ? original : ['']);
        setError('');
    };

    const save = () => {
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

            setError('');
            toast.success('OEM-номера сохранены');
        } catch {
            setError(
                'Не удалось сохранить изменения. Попробуйте ещё раз.'
            );
        }
    };

    return (
        <section className="space-y-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
            <h3 className="text-sm font-bold text-[var(--text)]">
                Связанные OEM-номера
            </h3>

            <p className="text-xs text-[var(--text-muted)]">
                Начните вводить номер и выберите подсказку
                или укажите его вручную.
                Каждый OEM-номер — в отдельной строке.
            </p>

            {rows.map((value, index) => {
                // Не предлагаем номера, выбранные в других строках.
                const selectedElsewhere = new Set(
                    rows
                        .filter((_, position) => position !== index)
                        .map(normalizeArticle)
                        .filter(Boolean)
                );

                const rowSuggestions = suggestions.filter(
                    item =>
                        !selectedElsewhere.has(
                            normalizeArticle(item.article)
                        )
                );

                return (
                    <div
                        key={index}
                        className="flex items-start gap-2"
                    >
                        <OemCrossSelect
                            compact
                            label={`OEM-номер ${index + 1}`}
                            value={value}
                            onChange={nextValue =>
                                updateRow(index, nextValue)
                            }
                            suggestions={rowSuggestions}
                        />

                        <button
                            type="button"
                            aria-label={`Удалить OEM-номер ${index + 1}`}
                            onClick={() => removeRow(index)}
                            className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-red-500/10 hover:text-red-500"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                );
            })}

            {error && (
                <p role="alert" className="text-xs text-red-500">
                    {error}
                </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                    type="button"
                    onClick={() =>
                        setRows(current => [...current, ''])
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-blue-500 transition hover:bg-blue-500/10"
                >
                    <Plus className="h-4 w-4" />
                    Добавить номер
                </button>

                <div className="flex gap-2">
                    {dirty && (
                        <button
                            type="button"
                            onClick={cancel}
                            className="rounded-lg px-3 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                        >
                            Отменить
                        </button>
                    )}

                    <button
                        type="button"
                        disabled={!dirty}
                        onClick={save}
                        className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </section>
    );
}