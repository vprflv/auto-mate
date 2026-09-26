
'use client';

import { Plus, X, Camera } from 'lucide-react';

type Props = {
    photos: string[];
    onChange: (photos: string[]) => void;
};

const addButtonClass =
    'flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)]/40 bg-[var(--bg-elevated)] px-4 py-2 text-sm font-medium text-[var(--text)] transition-all duration-200 hover:border-[var(--border)]/60 hover:bg-[var(--bg-elevated)]/80 hover:text-[var(--link)] active:scale-95';

export default function ServicePhotosSection({
    photos,
    onChange,
}: Props) {
    const addPhoto = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result !== 'string') return;

            onChange([...photos, reader.result]);
        };

        reader.readAsDataURL(file);

        e.target.value = '';
    };

    const removePhoto = (index: number) => {
        onChange(
            photos.filter((_, i) => i !== index)
        );
    };

    return (
        <div className="rounded-3xl border border-[var(--border)]/30 bg-[var(--card)] p-5 transition-colors duration-200 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-[var(--text)]">
                        Фото заказ-наряда
                    </h2>

                    <p className="mt-1 text-xs text-[var(--text-dim)]">
                        Можно сфотографировать чек или заказ-наряд
                    </p>
                </div>

                <label className={addButtonClass}>
                    <Camera size={16} />

                    <span>Добавить</span>

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
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border)]/30 bg-[var(--bg-elevated)]/30 px-5 py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-elevated)] text-[var(--text-dim)]">
                        <Camera
                            size={24}
                            strokeWidth={1.5}
                        />
                    </div>

                    <div>
                        <p className="text-sm text-[var(--text-muted)]">
                            Пока нет фото
                        </p>

                        <label className="mt-1 inline-block cursor-pointer text-sm font-medium text-[var(--link)] transition-colors duration-200 hover:text-[var(--btn-primary-hover)]">
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
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {photos.map((photo, index) => (
                        <div
                            key={index}
                            className="group relative aspect-square overflow-hidden rounded-2xl border border-[var(--border)]/30 bg-[var(--bg-elevated)]"
                        >
                            <img
                                src={photo}
                                alt=""
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            />

                            <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />

                            <button
                                type="button"
                                onClick={() =>
                                    removePhoto(index)
                                }
                                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-[var(--danger)] hover:text-white group-hover:opacity-100 active:scale-95"
                                title="Удалить фото"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    ))}

                    <label className="group flex aspect-square cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[var(--border)]/40 bg-[var(--bg-elevated)]/20 text-[var(--text-dim)] transition-all duration-200 hover:border-[var(--link)]/60 hover:bg-[var(--bg-elevated)]/50 hover:text-[var(--link)]">
                        <Plus
                            size={22}
                            className="transition-transform duration-200 group-hover:scale-110"
                        />

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

