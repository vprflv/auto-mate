'use client';

import { useEffect, useState, useRef } from 'react';
import { CarFluidItem, FluidCategory } from '@/types/oil';

type UseEditFluidModalProps = {
    open: boolean;
    item: CarFluidItem | null;
    onClose: () => void;
    onSave: (item: CarFluidItem) => void;
};

export function useEditFluidModal({ open, item, onClose, onSave }: UseEditFluidModalProps) {
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [spec, setSpec] = useState('');
    const [volume, setVolume] = useState('');
    const [category, setCategory] = useState<FluidCategory | string>('engineOil');

    // Стейт и реф для кастомного выпадающего списка
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // Синхронизация данных при открытии/смене элемента
    useEffect(() => {
        if (item) {
            setName(item.name);
            setBrand(item.brand || '');
            setSpec(item.spec || '');
            setVolume(item.volume || '');
            setCategory(item.category);
        } else {
            setName('');
            setBrand('');
            setSpec('');
            setVolume('');
            setCategory('engineOil');
        }
    }, [item, open]);

    // Закрытие селекта при клике вне его области
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as Node;
            if (target && dropdownRef.current && !dropdownRef.current.contains(target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        onSave({
            id: item?.id || crypto.randomUUID(),
            category,
            name: name.trim(),
            brand: brand.trim() || undefined,
            spec: spec.trim() || undefined,
            volume: volume.trim() || undefined,
            photo: item?.photo,
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
        isDropdownOpen,
        setIsDropdownOpen,
        dropdownRef,
        handleSubmit,
    };
}
