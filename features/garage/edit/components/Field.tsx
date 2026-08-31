type Props = {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    type?: string;
    maxLength?: number;
    mono?: boolean;
    textarea?: boolean;
    className?: string;
};

const inputClass =
    'w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-[#F5F5F5] placeholder:text-[#666666] focus:outline-none focus:border-[#39FF14] transition';

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
            <label className="block text-sm text-[#39FF14] mb-2">{label}</label>
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
                    className={`${inputClass} ${mono ? 'font-mono tracking-wide' : ''}`}
                />
            )}
        </div>
    );
}