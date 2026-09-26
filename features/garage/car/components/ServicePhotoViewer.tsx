
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    ChevronLeft,
    ChevronRight,
    X,
} from 'lucide-react';

type Props = {
    photos: string[];
};

export default function ServicePhotoViewer({
    photos,
}: Props) {
    const [activeIndex, setActiveIndex] = useState<
        number | null
    >(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const close = () => {
        setActiveIndex(null);
    };

    const showPrevious = () => {
        setActiveIndex((current) => {
            if (current === null) return null;

            return current === 0
                ? photos.length - 1
                : current - 1;
        });
    };

    const showNext = () => {
        setActiveIndex((current) => {
            if (current === null) return null;

            return current === photos.length - 1
                ? 0
                : current + 1;
        });
    };

    useEffect(() => {
        if (activeIndex === null) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                close();
            }

            if (
                event.key === 'ArrowLeft' &&
                photos.length > 1
            ) {
                showPrevious();
            }

            if (
                event.key === 'ArrowRight' &&
                photos.length > 1
            ) {
                showNext();
            }
        };

        document.addEventListener(
            'keydown',
            handleKeyDown
        );

        const originalOverflow =
            document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener(
                'keydown',
                handleKeyDown
            );

            document.body.style.overflow =
                originalOverflow;
        };
    }, [activeIndex, photos.length]);

    if (photos.length === 0) {
        return null;
    }

    return (
        <>
            <div className="mt-4 border-t border-[var(--border)]/20 pt-4">
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-[var(--text-muted)]">
                        Фото
                    </p>

                    <span className="text-xs text-[var(--text-dim)]">
                        {photos.length}{' '}
                        {photos.length === 1
                            ? 'фото'
                            : 'фото'}
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {photos.map((photo, index) => (
                        <button
                            key={`${photo}-${index}`}
                            type="button"
                            onClick={() =>
                                setActiveIndex(index)
                            }
                            className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--border)]/30 bg-[var(--bg-elevated)] transition-all duration-200 hover:border-[var(--link)]/50 hover:shadow-md active:scale-[0.98]"
                        >
                            <img
                                src={photo}
                                alt={`Фото ${index + 1}`}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />

                            <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />
                        </button>
                    ))}
                </div>
            </div>

            {mounted &&
                activeIndex !== null &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-8"
                        onClick={close}
                    >
                        <div
                            className="relative flex h-full w-full items-center justify-center"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >
                            <img
                                src={photos[activeIndex]}
                                alt={`Фото ${
    activeIndex + 1
}`}
                                className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
                            />

                            <button
                                type="button"
                                onClick={close}
                                className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-black/80 active:scale-95"
                                title="Закрыть"
                                aria-label="Закрыть галерею"
                            >
                                <X
                                    size={20}
                                    strokeWidth={2}
                                />
                            </button>

                            {photos.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={
                                            showPrevious
                                        }
                                        className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-black/80 active:scale-95 sm:left-5"
                                        title="Предыдущее фото"
                                        aria-label="Предыдущее фото"
                                    >
                                        <ChevronLeft
                                            size={24}
                                        />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={showNext}
                                        className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-black/80 active:scale-95 sm:right-5"
                                        title="Следующее фото"
                                        aria-label="Следующее фото"
                                    >
                                        <ChevronRight
                                            size={24}
                                        />
                                    </button>

                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white shadow-lg backdrop-blur-sm">
                                        {activeIndex + 1} /{' '}
                                        {photos.length}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}

