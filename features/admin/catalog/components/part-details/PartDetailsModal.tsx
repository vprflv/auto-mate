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
                                     node
                                 }: Props) {
    const titleId = React.useId();

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
                    onClose={onClose}
                    titleId={titleId}
                />

                <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-6">
                    <PartIdentity part={part} />

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
                            appliesToAll={details.appliesToAll}
                            modifications={
                                details.compatibleModifications
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}