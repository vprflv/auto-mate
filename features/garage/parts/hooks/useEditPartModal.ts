'use client';

import { useEffect, useRef, useState } from 'react';
import { CarPartItem } from '@/types';
import { learnKeywords } from '@/features/garage/lib/userSubcategories';
import { getSubcategoriesFor } from '@/features/garage/lib/getSubcategories';
import {formatPartNameWithInstallation, suggestServicePartName} from "@/features/garage/add/lib/suggestServicePartName";

type Props = {
    item: CarPartItem | null;
    onSave: (item: CarPartItem) => void;
    onClose: () => void;
};


function getAutomaticPartName(item: CarPartItem): string {
    const baseName = suggestServicePartName({
        itemType: 'part',
        partCategory: item.category,
        subcategory: item.subcategory || 'other',
        fluidCategory: 'engineOil',
    });

    return formatPartNameWithInstallation(baseName, item);
}

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
    const nameEditedManually = useRef(false);
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
        nameEditedManually.current = false;

        if (!item) {
            setForm(null);
            return;
        }

        const cloned = structuredClone(item);
        const category = cloned.category || 'maintenance';

        const initialForm: CarPartItem = {
            ...cloned,
            category,
            subcategory:
                cloned.subcategory ||
                getSubcategoriesFor(category)[0]?.id ||
                'other',
        };

        setForm({
            ...initialForm,
            name:
                initialForm.name.trim()
                    ? initialForm.name
                    : getAutomaticPartName(initialForm),
        });

        setOpenDropdown(null);
        setNewSubOpen(false);
    }, [item]);

    const set = (patch: Partial<CarPartItem>) => {
        if ('name' in patch) {
            nameEditedManually.current = true;
        }

        const canUpdateName = !nameEditedManually.current;
        const classificationChanged =
            'category' in patch ||
            'subcategory' in patch ||
            'axle' in patch ||
            'side' in patch;

        setForm(previous => {
            if (!previous) return previous;

            const updated = { ...previous, ...patch };

            if (!canUpdateName || !classificationChanged) {
                return updated;
            }

            const previousSuggestion =
                getAutomaticPartName(previous);

            if (
                previous.name.trim() &&
                previous.name !== previousSuggestion
            ) {
                return updated;
            }

            return {
                ...updated,
                name: getAutomaticPartName(updated),
            };
        });
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