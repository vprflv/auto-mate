'use client';

import { useState, type FormEvent } from 'react';

import { NodeEditorBlock } from '@/features/admin/catalog-inbox/components/part-moderation/NodeEditorBlock';
import { moveCatalogPart } from '@/features/admin/lib/system-store/actions/moveCatalogPart';
import { storage } from '@/features/admin/lib/system-store/storage';
import type {
    StoredCatalogNode,
    StoredPartItem,
} from '@/features/admin/lib/system-store/types';

interface Props {
    part: StoredPartItem;
    node: StoredCatalogNode;
    onCancel: () => void;
    onMoved: () => void;
}

export function MoveCatalogPartForm({
                                        part,
                                        node,
                                        onCancel,
                                        onMoved,
                                    }: Props) {
    const [category, setCategory] = useState(node.category);
    const [title, setTitle] = useState('');
    const [isCustomNode, setIsCustomNode] = useState(false);
    const [error, setError] = useState('');
    const [catalogNodes] = useState(() => storage.getState().catalogNodes);

    const existingCategories = [...new Set(
        catalogNodes.map(item => item.category).filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, 'ru'));

    const existingNodes = [...new Set(
        catalogNodes
            .filter(item =>
                item.brandSlug === node.brandSlug &&
                item.modelSlug === node.modelSlug &&
                item.category === category.trim()
            )
            .map(item => item.title)
    )];

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');

        try {
            moveCatalogPart({
                nodeId: node.id,
                partId: part.id,
                category,
                title,
            });
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Не удалось переместить запчасть.'
            );
            return;
        }

        onMoved();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <h3 className="text-sm font-semibold">Переместить запчасть</h3>
            <p className="text-sm text-[var(--text-muted)]">
                {part.name} · сейчас в разделе «{node.title}»
            </p>

            <NodeEditorBlock
                nodeCategory={category}
                setNodeCategory={setCategory}
                nodeTitle={title}
                setNodeTitle={setTitle}
                existingCategories={existingCategories}
                existingNodes={existingNodes}
                isCustomNode={isCustomNode}
                setIsCustomNode={setIsCustomNode}
            />

            {error && (
                <p role="alert" className="text-sm text-[var(--danger)]">
                    {error}
                </p>
            )}

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm"
                >
                    Отмена
                </button>
                <button
                    type="submit"
                    disabled={!category.trim() || !title.trim()}
                    className="rounded-xl bg-[var(--btn-primary)] px-4 py-2 text-sm font-semibold text-[var(--btn-primary-text)] disabled:opacity-50"
                >
                    Переместить
                </button>
            </div>
        </form>
    );
}