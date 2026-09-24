'use client';

import { useState } from 'react';
import { CarParts } from '@/types';
import EditPartModal from '@/features/garage/parts/components/EditPartModal';
import NamePromptModal from '@/features/garage/parts/components/NamePromptModal';
import { useCarPartsCard } from '@/features/garage/parts/hooks/useCarPartsCard';
import CarPartsCategoryView from '@/features/garage/parts/components/CarPartsCategoryView';
import CarPartsSubcategoryView from '@/features/garage/parts/components/CarPartsSubcategoryView';
import CarPartsItemsView from '@/features/garage/parts/components/CarPartsItemsView';

type Props = {
    carId: string;
    parts?: CarParts;
    onUpdateParts?: (parts: CarParts) => void;
};

export default function CarPartsCard({
                                         parts,
                                         onUpdateParts,
                                         carId,
                                     }: Props) {
    const [namePrompt, setNamePrompt] = useState<
        'category' | 'subcategory' | null
    >(null);

    const {
        category,
        sub,
        editItem,
        setEditItem,
        categories,
        inCategory,
        subs,
        inSub,
        openCategory,
        openSubcategory,
        back,
        saveItem,
        deleteItem,
        createCategory,
        createSubcategory,
        addItemToSection,
    } = useCarPartsCard({
        parts,
        onUpdateParts,
    });

    const selectedCategory = categories.find(
        (item) => item.id === category
    );

    const selectedSubcategory = subs.find(
        (item) => item.id === sub
    );

    return (
        <section className="overflow-hidden rounded-3xl border border-[var(--border)]/20 bg-[var(--card)] transition-colors duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--text-accent)]">
                    <span className="text-lg">🔧</span>
                </div>

                <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-[var(--text)]">
                        Запчасти
                    </h2>

                    <p className="text-sm text-[var(--text-muted)]">
                        Каталог деталей автомобиля
                    </p>
                </div>
            </div>

            {/* Mobile categories */}
            <div className="border-b border-[var(--border)] px-4 py-3 md:hidden">
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {categories.map((item) => {
                        const isActive = category === item.id;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => openCategory(item.id)}
                                className={[
                                    'shrink-0 rounded-xl px-3 py-2 text-sm font-medium transition',
                                    isActive
                                        ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)]'
                                        : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text)]',
                                ].join(' ')}
                            >
                                {item.isCustom && '★ '}
                                {item.label}
                            </button>
                        );
                    })}

                    <button
                        type="button"
                        onClick={() => setNamePrompt('category')}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-dashed border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition hover:border-[var(--btn-primary)] hover:text-[var(--text)]"
                    >
                        <span>＋</span>
                        Категория
                    </button>
                </div>
            </div>

            {/* Desktop layout */}
            <div className="flex min-h-[360px]">
                {/* Categories sidebar */}
                <div className="hidden w-56 shrink-0 border-r border-[var(--border)] bg-[var(--bg-elevated)]/30 md:block">
                    <CarPartsCategoryView
                        categories={categories}
                        activeCategory={category}
                        onOpenCategory={openCategory}
                        onCreateCategory={() =>
                            setNamePrompt('category')
                        }
                    />
                </div>

                {/* Main content */}
                <div className="min-w-0 flex-1 p-4 md:p-5">
                    {!category ? (
                        <div className="flex min-h-[300px] items-center justify-center">
                            <div className="max-w-sm text-center">
                                <p className="text-sm font-medium text-[var(--text)]">
                                    Выберите категорию
                                </p>

                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    Выберите категорию слева, чтобы увидеть
                                    подкатегории и запчасти.
                                </p>
                            </div>
                        </div>
                    ) : !sub ? (
                        <div>
                            <div className="mb-5">
                                <h3 className="text-base font-semibold text-[var(--text)]">
                                    {selectedCategory?.label}
                                </h3>

                                <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                                    Выберите подкатегорию
                                </p>
                            </div>

                            <CarPartsSubcategoryView
                                subs={subs}
                                inCategory={inCategory}
                                onOpenSub={openSubcategory}
                                onCreateSub={() =>
                                    setNamePrompt('subcategory')
                                }
                            />
                        </div>
                    ) : (
                        <CarPartsItemsView
                            carId={carId}
                            items={inSub}
                            onEdit={setEditItem}
                            onAdd={addItemToSection}
                            onBack={back}
                            title={
                                selectedSubcategory?.label ??
                                'Запчасти'
                            }
                        />
                    )}
                </div>
            </div>

            {/* Edit part */}
            <EditPartModal
                open={!!editItem}
                item={editItem}
                onClose={() => setEditItem(null)}
                onSave={saveItem}
                onDelete={deleteItem}
            />

            {/* Create category / subcategory */}
            <NamePromptModal
                open={!!namePrompt}
                title={
                    namePrompt === 'subcategory'
                        ? 'Новая подкатегория'
                        : 'Новая категория'
                }
                placeholder={
                    namePrompt === 'subcategory'
                        ? 'Колодки, диски…'
                        : 'Электрика, салон…'
                }
                onClose={() => setNamePrompt(null)}
                onSubmit={(name) => {
                    if (namePrompt === 'category') {
                        createCategory(name);
                    }

                    if (namePrompt === 'subcategory') {
                        createSubcategory(name);
                    }

                    setNamePrompt(null);
                }}
            />
        </section>
    );
}