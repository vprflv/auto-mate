'use client';

import { Plus, X, Camera } from 'lucide-react';

type Props = {
    photos: string[];
    onChange: (photos: string[]) => void;
};

export default function ServicePhotosSection({ photos, onChange }: Props) {
    const addPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            onChange([...photos, reader.result as string]);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const removePhoto = (index: number) => {
        onChange(photos.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-semibold text-[#F5F5F5]">Фото заказ-наряда</h2>
                    <p className="text-xs text-[#666666] mt-1">
                        Можно сфотографировать чек или заказ-наряд
                    </p>
                </div>

                <label className="cursor-pointer bg-[#1F1F1F] hover:bg-[#2A2A2A] text-sm px-4 py-2 rounded-xl transition flex items-center gap-2 text-[#F5F5F5]">
                    <Camera size={16} />
                    Добавить
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={addPhoto}
                    />
                </label>
            </div>

            {photos.length === 0 ? (
                <div className="border border-dashed border-[#2A2A2A] rounded-2xl py-10 flex flex-col items-center gap-3 text-[#666666]">
                    <Camera size={28} strokeWidth={1.5} />
                    <p className="text-sm">Пока нет фото</p>
                    <label className="cursor-pointer text-sm text-[#39FF14] hover:text-[#57FF3A]">
                        Сделать или выбрать фото
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={addPhoto}
                        />
                    </label>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-3">
                    {photos.map((photo, index) => (
                        <div
                            key={index}
                            className="relative aspect-square rounded-xl overflow-hidden bg-[#0A0A0A] group"
                        >
                            <img src={photo} alt="" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}

                    <label className="aspect-square rounded-xl border border-dashed border-[#2A2A2A] hover:border-[#39FF14] flex items-center justify-center cursor-pointer text-[#666666] hover:text-[#39FF14] transition">
                        <Plus size={22} />
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={addPhoto}
                        />
                    </label>
                </div>
            )}
        </div>
    );
}