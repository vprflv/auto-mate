import type { InputHTMLAttributes } from 'react';

type EditFluidFieldProps = {
    id: string;
    label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function EditFluidField({
                                           id,
                                           label,
                                           ...inputProps
                                       }: EditFluidFieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={id}
                className="text-sm font-medium text-[var(--text-accent)]"
            >
                {label}
            </label>

            <input
                id={id}
                {...inputProps}
                className={[
                    'rounded-xl border border-[var(--border)]',
                    'bg-[var(--bg-elevated)] px-3 py-2.5',
                    'text-[var(--text)] outline-none transition',
                    'placeholder:text-[var(--text-dim)]',
                    'focus:border-[var(--btn-primary)]',
                    inputProps.className,
                ]
                    .filter(Boolean)
                    .join(' ')}
            />
        </div>
    );
}