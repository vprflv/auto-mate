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

        // сбрасываем input, чтобы можно было выбрать тот же файл снова
        e.target.value = '';
    };

    const removePhoto = (index: number) => {
        onChange(photos.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-semibold">Фото заказ-наряда</h2>
                    <p className="text-xs text-zinc-500 mt-1">
                        Можно сфотографировать чек или заказ-наряд
                    </p>
                </div>

                <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-sm px-4 py-2 rounded-xl transition flex items-center gap-2">
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
                <div className="border border-dashed border-zinc-700 rounded-2xl py-10 flex flex-col items-center gap-3 text-zinc-500">
                    <Camera size={28} strokeWidth={1.5} />
                    <p className="text-sm">Пока нет фото</p>
                    <label className="cursor-pointer text-sm text-blue-400 hover:text-blue-300">
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
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-zinc-950 group">
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

                    <label className="aspect-square rounded-xl border border-dashed border-zinc-700 hover:border-zinc-500 flex items-center justify-center cursor-pointer text-zinc-500 hover:text-zinc-300 transition">
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