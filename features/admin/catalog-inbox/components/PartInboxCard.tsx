'use client';

import * as React from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { InboxItem } from '@/features/admin/lib/systemStore';
import { usePartInboxCard } from '../hooks/usePartInboxCard';
import { PartCarSpecsSection } from './part-card/PartCarSpecsSection';
import { PartDetailsFormSection } from './part-card/PartDetailsFormSection';
import { PartCatalogTargetSection } from './part-card/PartCatalogTargetSection';

interface Props {
    item: InboxItem;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

export function PartInboxCard({ item, onApprove, onReject }: Props) {
    const {
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
        isSubmitting,
        isApproving,
        isRejecting,
    } = usePartInboxCard(item, onApprove, onReject);

    return (
        <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border)]/60 bg-[var(--card)] transition-all duration-200 hover:border-[var(--link)]/40 hover:shadow-sm">
            {/* 1. Шапка и паспорт автомобиля */}
            <PartCarSpecsSection item={item} specs={parsedSpecs} />

            {/* 2. Форма детали, раздел каталога и кнопки */}
            <div className="flex flex-1 flex-col justify-between p-3.5 space-y-2.5">
                <div className="space-y-2.5">
                    <PartDetailsFormSection
                        partName={partName}
                        onChangeName={setPartName}
                        partBrand={partBrand}
                        onChangeBrand={setPartBrand}
                        partArticle={partArticle}
                        onChangeArticle={setPartArticle}
                        isOem={isOem}
                        onToggleOem={toggleOem}
                        score={score}
                        onChangeScore={setScore}
                    />

                    <PartCatalogTargetSection
                        itemId={item.id}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                        isCustomCat={isCustomCat}
                        onToggleCustomCat={() => setIsCustomCat(!isCustomCat)}
                        customCatName={customCatName}
                        onChangeCustomCatName={setCustomCatName}
                        nodeTitle={nodeTitle}
                        onChangeNodeTitle={setNodeTitle}
                        existingNodeTitles={existingNodeTitles}
                        fullEngineTag={parsedSpecs.fullEngineTag}
                        engineScope={engineScope}
                        onChangeEngineScope={setEngineScope}
                    />
                </div>

                {/* 3. Кнопки действий */}
                <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]/40">
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleRejectClick}
                        className="flex h-8 flex-1 items-center justify-center gap-1 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs font-semibold text-rose-500 transition hover:bg-rose-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRejecting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <X className="h-3 w-3" />
                        )}
                        Отклонить
                    </button>

                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleApproveClick}
                        className="flex h-8 flex-[1.4] items-center justify-center gap-1 rounded-xl bg-emerald-500 text-xs font-bold text-white transition hover:bg-emerald-600 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isApproving ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        )}
                        Одобрить
                    </button>
                </div>
            </div>
        </div>
    );
}