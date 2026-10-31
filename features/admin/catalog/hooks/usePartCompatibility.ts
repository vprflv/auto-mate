'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { storage } from '@/features/admin/lib/system-store/storage';
import { updatePartCompatibility } from '@/features/admin/lib/system-store/actions/updatePartCompatibility';

import type {
    StoredPartItem,
    StoredCatalogNode
} from '@/features/admin/lib/system-store/types';
import {resolvePartApplicability} from "@/features/admin/catalog/lib/resolvePartApplicability";

interface Props {
    part: StoredPartItem;
    node: StoredCatalogNode;
}

function selectionKey(ids: string[]): string {
    return JSON.stringify(
        Array.from(new Set(ids)).sort()
    );
}

export function usePartCompatibility({ part, node }: Props) {
    const original = part.compatibleModifications ?? [];

    const [appliesToAll, setAll] = React.useState(
        original.includes('all')
    );

    const [selectedIds, setSelectedIds] = React.useState<string[]>(
        original.filter(id => id !== 'all')
    );

    const [error, setError] = React.useState('');

    const systemState = storage.getState();

    const model = systemState.masterModels.find(
        item =>
            item.brandSlug === node.brandSlug &&
            item.modelSlug === node.modelSlug
    );

    const modelParts = systemState.catalogNodes
        .filter(
            item =>
                item.brandSlug === node.brandSlug &&
                item.modelSlug === node.modelSlug
        )
        .flatMap(item => item.items);

    const { inheritedIds } = resolvePartApplicability(
        part,
        modelParts
    );

    const modifications = (model?.modifications ?? []).map(
        mod => ({
            id: mod.id,
            name: mod.name,
            description: [
                mod.attributes?.engine,
                mod.attributes?.transmission,
                mod.attributes?.drivetrain
            ]
                .filter(Boolean)
                .join(' · ')
        })
    );

    const inheritsAll = inheritedIds.includes('all');

    const inheritedModifications = modifications.filter(
        modification => inheritedIds.includes(modification.id)
    );

    const selection = appliesToAll ? ['all'] : selectedIds;

    const dirty =
        selectionKey(selection) !== selectionKey(original);

    const setAppliesToAll = (value: boolean) => {
        setAll(value);
        setError('');
    };

    const toggleModification = (id: string) => {
        setSelectedIds(current =>
            current.includes(id)
                ? current.filter(item => item !== id)
                : [...current, id]
        );
        setError('');
    };

    const cancel = () => {
        setAll(original.includes('all'));
        setSelectedIds(original.filter(id => id !== 'all'));
        setError('');
    };

    const save = () => {
        try {
            updatePartCompatibility({
                nodeId: node.id,
                partId: part.id,
                modificationIds: selection
            });
        } catch (error: unknown) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Не удалось сохранить применимость.'
            );
            return;
        }

        setError('');
        toast.success('Применимость сохранена');
    };

    return {
        modelFound: Boolean(model),
        inheritsAll,
        inheritedModifications,
        modifications,
        appliesToAll,
        selectedIds,
        dirty,
        error,
        setAppliesToAll,
        toggleModification,
        cancel,
        save
    };
}