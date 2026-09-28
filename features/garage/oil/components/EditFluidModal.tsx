'use client';

import { X } from 'lucide-react';
import { useEditFluidModal } from '../hooks/useEditFluidModal';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { CarFluidItem } from '@/types/oil';
import FluidCategorySelect from '@/features/garage/oil/components/FluidCategorySelect';
import EditFluidField from './EditFluidField';
import EditFluidPhoto from './EditFluidPhoto';
import EditFluidModalActions from './EditFluidModalActions';
import EditFluidPhotoGallery from "@/features/garage/oil/components/EditFluidPhotoGallery";

type EditFluidModalProps = {
    open: boolean;
    item: CarFluidItem | null;
    onClose: () => void;
    onSave: (item: CarFluidItem) => void;
    onDelete?: (id: string) => void;

    customCategories: {
        id: string;
        label: string;
    }[];

    onCreateCategory: (name: string) => string | null;
};

export default function EditFluidModal({
                                           open,
                                           item,
                                           onClose,
                                           onSave,
                                           onDelete,
                                           customCategories,
                                           onCreateCategory,
                                       }: EditFluidModalProps) {
    const {
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
        photo,
        handlePhotoChange,
        removePhoto,
        isProcessingPhoto,
        isDropdownOpen,
        setIsDropdownOpen,
        dropdownRef,
        handleSubmit,
        photos,
        activePhotoIndex,
        selectPhoto,
    } = useEditFluidModal({
        open,
        item,
        onClose,
        onSave,

    });

    useBodyScrollLock(open);

    if (!open) {
        return null;
    }

    const handleDelete = () => {
        if (!item?.id || !onDelete) {
            return;
        }

        onDelete(item.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            {/* Overlay */}
            <div
                className="absolute inset-0 z-0 bg-black/50 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative z-10 flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-[var(--border)]/30 bg-[var(--card)] shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
                onClick={(event) => event.stopPropagation()}
            >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)]/20 px-5 py-4">
                    <h3 className="text-lg font-semibold text-[var(--text)]">
                        {item
                            ? 'Редактирование жидкости'
                            : 'Новая жидкость'}
                    </h3>

                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onClose();
                        }}
                        className="relative z-20 rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] active:scale-95"
                        aria-label="Закрыть"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                    <form
                        id="edit-fluid-form"
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        {item && (
                            <EditFluidPhotoGallery
                                name={name}
                                photos={photos}
                                activePhotoIndex={activePhotoIndex}
                                isProcessingPhoto={isProcessingPhoto}
                                onSelectPhoto={selectPhoto}
                                onPhotoChange={handlePhotoChange}
                                onRemovePhoto={removePhoto}
                            />
                        )}

                        <EditFluidField
                            id="fluid-name"
                            label="Название"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder="Например: Моторное масло"
                        />

                        <FluidCategorySelect
                            category={category}
                            setCategory={setCategory}
                            isDropdownOpen={isDropdownOpen}
                            setIsDropdownOpen={setIsDropdownOpen}
                            dropdownRef={dropdownRef}
                            customCategories={customCategories}
                            onCreateCategory={onCreateCategory}
                        />

                        <EditFluidField
                            id="fluid-brand"
                            label="Бренд"
                            value={brand}
                            onChange={(event) =>
                                setBrand(event.target.value)
                            }
                            placeholder="Например: Motul"
                        />

                        <EditFluidField
                            id="fluid-spec"
                            label="Спецификация"
                            value={spec}
                            onChange={(event) =>
                                setSpec(event.target.value)
                            }
                            placeholder="Например: 5W-30, API SP"
                        />

                        <EditFluidField
                            id="fluid-volume"
                            label="Объём"
                            value={volume}
                            onChange={(event) =>
                                setVolume(event.target.value)
                            }
                            placeholder="Например: 4.5 л"
                        />
                    </form>
                </div>

                {/* Footer */}
                <div className="flex shrink-0 gap-3 border-t border-[var(--border)]/20 bg-[var(--card)] px-5 py-4">
                    <EditFluidModalActions
                        isEditing={Boolean(item)}
                        canDelete={Boolean(onDelete)}
                        isProcessingPhoto={isProcessingPhoto}
                        onDelete={handleDelete}
                        onClose={onClose}
                    />
                </div>
            </div>
        </div>
    );
}