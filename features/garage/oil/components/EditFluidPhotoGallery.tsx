'use client';

import { ImagePlus, Trash2 } from 'lucide-react';
import type { ChangeEvent } from 'react';

type EditFluidPhotoGalleryProps = {
    name: string;
    photos: string[];
    activePhotoIndex: number;
    isProcessingPhoto: boolean;
    onSelectPhoto: (index: number) => void;
    onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onRemovePhoto: (index: number) => void;
};

const MAX_PHOTOS = 5;

export default function EditFluidPhotoGallery({
                                                  name,
                                                  photos,
                                                  activePhotoIndex,
                                                  isProcessingPhoto,
                                                  onSelectPhoto,
                                                  onPhotoChange,
                                                  onRemovePhoto,
                                              }: EditFluidPhotoGalleryProps) {
    const activePhoto = photos[activePhotoIndex];

    return (
        <div className="rounded-2xl border border-[var(--border)]/30 bg-[var(--bg-elevated)] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-[var(--text)]">
                        Фотографии
                    </h3>

                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                        {photos.length} из {MAX_PHOTOS}
                    </p>
                </div>

                {photos.length < MAX_PHOTOS && (
                    <label
                        className={[
                            'inline-flex cursor-pointer items-center gap-2',
                            'rounded-xl border border-[var(--border)]',
                            'px-3 py-2 text-sm font-medium',
                            'text-[var(--text-muted)] transition',
                            isProcessingPhoto
                                ? 'cursor-wait opacity-60'
                                : 'hover:bg-[var(--card)] hover:text-[var(--text)]',
                        ].join(' ')}
                    >
                        <ImagePlus size={16} />

                        {isProcessingPhoto
                            ? 'Обработка...'
                            : 'Добавить'}

                        <input
                            type="file"
                            accept="image/*"
                            onChange={onPhotoChange}
                            disabled={isProcessingPhoto}
                            className="hidden"
                        />
                    </label>
                )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-[var(--border)]/30 bg-[var(--card)]">
                <div className="aspect-[16/9] w-full">
                    {activePhoto ? (
                        <div className="relative h-full w-full">
                            <img
                                src={activePhoto}
                                alt={name || 'Фото жидкости'}
                                className="h-full w-full object-contain"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    onRemovePhoto(activePhotoIndex)
                                }
                                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur-sm transition hover:bg-[var(--danger)] active:scale-95"
                                title="Удалить фото"
                                aria-label="Удалить фото"
                            >
                                <Trash2 size={17} />
                            </button>
                        </div>
                    ) : (
                        <label className="flex h-full cursor-pointer flex-col items-center justify-center gap-2 text-[var(--text-dim)] transition hover:text-[var(--text-muted)]">
                            <ImagePlus size={32} />

                            <span className="text-sm">
                                Добавьте фото жидкости
                            </span>

                            <span className="text-xs">
                                До {MAX_PHOTOS} фотографий
                            </span>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={onPhotoChange}
                                disabled={isProcessingPhoto}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>
            </div>

            {photos.length > 0 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pt-2 pb-1">
                    {photos.map((photo, index) => (
                        <div
                            key={`${photo}-${index}`}
                            className="relative shrink-0"
                        >
                            <button
                                type="button"
                                onClick={() => onSelectPhoto(index)}
                                className={[
                                    'h-16 w-16 overflow-hidden rounded-xl border-2',
                                    'bg-[var(--card)] transition',
                                    index === activePhotoIndex
                                        ? 'border-[var(--btn-primary)]'
                                        : 'border-transparent hover:border-[var(--border)]',
                                ].join(' ')}
                                aria-label={`Выбрать фото ${index + 1}`}
                            >
                                <img
                                    src={photo}
                                    alt={`${name || 'Жидкость'} — фото ${index + 1}`}
                                    className="h-full w-full object-cover"
                                />
                            </button>

                            <button
                                type="button"
                                onClick={() => onRemovePhoto(index)}
                                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--danger)] text-white shadow-sm transition hover:opacity-90 active:scale-90"
                                title="Удалить фото"
                                aria-label={`Удалить фото ${index + 1}`}
                            >
                                <Trash2 size={11} />
                            </button>
                        </div>
                    ))}

                    {photos.length < MAX_PHOTOS && (
                        <label
                            className={[
                                'flex h-16 w-16 shrink-0 cursor-pointer',
                                'items-center justify-center rounded-xl',
                                'border border-dashed border-[var(--border)]',
                                'text-[var(--text-dim)] transition',
                                isProcessingPhoto
                                    ? 'cursor-wait opacity-60'
                                    : 'hover:bg-[var(--card)] hover:text-[var(--text-muted)]',
                            ].join(' ')}
                            title="Добавить фото"
                        >
                            <ImagePlus size={20} />

                            <input
                                type="file"
                                accept="image/*"
                                onChange={onPhotoChange}
                                disabled={isProcessingPhoto}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>
            )}
        </div>
    );
}