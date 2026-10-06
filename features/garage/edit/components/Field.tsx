type Props = {
    label: string;
    name: string;
    value: string;
    onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    placeholder?: string;
    type?: string;
    maxLength?: number;
    mono?: boolean;
    textarea?: boolean;
    className?: string;
};

const inputClass =
    'w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-dim)] transition-colors focus:border-[var(--link)] focus:outline-none';

export default function Field({
                                  label,
                                  name,
                                  value,
                                  onChange,
                                  placeholder,
                                  type = 'text',
                                  maxLength,
                                  mono,
                                  textarea,
                                  className,
                              }: Props) {
    return (
        <div className={className}>
            <label className="mb-2 block text-sm text-[var(--link)]">
                {label}
            </label>

            {textarea ? (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    rows={3}
                    placeholder={placeholder}
                    className={`${inputClass} resize-none`}
                />
            ) : (
                <input
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className={`${inputClass} ${
                        mono ? 'font-mono tracking-wide' : ''
                    }`}
                />
            )}
        </div>
    );
}