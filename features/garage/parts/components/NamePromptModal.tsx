'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

type Props = {
    open: boolean;
    title: string;
    placeholder?: string;
    confirmLabel?: string;
    onClose: () => void;
    onSubmit: (name: string) => void;
};

export default function NamePromptModal({
                                            open,
                                            title,
                                            placeholder = 'Название',
                                            confirmLabel = 'Создать',
                                            onClose,
                                            onSubmit,
                                        }: Props) {
    const [value, setValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) return;
        setValue('');
        const t = window.setTimeout(() => inputRef.current?.focus(), 50);
        return () => window.clearTimeout(t);
    }, [open]);

    if (!open) return null;

    const submit = () => {
        const name = value.trim();
        if (!name) return;
        onSubmit(name);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-[#161616] border border-[#2A2A2A] rounded-3xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
                <h3 className="text-base font-semibold text-[#F5F5F5] mb-4">{title}</h3>

                <label className="block text-xs text-[#39FF14] mb-1.5">Название</label>
                <input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            submit();
                        }
                    }}
                    placeholder={placeholder}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F5] placeholder:text-[#666666] outline-none focus:border-[#39FF14]"
                />

                <div className="flex gap-3 mt-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl bg-[#1F1F1F] hover:bg-[#2A2A2A] text-sm text-[#F5F5F5] transition"
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        disabled={!value.trim()}
                        className="flex-1 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#57FF3A] disabled:opacity-40 text-sm font-medium text-black transition"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}