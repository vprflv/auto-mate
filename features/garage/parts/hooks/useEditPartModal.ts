'use client';

import { useEffect, useRef, useState } from 'react';
import { CarPartItem } from '@/types';
import { learnKeywords } from '@/features/garage/lib/userSubcategories';
import { getSubcategoriesFor } from '@/features/garage/lib/getSubcategories';

type Props = {
    item: CarPartItem | null;
    onSave: (item: CarPartItem) => void;
    onClose: () => void;
};

export function useEditPartModal({
                                     item,
                                     onSave,
                                     onClose,
                                 }: Props) {
    const [form, setForm] = useState<CarPartItem | null>(null);
    const [newSubOpen, setNewSubOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<
        'category' | 'subcategory' | null
    >(null);

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!item) {
            setForm(null);
            return;
        }

        const cloned = structuredClone(item);

        const category = cloned.category || 'maintenance';

        setForm({
            ...cloned,
            category,
            subcategory:
                cloned.subcategory ||
                getSubcategoriesFor(category)[0]?.id ||
                'other',
        });

        setOpenDropdown(null);
        setNewSubOpen(false);
    }, [item]);

    const set = (patch: Partial<CarPartItem>) => {
        setForm((prev) => (prev ? { ...prev, ...patch } : prev));
    };

    const subs = form ? getSubcategoriesFor(form.category) : [];

    const handleSave = () => {
        if (!form) return;

        if (form.subcategory?.startsWith('custom_')) {
            learnKeywords(form.subcategory, form.name);
        }

        if (!form.name.trim()) return;

        console.log('EDIT SAVE:', {
            form,
            saved: {
                ...form,
                name: form.name.trim(),
                brand: form.brand?.trim() || undefined,
                oemNumber: form.oemNumber?.trim() || undefined,
                analogNumber: form.analogNumber?.trim() || undefined,
                notes: form.notes?.trim() || undefined,
                quantity:
                    form.quantity && form.quantity > 0
                        ? form.quantity
                        : 1,
                subcategory: form.subcategory || 'other',
            },
        });

        onSave({
            ...form,
            name: form.name.trim(),
            brand: form.brand?.trim() || undefined,
            oemNumber: form.oemNumber?.trim() || undefined,
            analogNumber: form.analogNumber?.trim() || undefined,
            notes: form.notes?.trim() || undefined,
            quantity:
                form.quantity && form.quantity > 0
                    ? form.quantity
                    : 1,
            subcategory: form.subcategory || 'other',
        });

        onClose();
    };

    const handlePhotoChange = (file: File) => {
        const reader = new FileReader();

        reader.onload = () => {
            set({
                photo: reader.result as string,
            });
        };

        reader.readAsDataURL(file);
    };

    const removePhoto = () => {
        set({ photo: undefined });
    };

    const closeDropdown = () => {
        setOpenDropdown(null);
    };

    const toggleDropdown = (
        dropdown: 'category' | 'subcategory'
    ) => {
        setOpenDropdown((current) =>
            current === dropdown ? null : dropdown
        );
    };

    return {
        form,
        set,

        subs,

        newSubOpen,
        setNewSubOpen,

        openDropdown,
        setOpenDropdown,
        toggleDropdown,
        closeDropdown,
        dropdownRef,

        handleSave,
        handlePhotoChange,
        removePhoto,
    };
}