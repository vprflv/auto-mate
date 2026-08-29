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

    if (photos.length === 0) {
        return (
            <section className="bg-[#161616] border border-[#2A2A2A] rounded-3xl overflow-hidden">
                <div className="aspect-[16/9] bg-[#0A0A0A] flex flex-col items-center justify-center gap-4">
                    <ImageIcon className="w-16 h-16 text-[#3A3A3A]" strokeWidth={1.5} />
                    <p className="text-[#A3A3A3]">Пока нет фото автомобиля</p>
                    <label className="cursor-pointer bg-[#39FF14] hover:bg-[#57FF3A] text-black text-sm px-5 py-2.5 rounded-xl transition flex items-center gap-2">
                        <Plus size={16} />
                        Добавить фото
                        <input type="file" accept="image/*" className="hidden" onChange={addPhoto} />
                    </label>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-[#161616] border border-[#2A2A2A] rounded-3xl overflow-hidden">
            <div className="relative aspect-[16/9] bg-[#0A0A0A] group">
                <img
                    src={photos[activeIndex]}
                    alt={`Фото ${activeIndex + 1}`}
                    className="w-full h-full object-cover"
                />

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
                        onClick={() => confirmRemovePhoto(activeIndex)}
                        className="w-8 h-8 rounded-lg bg-red-600/80 hover:bg-red-600 flex items-center justify-center"
                    >
                        <X size={14} />
                    </button>
                </div>

                <div className="absolute bottom-3 left-3 text-xs bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                    {activeIndex + 1} / {photos.length}
                </div>
            </div>

            <div className="p-4 border-t border-[#2A2A2A]">
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {photos.map((photo, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className={`
                relative shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition
                ${index === activeIndex ? 'border-[#39FF14]' : 'border-transparent opacity-70 hover:opacity-100'}
              `}
                        >
                            <img src={photo} alt="" className="w-full h-full object-cover" />
                            {index === 0 && (
                                <span className="absolute bottom-0.5 left-0.5 text-[9px] bg-[#39FF14] text-black px-1 rounded">
                  Глав
                </span>
                            )}
                        </button>
                    ))}

                    <label className="shrink-0 w-20 h-14 rounded-xl border-2 border-dashed border-[#3A3A3A] hover:border-[#39FF14] flex items-center justify-center cursor-pointer transition text-[#666666] hover:text-[#39FF14]">
                        <Plus size={20} />
                        <input type="file" accept="image/*" className="hidden" onChange={addPhoto} />
                    </label>
                </div>
            </div>
        </section>
    );
}