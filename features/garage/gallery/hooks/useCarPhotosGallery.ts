'use client';

import { useState } from 'react';
import { toast } from 'sonner';

type Params = {
    photos: string[];
    onUpdatePhotos: (photos: string[]) => void;
};

export function useCarPhotosGallery({ photos, onUpdatePhotos }: Params) {
    const [activeIndex, setActiveIndex] = useState(0);

    const addPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            const next = [...photos, base64];
            onUpdatePhotos(next);
            setActiveIndex(next.length - 1);
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

    const confirmRemovePhoto = (index: number) => {
        toast.warning('Удалить это фото?', {
            description: 'Фото будет убрано из галереи автомобиля.',
            duration: Infinity,
            action: {
                label: 'Удалить',
                onClick: () => {
                    removePhoto(index);
                    toast.success('Фото удалено');
                },
            },
            cancel: {
                label: 'Отмена',
                onClick: () => {},
            },
        });
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

    return {
        activeIndex,
        setActiveIndex,
        addPhoto,
        confirmRemovePhoto,
        setAsMain,
        prev,
        next,
    };
}