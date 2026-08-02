'use client';

import { useState } from 'react';
import { Plus, X, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
    photos: string[];
    onUpdatePhotos: (photos: string[]) => void;
};

export default function CarPhotosGallery({ photos, onUpdatePhotos }: Props) {
    const [activeIndex, setActiveIndex] = useState(0);

    const addPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            const next = [...photos, base64];
            onUpdatePhotos(next);
            setActiveIndex(next.length - 1); // сразу показываем новое фото
        };
        reader.readAsDataURL(file);
    };

    const removePhoto = (index: number) => {
        const next = photos.filter((_, i) => i !== index);
        onUpdatePhotos(next);

        if (activeIndex >= next.length) {
            setActiveIndex(Math.max(0, next.length - 1));
        }
    };

    const setAsMain = (index: number) => {
        if (index === 0) return;
        const next = [...photos];
        const [photo] = next.splice(index, 1);
        next.unshift(photo);
        onUpdatePhotos(next);
        setActiveIndex(0);
    };

    const prev = () => {
        setActiveIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
    };

    const next = () => {
        setActiveIndex((i) => (i === photos.length - 1 ? 0 : i + 1));
    };

    // ===== Пустое состояние =====
    if (photos.length === 0) {
        return (
            <section className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                <div className="aspect-[16/9] bg-zinc-950 flex flex-col items-center justify-center gap-4">
                    <ImageIcon className="w-16 h-16 text-zinc-700" strokeWidth={1.5} />
                    <p className="text-zinc-500">Пока нет фото автомобиля</p>
                    <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white text-sm px-5 py-2.5 rounded-xl transition flex items-center gap-2">
                        <Plus size={16} />
                        Добавить фото
                        <input type="file" accept="image/*" className="hidden" onChange={addPhoto} />
                    </label>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
            {/* ===== Большое главное фото ===== */}
            <div className="relative aspect-[16/9] bg-zinc-950 group">
                <img
                    src={photos[activeIndex]}
                    alt={`Фото ${activeIndex + 1}`}
                    className="w-full h-full object-cover"
                />

                {/* Стрелки навигации */}
                {photos.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={prev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                            <ChevronLeft size={22} />
                        </button>
                        <button
                            type="button"
                            onClick={next}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                            <ChevronRight size={22} />
                        </button>
                    </>
                )}

                {/* Кнопки управления */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    {activeIndex !== 0 && (
                        <button
                            type="button"
                            onClick={() => setAsMain(activeIndex)}
                            className="text-xs bg-black/60 hover:bg-black/80 px-3 py-1.5 rounded-lg backdrop-blur-sm"
                        >
                            Сделать главным
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => removePhoto(activeIndex)}
                        className="w-8 h-8 rounded-lg bg-red-600/80 hover:bg-red-600 flex items-center justify-center"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Счётчик */}
                <div className="absolute bottom-3 left-3 text-xs bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                    {activeIndex + 1} / {photos.length}
                </div>
            </div>

            {/* ===== Миниатюры ===== */}
            <div className="p-4 border-t border-zinc-800">
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {photos.map((photo, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className={`
                relative shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition
                ${index === activeIndex ? 'border-blue-500' : 'border-transparent opacity-70 hover:opacity-100'}
              `}
                        >
                            <img src={photo} alt="" className="w-full h-full object-cover" />
                            {index === 0 && (
                                <span className="absolute bottom-0.5 left-0.5 text-[9px] bg-blue-600 px-1 rounded">
                  Глав
                </span>
                            )}
                        </button>
                    ))}

                    {/* Кнопка добавить */}
                    <label className="shrink-0 w-20 h-14 rounded-xl border-2 border-dashed border-zinc-700 hover:border-zinc-500 flex items-center justify-center cursor-pointer transition text-zinc-500 hover:text-zinc-300">
                        <Plus size={20} />
                        <input type="file" accept="image/*" className="hidden" onChange={addPhoto} />
                    </label>
                </div>
            </div>
        </section>
    );
}