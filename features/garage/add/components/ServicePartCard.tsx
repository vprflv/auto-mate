
'use client';

import { useState } from 'react';

import { PartForm } from '@/features/garage/add/types/serviceForm';
import { PartCategory } from '@/types';
import {
    addUserCategory,
} from '@/features/garage/lib/userCategories';
import {
    addUserSubcategory,
} from '@/features/garage/lib/userSubcategories';
import NamePromptModal from '@/features/garage/parts/components/NamePromptModal';
import ServicePartClassification from './ServicePartClassification';
import ServicePartDetails from './ServicePartDetails';
import {addUserFluidCategory} from "@/features/garage/lib/userFluidCategories";

type Props = {
    part: PartForm;
    index: number;
    onChange: (
        id: string,
        field: keyof PartForm,
        value: string
    ) => void;
    onRemove: (id: string) => void;
};

export default function ServicePartCard({
    part,
    index,
    onChange,
    onRemove,
}: Props) {
    const [, setTick] = useState(0);

    const [namePrompt, setNamePrompt] = useState<
        'category' | 'subcategory' | null
    >(null);

    const refresh = () => {
        setTick((value) => value + 1);
    };

    const createCategory = (name: string) => {
        if (part.itemType === 'fluid') {
            const created = addUserFluidCategory(name);

            onChange(
                part.id,
                'fluidCategory',
                created.key
            );

            refresh();

            return;
        }

        const created = addUserCategory(name);

        onChange(
            part.id,
            'partCategory',
            created.key
        );

        onChange(
            part.id,
            'subcategory',
            'other'
        );

        refresh();
    };

    const createSubcategory = (name: string) => {
        const created = addUserSubcategory(
            part.partCategory as PartCategory,
            name
        );

        onChange(
            part.id,
            'subcategory',
            created.key
        );

        refresh();
    };

    const handlePromptSubmit = (name: string) => {
        if (namePrompt === 'category') {
            createCategory(name);
        }

        if (namePrompt === 'subcategory') {
            createSubcategory(name);
        }

        setNamePrompt(null);
    };

    return (
        <div className="space-y-4 rounded-2xl border border-[var(--border)]/30 bg-[var(--bg-elevated)]/40 p-4 transition-colors duration-200 sm:p-5">
            <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-[var(--text-muted)]">
                    Расходник #{index + 1}
                </span>

                <button
                    type="button"
                    onClick={() => onRemove(part.id)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--text-dim)] transition-all duration-200 hover:bg-[var(--danger)]/10 hover:text-[var(--danger)] active:scale-95"
                >
                    Удалить
                </button>
            </div>

            <ServicePartClassification
                part={part}
                onChange={onChange}
                onCreateCategory={() =>
                    setNamePrompt('category')
                }
                onCreateSubcategory={() =>
                    setNamePrompt('subcategory')
                }
            />

            <ServicePartDetails
                part={part}
                onChange={onChange}
            />

            <NamePromptModal
                open={!!namePrompt}
                title={
                    namePrompt === 'subcategory'
                        ? 'Новая подкатегория'
                        : 'Новая категория'
                }
                placeholder={
                    namePrompt === 'subcategory'
                        ? 'Колодки, диски…'
                        : 'Электрика, салон…'
                }
                onClose={() => setNamePrompt(null)}
                onSubmit={handlePromptSubmit}
            />
        </div>
    );
}

