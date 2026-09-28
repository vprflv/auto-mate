import { ImagePlus, Trash2 } from 'lucide-react';

type EditFluidPhotoProps = {
    name: string;
    photo?: string;
    isProcessingPhoto: boolean;
    onPhotoChange: (
        event: React.ChangeEvent<HTMLInputElement>
    ) => void;
    onRemovePhoto: () => void;
};

export default function EditFluidPhoto({
                                           name,
                                           photo,
                                           isProcessingPhoto,
                                           onPhotoChange,
                                           onRemovePhoto,
                                       }: EditFluidPhotoProps) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--text-accent)]">
                Фото
            </label>

            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]">
                <div className="aspect-[16/9] w-full">
                    {photo ? (
                        <img
                            src={photo}
                            alt={name || 'Фото жидкости'}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2 text-[var(--text-dim)]">
                            <ImagePlus size={30} />

                            <span className="text-sm">
                                Фото не добавлено
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-2">
                <label
                    className={[
                        'inline-flex flex-1 cursor-pointer items-center',
                        'justify-center gap-2 rounded-xl border',
                        'border-[var(--border)] px-3 py-2.5',
                        'text-sm font-medium text-[var(--text-muted)]',
                        'transition',
                        isProcessingPhoto
                            ? 'cursor-wait opacity-60'
                            : 'hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]',
                    ].join(' ')}
                >
                    <ImagePlus size={17} />

                    {isProcessingPhoto
                        ? 'Обработка...'
                        : photo
                            ? 'Заменить фото'
                            : 'Добавить фото'}

                    <input
                        type="file"
                        accept="image/*"
                        onChange={onPhotoChange}
                        disabled={isProcessingPhoto}
                        className="hidden"
                    />
                </label>

                {photo && (
                    <button
                        type="button"
                        onClick={onRemovePhoto}
                        className="inline-flex items-center justify-center rounded-xl border border-[var(--danger)]/20 px-3 py-2.5 text-[var(--danger)] transition hover:bg-[var(--danger)]/10"
                        title="Удалить фото"
                        aria-label="Удалить фото"
                    >
                        <Trash2 size={17} />
                    </button>
                )}
            </div>
        </div>
    );
}