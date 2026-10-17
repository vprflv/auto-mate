'use client';

import * as React from 'react';
import { InboxItem } from '@/features/admin/lib/systemStore';
import { storage } from '@/features/admin/lib/system-store/storage';
import { normalizeSlug } from '@/features/admin/lib/system-store/utils';
import {
    ADMIN_CATALOG_CATEGORIES,
    detectInitialCategory,
    extractCarSpecs,
} from '../lib/partInboxUtils';

export function usePartInboxCard(
    item: InboxItem,
    onApprove: (id: string) => void,
    onReject?: (id: string) => void
) {
    const parsedSpecs = React.useMemo(() => extractCarSpecs(item), [item]);
    const { fullEngineTag } = parsedSpecs;

    // Стейты параметров детали
    const [partName, setPartName] = React.useState(item.partName || '');
    const [partBrand, setPartBrand] = React.useState(item.partBrand || '');
    const [partArticle, setPartArticle] = React.useState(item.partArticle || '');
    const [isOem, setIsOem] = React.useState(Boolean(item.isOem));
    const [score, setScore] = React.useState<number>(
        item.suggestedScore || (item.isOem ? 90 : 60)
    );

    // Стейты каталогизации
    const [selectedCategory, setSelectedCategory] = React.useState<string>(() =>
        detectInitialCategory(item)
    );
    const [isCustomCat, setIsCustomCat] = React.useState(false);
    const [customCatName, setCustomCatName] = React.useState('');
    const [nodeTitle, setNodeTitle] = React.useState<string>(() =>
        item.subcategory && item.subcategory !== 'other'
            ? item.subcategory
            : item.category || item.partName || 'Расходники'
    );

    const [engineScope, setEngineScope] = React.useState<'specific' | 'all'>(() => {
        if (!fullEngineTag) return 'all';
        const initialCat = detectInitialCategory(item);
        return ['body', 'suspension', 'brakes'].includes(initialCat) ? 'all' : 'specific';
    });

    // Стейт статуса обработки (защита от двойного клика)
    const [status, setStatus] = React.useState<'idle' | 'approving' | 'rejecting'>('idle');

    // Подсказка существующих узлов для выбранной категории
    const existingNodeTitles = React.useMemo(() => {
        const state = storage.getState();
        const bSlug = normalizeSlug(item.carBrand);
        const mSlug = normalizeSlug(item.carModel);
        const targetCat =
            isCustomCat && customCatName.trim()
                ? customCatName.trim().toLowerCase().replace(/\s+/g, '-')
                : selectedCategory;

        const titles = state.catalogNodes
            .filter(
                (n) =>
                    normalizeSlug(n.brandSlug) === bSlug &&
                    normalizeSlug(n.modelSlug) === mSlug &&
                    n.category === targetCat
            )
            .map((n) => n.title.trim())
            .filter(Boolean);

        return Array.from(new Set(titles));
    }, [item.carBrand, item.carModel, selectedCategory, isCustomCat, customCatName]);

    const toggleOem = () => {
        const nextOem = !isOem;
        setIsOem(nextOem);
        if (nextOem && !score) setScore(90);
    };

    const handleRejectClick = React.useCallback(() => {
        if (status !== 'idle') return;
        setStatus('rejecting');
        onReject?.(item.id);
    }, [status, item.id, onReject]);

    const handleApproveClick = React.useCallback(() => {
        if (status !== 'idle') return;
        setStatus('approving');

        const finalCategory =
            isCustomCat && customCatName.trim()
                ? customCatName.trim().toLowerCase().replace(/\s+/g, '-')
                : selectedCategory;

        const finalCategoryLabel =
            isCustomCat && customCatName.trim()
                ? customCatName.trim()
                : ADMIN_CATALOG_CATEGORIES.find((c) => c.id === selectedCategory)?.label ||
                selectedCategory;

        const finalNodeTitle = nodeTitle.trim() || partName.trim() || 'Детали';
        const finalEngineScope =
            engineScope === 'specific' && fullEngineTag ? fullEngineTag : 'all';

        const state = storage.getState();
        const target = state.inbox.find((i) => i.id === item.id);
        if (target) {
            (target as any).adminCategory = finalCategory;
            (target as any).adminCategoryLabel = finalCategoryLabel;
            (target as any).adminNodeTitle = finalNodeTitle;
            (target as any).adminPartName = partName.trim();
            (target as any).adminPartBrand = partBrand.trim();
            (target as any).adminPartArticle = partArticle.trim();
            (target as any).adminIsOem = isOem;
            (target as any).adminScore = score;
            (target as any).adminEngineScope = finalEngineScope;
            storage.saveState(state);
        }

        onApprove(item.id);
    }, [
        status,
        item.id,
        isCustomCat,
        customCatName,
        selectedCategory,
        nodeTitle,
        partName,
        engineScope,
        fullEngineTag,
        partBrand,
        partArticle,
        isOem,
        score,
        onApprove,
    ]);

    return {
        parsedSpecs,
        partName,
        setPartName,
        partBrand,
        setPartBrand,
        partArticle,
        setPartArticle,
        isOem,
        toggleOem,
        score,
        setScore,
        selectedCategory,
        setSelectedCategory,
        isCustomCat,
        setIsCustomCat,
        customCatName,
        setCustomCatName,
        nodeTitle,
        setNodeTitle,
        engineScope,
        setEngineScope,
        existingNodeTitles,
        handleApproveClick,
        handleRejectClick,
        isSubmitting: status !== 'idle',
        isApproving: status === 'approving',
        isRejecting: status === 'rejecting',
    };
}