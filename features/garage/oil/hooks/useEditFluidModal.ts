'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { CarFluidItem, FluidCategory } from '@/types/oil';

type UseEditFluidModalProps = {
    open: boolean;
    item: CarFluidItem | null;
    onClose: () => void;
    onSave: (item: CarFluidItem) => void;
};

const MAX_PHOTOS = 5;

async function compressImage(file: File): Promise<string> {
    const maxSize = 1000;
    const quality = 0.8;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const image = new Image();

            image.onload = () => {
                let { width, height } = image;

                if (width > maxSize || height > maxSize) {
                    const scale = Math.min(
                        maxSize / width,
                        maxSize / height
                    );

                    width = Math.round(width * scale);
                    height = Math.round(height * scale);
                }

                const canvas = document.createElement('canvas');

                canvas.width = width;
                canvas.height = height;

                const context = canvas.getContext('2d');

                if (!context) {
                    reject(new Error('Не удалось создать canvas'));
                    return;
                }

                context.drawImage(
                    image,
                    0,
                    0,
                    width,
                    height
                );

                resolve(
                    canvas.toDataURL('image/jpeg', quality)
                );
            };

            image.onerror = () => {
                reject(
                    new Error('Не удалось загрузить изображение')
                );
            };

            image.src = String(reader.result);
        };

        reader.onerror = () => {
            reject(
                new Error('Не удалось прочитать файл')
            );
        };

        reader.readAsDataURL(file);
    });
}

export function useEditFluidModal({
                                      open,
                                      item,
                                      onClose,
                                      onSave,
                                  }: UseEditFluidModalProps) {
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [spec, setSpec] = useState('');
    const [volume, setVolume] = useState('');

    const [category, setCategory] =
        useState<FluidCategory | string>('engineOil');

    const [photos, setPhotos] = useState<string[]>([]);
    const [activePhotoIndex, setActivePhotoIndex] =
        useState(0);

    const [isProcessingPhoto, setIsProcessingPhoto] =
        useState(false);

    const [isDropdownOpen, setIsDropdownOpen] =
        useState(false);

    const dropdownRef =
        useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (item) {
            setName(item.name);
            setBrand(item.brand || '');
            setSpec(item.spec || '');
            setVolume(item.volume || '');
            setCategory(item.category);

            const legacyPhoto = (
                item as CarFluidItem & {
                    photo?: string;
                }
            ).photo;

            const itemPhotos =
                Array.isArray(item.photos)
                    ? item.photos.filter(Boolean).slice(0, MAX_PHOTOS)
                    : legacyPhoto
                        ? [legacyPhoto]
                        : [];

            setPhotos(itemPhotos);
            setActivePhotoIndex(0);
        } else {
            setName('');
            setBrand('');
            setSpec('');
            setVolume('');
            setCategory('engineOil');
            setPhotos([]);
            setActivePhotoIndex(0);
        }

        setIsProcessingPhoto(false);
    }, [item, open]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target as Node;

            if (
                target &&
                dropdownRef.current &&
                !dropdownRef.current.contains(target)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener(
            'mousedown',
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                'mousedown',
                handleOutsideClick
            );
        };
    }, []);

    const handlePhotoChange = async (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            event.target.value = '';
            return;
        }

        if (photos.length >= MAX_PHOTOS) {
            event.target.value = '';
            return;
        }

        try {
            setIsProcessingPhoto(true);

            const compressedPhoto =
                await compressImage(file);

            setPhotos((prev) => {
                if (prev.length >= MAX_PHOTOS) {
                    return prev;
                }

                const next = [...prev, compressedPhoto];

                setActivePhotoIndex(next.length - 1);

                return next;
            });
        } catch {
            // Оставляем текущие фотографии без изменений.
        } finally {
            setIsProcessingPhoto(false);
            event.target.value = '';
        }
    };

    const selectPhoto = (index: number) => {
        setActivePhotoIndex(index);
    };

    const removePhoto = (index: number) => {
        setPhotos((prev) => {
            const next = prev.filter(
                (_, photoIndex) => photoIndex !== index
            );

            setActivePhotoIndex((currentIndex) => {
                if (next.length === 0) {
                    return 0;
                }

                if (index < currentIndex) {
                    return currentIndex - 1;
                }

                if (currentIndex >= next.length) {
                    return next.length - 1;
                }

                return currentIndex;
            });

            return next;
        });
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!name.trim()) {
            return;
        }

        onSave({
            id: item?.id || crypto.randomUUID(),
            category,
            name: name.trim(),
            brand: brand.trim() || undefined,
            spec: spec.trim() || undefined,
            volume: volume.trim() || undefined,
            photos: photos.length ? photos : undefined,
        });

        onClose();
    };

    return {
        name,
        setName,

        brand,
        setBrand,

        spec,
        setSpec,

        volume,
        setVolume,

        category,
        setCategory,

        photos,
        activePhotoIndex,
        selectPhoto,
        handlePhotoChange,
        removePhoto,
        isProcessingPhoto,

        isDropdownOpen,
        setIsDropdownOpen,
        dropdownRef,

        handleSubmit,
    };
}