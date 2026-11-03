'use client';

import { useEffect, useRef, useState } from 'react';

export function useCatalogArticleDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const dialog = dialogRef.current;

        if (!dialog) return;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        if (!dialog.open) {
            dialog.showModal();
        }

        return () => {
            if (dialog.open) {
                dialog.close();
            }

            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    return {
        isOpen,
        dialogRef,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
    };
}