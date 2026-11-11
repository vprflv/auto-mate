'use client';

import * as React from 'react';

import type {
    StoredPartItem,
    StoredCatalogNode
} from '@/features/admin/lib/system-store/types';
import {usePartDetails} from "@/features/admin/catalog/hooks/usePartDetails";
import {PartDetailsHeader} from "@/features/admin/catalog/components/part-details/PartDetailsHeader";
import {PartIdentity} from "@/features/admin/catalog/components/part-details/PartIdentity";
import {OemCrossEditor} from "@/features/admin/catalog/components/OemCrossEditor";
import {PartRelations} from "@/features/admin/catalog/components/part-details/PartRelations";
import {PartStats} from "@/features/admin/catalog/components/part-details/PartStats";
import {PartCompatibility} from "@/features/admin/catalog/components/part-details/PartCompatibility";
import {DeleteCatalogPartButton} from "@/features/admin/catalog/components/part-details/DeleteCatalogPartButton";
import {MoveCatalogPartForm} from "@/features/admin/catalog/components/part-details/MoveCatalogPartForm";
import {renameCatalogPart} from "@/features/admin/lib/system-store/actions/renameCatalogPart";
import {EditPartInstallationForm} from "@/features/admin/catalog/components/part-details/EditPartInstallationForm";



interface Props {
    isOpen: boolean;
    onClose: () => void;
    part: StoredPartItem | null;
    node: StoredCatalogNode | null;

}

export function PartDetailsModal({
                                     isOpen,
                                     onClose,
                                     part,
                                     node,
                                 }: Props) {
    const titleId = React.useId();

    const [isMoving, setIsMoving] = React.useState(false);
    const [isEditingInstallation, setIsEditingInstallation] = React.useState(false);
    const [nameDraft, setNameDraft] = React.useState<string | null>(null);
    const [renameError, setRenameError] = React.useState('');

    const closeDetails = () => {
        setIsMoving(false);
        setIsEditingInstallation(false);
        onClose();
    };

    const details = usePartDetails({
        isOpen,
        part,
        node
    });

    if (!isOpen || !part || !node) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--border)]/40 bg-[var(--card)] shadow-2xl"
            >
                <PartDetailsHeader
                    part={part}
                    onClose={closeDetails}
                    titleId={titleId}
                />

                <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-6">
                    <PartIdentity part={part} />

                    {nameDraft === null ? (
                        <button
                            type="button"
                            onClick={() => {
                                setNameDraft(part.name);
                                setRenameError('');
                            }}
                            className="text-sm font-semibold text-[var(--link)] hover:underline"
                        >
                            Изменить название
                        </button>
                    ) : (
                        <form
                            className="space-y-3"
                            onSubmit={event => {
                                event.preventDefault();

                                const name = nameDraft?.trim();
                                if (!node || !part || !name) return;

                                try {
                                    renameCatalogPart({
                                        nodeId: node.id,
                                        partId: part.id,
                                        name,
                                    });
                                    setNameDraft(null);
                                    setRenameError('');
                                } catch (error) {
                                    setRenameError(
                                        error instanceof Error
                                            ? error.message
                                            : 'Не удалось сохранить название.'
                                    );
                                }
                            }}
                        >
                            <label className="block space-y-1 text-sm">
                                <span>Название запчасти</span>
                                <input
                                    value={nameDraft}
                                    onChange={event => {
                                        setNameDraft(event.target.value);
                                        setRenameError('');
                                    }}
                                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2"
                                />
                            </label>

                            {renameError && (
                                <p role="alert" className="text-sm text-[var(--danger)]">
                                    {renameError}
                                </p>
                            )}

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNameDraft(null);
                                        setRenameError('');
                                    }}
                                    className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={!nameDraft.trim()}
                                    className="rounded-xl bg-[var(--btn-primary)] px-4 py-2 text-sm font-semibold text-[var(--btn-primary-text)] disabled:opacity-50"
                                >
                                    Сохранить название
                                </button>
                            </div>
                        </form>
                    )}

                    <OemCrossEditor
                        key={details.editorKey}
                        part={part}
                        nodeId={node.id}
                    />

                    <PartRelations
                        targetNumbers={details.targetNumbers}
                        relatedParts={details.relatedParts}
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">


                        <PartStats part={part} />

                        <PartCompatibility
                            key={JSON.stringify([
                                node.id,
                                part.id,
                                part.compatibleModifications ?? []
                            ])}
                            part={part}
                            node={node}
                        />
                    </div>
                    {isEditingInstallation ? (
                        <EditPartInstallationForm
                            key={`${node.id}:${part.id}`}
                            part={part}
                            node={node}
                            onClose={() => setIsEditingInstallation(false)}
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsEditingInstallation(true)}
                            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--link)] hover:text-[var(--link)]"
                        >
                            Изменить расположение
                        </button>
                    )}

                    {isMoving ? (
                        <MoveCatalogPartForm
                            part={part}
                            node={node}
                            onCancel={() => setIsMoving(false)}
                            onMoved={closeDetails}
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsMoving(true)}
                            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--link)] hover:text-[var(--link)]"
                        >
                            Переместить запчасть
                        </button>
                    )}

                    <DeleteCatalogPartButton
                        part={part}
                        nodeId={node.id}
                        onDeleted={closeDetails}
                    />

                </div>
            </div>
        </div>
    );
}