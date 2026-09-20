'use client';

import { Plus, X, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCarPhotosGallery } from '@/features/garage/gallery/hooks/useCarPhotosGallery';

type Props = {
    photos: string[];
    onUpdatePhotos: (photos: string[]) => void;
};

export default function CarPhotosGallery({ photos, onUpdatePhotos }: Props) {
    const {
        activeIndex,
        setActiveIndex,
        addPhoto,
        confirmRemovePhoto,
        setAsMain,
        prev,
        next,
    } = useCarPhotosGallery({ photos, onUpdatePhotos });

    /* ЭКРАН ЗАГЛУШКИ (Если у машины нет фотографий) */
    if (photos.length === 0) {
        return (
            <section className="bg-[var(--card)] border border-[var(--border)]/20 rounded-3xl overflow-hidden transition-colors duration-200">
                <div className="aspect-[16/9] bg-[var(--bg-elevated)] flex flex-col items-center justify-center gap-4">
                    <ImageIcon className="w-16 h-16 text-[var(--text-dim)]" strokeWidth={1.5} />
                    <p className="text-[var(--text-muted)] font-medium">Пока нет фото автомобиля</p>

                    <label className="cursor-pointer bg-[var(--btn-primary)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] text-sm px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 active:scale-95 [html[data-theme=dark]_&]:shadow-[0_0_12px_rgba(57,255,20,0.25)]">
                        <Plus size={16} />
                        Добавить фото
                        <input type="file" accept="image/*" className="hidden" onChange={addPhoto} />
                    </label>
                </div>
            </section>
        );
    }

    /* ОСНОВНОЙ ЭКРАН ГАЛЕРЕИ */
    return (
        <section className="bg-[var(--card)] border border-[var(--border)]/20 rounded-3xl overflow-hidden transition-colors duration-200">
            {/* Окно основного слайдера */}
            <div className="relative aspect-[16/9] bg-black group">
                <img
                    src={photos[activeIndex]}
                    alt={`Фото ${activeIndex + 1}`}
                    className="w-full h-full object-cover"
                />

                {/* Навигация по стрелкам поверх фото */}
                {photos.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={prev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer"
                        >
                            <ChevronLeft size={22} />
                        </button>
                        <button
                            type="button"
                            onClick={next}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-auto cursor-pointer"
                        >
                            <ChevronRight size={22} />
                        </button>
                    </>
                )}

                {/* Инструменты управления в углу */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition duration-200">
                    {activeIndex !== 0 && (
                        <button
                            type="button"
                            onClick={() => setAsMain(activeIndex)}
                            className="text-xs bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm transition cursor-pointer"
                        >
                            Сделать главным
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => confirmRemovePhoto(activeIndex)}
                        className="w-8 h-8 rounded-lg bg-[var(--danger)] text-white flex items-center justify-center transition hover:opacity-90 cursor-pointer active:scale-95"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Счётчик страниц поверх фото */}
                <div className="absolute bottom-3 left-3 text-xs bg-black/50 text-white px-2.5 py-1 rounded-lg backdrop-blur-sm font-medium">
                    {activeIndex + 1} / {photos.length}
                </div>
            </div>

            {/* Нижняя лента миниатюр */}
            <div className="p-4 border-t border-[var(--border)]/20 bg-transparent">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {photos.map((photo, index) => {
                        const isActive = index === activeIndex;

                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setActiveIndex(index)}
                                className={`
                                    relative shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition duration-200 cursor-pointer
                                    ${isActive
                                    ? 'border-[var(--btn-primary)] opacity-100'
                                    : 'border-transparent opacity-60 hover:opacity-100'
                                }
                                `}
                            >
                                <img src={photo} alt="" className="w-full h-full object-cover" />
                                {index === 0 && (
                                    <span className="absolute bottom-0.5 left-0.5 text-[9px] bg-[var(--btn-primary)] text-[var(--btn-primary-text)] font-bold px-1 rounded shadow-sm">
                                        Глав
                                    </span>
                                )}
                            </button>
                        );
                    })}

                    {/* Кнопка добавления новой миниатюры */}
                    <label className="shrink-0 w-20 h-14 rounded-xl border-2 border-dashed border-[var(--text-dim)]/50 text-[var(--text-dim)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-[var(--btn-primary)] hover:text-[var(--btn-primary)] active:scale-95">
                        <Plus size={20} />
                        <input type="file" accept="image/*" className="hidden" onChange={addPhoto} />
                    </label>
                </div>
            </div>
        </section>
    );
}
