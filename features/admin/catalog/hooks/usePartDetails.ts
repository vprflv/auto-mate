'use client';

import * as React from 'react';

import { storage } from '@/features/admin/lib/system-store/storage';
import {
    getOemCrosses,
    getRelatedParts
} from '@/features/admin/lib/system-store/oemCrosses';

import type {
    StoredPartItem,
    StoredCatalogNode
} from '@/features/admin/lib/system-store/types';

export interface PartModificationView {
    id: string;
    name: string;
    description: string;
}

interface Props {
    isOpen: boolean;
    part: StoredPartItem | null;
    node: StoredCatalogNode | null;
}

interface PartDetailsData {
    targetNumbers: string[];
    relatedParts: StoredPartItem[];
    appliesToAll: boolean;
    compatibleModifications: PartModificationView[];
    editorKey: string;
}

export function usePartDetails({
                                   isOpen,
                                   part,
                                   node
                               }: Props): PartDetailsData {
    React.useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    return React.useMemo<PartDetailsData>(() => {
        if (!isOpen || !part || !node) {
            return {
                targetNumbers: [],
                relatedParts: [],
                appliesToAll: false,
                compatibleModifications: [],
                editorKey: ''
            };
        }

        const state = storage.getState();

        // Детали текущей модели из всех разделов.
        const allModelParts = state.catalogNodes
            .filter(
                item =>
                    item.brandSlug === node.brandSlug &&
                    item.modelSlug === node.modelSlug
            )
            .flatMap(item => item.items);

        const oemNumbers = getOemCrosses(part);

        const targetNumbers = part.isOem
            ? [part.article, ...oemNumbers]
            : oemNumbers;

        const relatedParts = getRelatedParts(
            part,
            allModelParts
        );

        // Применимость берём только у самой детали.
        const compatibilityIds = Array.from(
            new Set(part.compatibleModifications ?? [])
        );

        const appliesToAll =
            compatibilityIds.includes('all');

        const modelModifications =
            state.masterModels.find(
                model =>
                    model.brandSlug === node.brandSlug &&
                    model.modelSlug === node.modelSlug
            )?.modifications ?? [];

        const compatibleModifications = compatibilityIds
            .filter(id => id !== 'all')
            .map(id => {
                const modification = modelModifications.find(
                    item => item.id === id
                );

                return {
                    id,
                    name:
                        modification?.name ??
                        'Модификация не найдена',
                    description: [
                        modification?.attributes?.engine,
                        modification?.attributes?.transmission,
                        modification?.attributes?.drivetrain
                    ]
                        .filter(Boolean)
                        .join(' · ')
                };
            });

        return {
            targetNumbers,
            relatedParts,
            appliesToAll,
            compatibleModifications,

            // После сохранения номеров редактор
            // получает актуальные начальные значения.
            editorKey: JSON.stringify([
                node.id,
                part.id,
                oemNumbers
            ])
        };
    }, [isOpen, part, node]);
}