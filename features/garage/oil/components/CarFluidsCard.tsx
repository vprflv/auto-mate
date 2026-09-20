'use client';

import { Package, Plus } from 'lucide-react';
import { useCarFluidsCard } from '../hooks/useCarFluidsCard';
import EditFluidModal from './EditFluidModal';
import NamePromptModal from '@/features/garage/parts/components/NamePromptModal';

import { CarFluidItem, CarFluids } from '@/types/oil';
import CarPartsDashedButton from "@/features/garage/parts/components/CarPartsDashedButton";

type Props = {
    fluids?: CarFluids;
    onUpdateFluids?: (fluids: CarFluids) => void;
};

function formatFluid(item: CarFluidItem) {
    const parts = [item.spec, item.brand, item.volume].filter(Boolean);
    return parts.join(' • ') || item.name;
}

export default function CarFluidsCard({ fluids, onUpdateFluids }: Props) {
    const {
        items,
        category,
        setCategory,
        editItem,
        setEditItem,
        isCreating,
        setIsCreating,
        showNamePrompt,
        setShowNamePrompt,
        activeCategories,
        displayItems,
        title,
        getCategoryLabel,
        saveItem,
        deleteItem,
        openCreate,
        handleCreateCategory,
    } = useCarFluidsCard({ fluids, onUpdateFluids });

    return (
        <section className="bg-[var(--card)] border border-[var(--border)]/20 rounded-3xl p-6 transition-colors duration-200">
            {/* ШАПКА КАРТОЧКИ */}
            <div className="flex items-center justify-between mb-5 bg-transparent">
                <div className="flex items-center gap-3 min-w-0">
                    {category && (
                        <button
                            type="button"
                            onClick={() => setCategory(null)}
                            className="text-sm text-[var(--link)] font-medium hover:text-[var(--text)] shrink-0 transition duration-200 cursor-pointer"
                        >
                            ← Назад
                        </button>
                    )}
                    <h2 className="text-lg font-bold truncate text-[var(--text)]">{title}</h2>
                </div>

                {!category && (
                    <button
                        type="button"
                        onClick={() => openCreate()}
                        className="text-sm text-[var(--link)] font-semibold hover:text-[var(--btn-primary-hover)] shrink-0 transition duration-200 cursor-pointer active:scale-95"
                    >
                        + Добавить
                    </button>
                )}
            </div>

            {/* СЛОЙ 1: ПРОСМОТР ВСЕХ КАТЕГОРИЙ */}
            {!category && (
                <div className="space-y-4 bg-transparent">
                    {items.length === 0 && activeCategories.length === 0 ? (
                        <div className="text-center py-10 bg-[var(--bg-elevated)]/40 rounded-2xl border border-[var(--border)]/10">
                            <p className="text-[var(--text-dim)] text-sm mb-3">Пока не указано</p>
                            <button
                                type="button"
                                onClick={() => openCreate()}
                                className="text-sm font-semibold text-[var(--link)] hover:text-[var(--btn-primary-hover)] transition cursor-pointer"
                            >
                                Добавить первую жидкость
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10 bg-transparent">
                            {activeCategories.map((c) => {
                                const count = items.filter((i) => i.category === c && i.name !== 'Маркер категории').length;
                                const isCustom = c.startsWith('custom_');

                                return (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setCategory(c)}
                                        className="bg-[var(--bg-elevated)] border border-[var(--border)]/20 hover:border-[var(--link)]/50 rounded-2xl px-4 py-4 text-left transition duration-200 cursor-pointer active:scale-[0.98]"
                                    >
                                        <p className="text-sm font-bold text-[var(--text)]">
                                            {getCategoryLabel(c)}
                                            {isCustom ? ' ★' : ''}
                                        </p>
                                        <p className="text-xs text-[var(--text-dim)] mt-1.5 font-medium">
                                            {count} поз.
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <CarPartsDashedButton
                        label="Добавить категорию жидкостей"
                        onClick={() => setShowNamePrompt(true)}
                    />
                </div>
            )}
            {/* СЛОЙ 2: ПРОСМОТР ЖИДКОСТЕЙ ВНУТРИ ВЫБРАННОЙ КАТЕГОРИИ */}
            {category && (
                <div className="space-y-4 bg-transparent">
                    {displayItems.length === 0 ? (
                        <p className="text-center text-[var(--text-dim)] text-sm py-8 font-medium">Пока нет записей</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10">
                            {displayItems.map((item) => (
                                <div
                                    key={item.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => {
                                        setEditItem(item);
                                        setIsCreating(false);
                                    }}
                                    className="bg-[var(--bg-elevated)] border border-[var(--border)]/20 hover:border-[var(--link)]/50 rounded-2xl overflow-hidden cursor-pointer transition duration-200 active:scale-[0.98] outline-none focus:ring-2 focus:ring-[var(--link)]/40"
                                >
                                    {/* Превью фото товара или иконка-заглушка */}
                                    <div className="aspect-[4/3] bg-[var(--bg)] flex items-center justify-center border-b border-[var(--border)]/10">
                                        {item.photo ? (
                                            <img
                                                src={item.photo}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Package className="w-10 h-10 text-[var(--text-dim)]" strokeWidth={1.5} />
                                        )}
                                    </div>

                                    {/* Описание товара */}
                                    <div className="p-3">
                                        {item.brand && (
                                            <p className="text-xs text-[var(--text-accent)] font-semibold mb-0.5 truncate">{item.brand}</p>
                                        )}
                                        <p className="text-sm text-[var(--text)] font-bold leading-snug line-clamp-2">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-[var(--link)] mt-1.5 truncate font-medium">
                                            {formatFluid(item)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        /*
                          ИСПРАВЛЕНО: Заменили category на (category ?? undefined).
                          Если стейт равен null, TypeScript безопасно передаст undefined,
                          и ошибка рассогласования типов полностью исчезнет.
                        */
                        onClick={() => openCreate(category ?? undefined)}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-[var(--text-dim)]/30 text-[var(--text-muted)] hover:border-[var(--link)] hover:text-[var(--link)] transition-all duration-200 cursor-pointer active:scale-95 font-medium"
                    >
                        <Plus size={18} />
                        Добавить в этот раздел
                    </button>
                </div>
            )}

            {/* Справочная плашка снизу */}
            <p className="text-xs text-[var(--text-dim)] mt-6 leading-relaxed border-t border-[var(--border)]/10 pt-4 font-medium">
                Справочная информация. Перед заменой сверьте данные с сервисной книгой
                или уточните у дилера.
            </p>

            {/* Модальное окно редактирования/добавления жидкости */}
            <EditFluidModal
                open={!!editItem}
                item={isCreating ? null : editItem}
                onClose={() => {
                    setEditItem(null);
                    setIsCreating(false);
                }}
                onSave={saveItem}
                onDelete={deleteItem}
            />

            {/* Модальное окно ввода названия для новой кастомной категории жидкостей */}
            <NamePromptModal
                open={showNamePrompt}
                title="Новая категория жидкостей"
                placeholder="Например: Жидкость ГУР, Омывайка…"
                onClose={() => setShowNamePrompt(false)}
                onSubmit={handleCreateCategory}
            />
        </section>
    );
}
