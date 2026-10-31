'use client';

import {
    useEffect,
    useId,
    useRef,
    useState,
} from 'react';

import type { ReactNode } from 'react';

import { Check, Plus, X } from 'lucide-react';

import type { FluidCategoryOption } from '../hooks/useCarFluidsCard';
import {CarFluidItem} from "@/types/oil";

function FluidDialog({
                         open,
                         title,
                         onClose,
                         children,
                     }: {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
}) {
    const ref = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = ref.current;

        if (!dialog) return;

        if (open && !dialog.open) {
            dialog.showModal();
        }

        if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    return (
        <dialog
            ref={ref}
            aria-labelledby={titleId}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            style={{
                width: 'calc(100% - 2rem)',
            }}
            className="fixed inset-0 m-auto max-h-[90dvh] max-w-md overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 text-[var(--text)] backdrop:bg-black/60 backdrop:backdrop-blur-sm"
        >
            <div className="mb-5 flex items-center justify-between gap-3">
                <h3
                    id={titleId}
                    className="text-lg font-semibold"
                >
                    {title}
                </h3>

                <button
                    type="button"
                    aria-label="Закрыть"
                    onClick={onClose}
                    className="rounded-lg p-2"
                >
                    <X size={20} aria-hidden="true" />
                </button>
            </div>

            {children}
        </dialog>
    );
}

export function FluidCategoryCreateModal({
                                             open,
                                             options,
                                             activeIds,
                                             onClose,
                                             onSelect,
                                             onCreate,
                                         }: {
    open: boolean;
    options: FluidCategoryOption[];
    activeIds: string[];
    onClose: () => void;
    onSelect: (id: string) => boolean;
    onCreate: (name: string) => string | null;
}) {
    const [name, setName] = useState('');
    const inputId = useId();

    useEffect(() => {
        if (open) setName('');
    }, [open]);

    return (
        <FluidDialog
            open={open}
            title="Добавить категорию"
            onClose={onClose}
        >
            <div className="space-y-2">
                {options.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                            if (onSelect(option.id)) {
                                onClose();
                            }
                        }}
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-left text-sm"
                    >
                        <span>
                            {option.isCustom && '★ '}
                            {option.label}
                        </span>

                        {activeIds.includes(option.id) ? (
                            <span className="flex shrink-0 items-center gap-1 text-xs text-[var(--text-muted)]">
                                <Check
                                    size={14}
                                    aria-hidden="true"
                                />
                                Уже есть
                            </span>
                        ) : (
                            <Plus
                                size={17}
                                className="shrink-0"
                                aria-hidden="true"
                            />
                        )}
                    </button>
                ))}
            </div>

            <form
                className="mt-5 space-y-3"
                onSubmit={(event) => {
                    event.preventDefault();

                    if (onCreate(name)) {
                        onClose();
                    }
                }}
            >
                <label
                    htmlFor={inputId}
                    className="block text-sm text-[var(--text-muted)]"
                >
                    Своя категория
                </label>

                <input
                    id={inputId}
                    value={name}
                    onChange={(event) =>
                        setName(event.target.value)
                    }
                    placeholder="Например, Омывающая жидкость"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-base"
                />

                <button
                    type="submit"
                    disabled={!name.trim()}
                    className="w-full rounded-xl bg-[var(--btn-primary)] px-4 py-3 text-sm font-medium text-[var(--btn-primary-text)] disabled:opacity-40"
                >
                    Добавить категорию
                </button>
            </form>
        </FluidDialog>
    );
}

export function FluidCategoryDeleteModal({
                                             target,
                                             onClose,
                                             onConfirm,
                                         }: {
    target?: FluidCategoryOption;
    onClose: () => void;
    onConfirm: () => boolean;
}) {
    const count = target?.count ?? 0;

    return (
        <FluidDialog
            open={Boolean(target)}
            title={`Удалить категорию «${target?.label ?? ''}»?`}
            onClose={onClose}
        >
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                {count > 0
                    ? 'Сначала перенесите жидкости в другую категорию или удалите их по отдельности. Непустую категорию удалить нельзя.'
                    : 'Пустая категория исчезнет только у этого автомобиля. Позже её можно добавить снова. Другие автомобили останутся без изменений.'}
            </p>

            <p className="mt-4 rounded-xl bg-[var(--bg-elevated)] p-3 text-sm">
                Позиций внутри: <strong>{count}</strong>
            </p>

            <div className="mt-5 flex gap-3">
                <button
                    type="button"
                    autoFocus
                    onClick={onClose}
                    className="flex-1 rounded-xl bg-[var(--bg-elevated)] px-4 py-3 text-sm"
                >
                    Отмена
                </button>

                <button
                    type="button"
                    disabled={count > 0}
                    onClick={() => {
                        if (onConfirm()) onClose();
                    }}
                    className="flex-1 rounded-xl bg-[var(--danger)] px-4 py-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Удалить
                </button>
            </div>
        </FluidDialog>
    );
}

export function FluidDeleteModal({
                                     target,
                                     onClose,
                                     onConfirm,
                                 }: {
    target?: CarFluidItem;
    onClose: () => void;
    onConfirm: () => boolean;
}) {
    return (
        <FluidDialog
            open={Boolean(target)}
            title="Удалить жидкость?"
            onClose={onClose}
        >
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                Запись «{target?.name ?? ''}» будет удалена
                из личного каталога этого автомобиля.
                Категория сохранится.
            </p>

            <div className="mt-5 flex gap-3">
                <button
                    type="button"
                    autoFocus
                    onClick={onClose}
                    className="flex-1 rounded-xl bg-[var(--bg-elevated)] px-4 py-3 text-sm"
                >
                    Отмена
                </button>

                <button
                    type="button"
                    disabled={!target}
                    onClick={() => {
                        if (onConfirm()) onClose();
                    }}
                    className="flex-1 rounded-xl bg-[var(--danger)] px-4 py-3 text-sm text-white disabled:opacity-40"
                >
                    Удалить
                </button>
            </div>
        </FluidDialog>
    );
}