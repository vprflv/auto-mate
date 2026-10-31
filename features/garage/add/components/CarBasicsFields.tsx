import type { ManualCarForm } from '@/types';

interface Props {
    form: ManualCarForm;
    onChange: (
        field: keyof ManualCarForm,
        value: string
    ) => void;
}

interface Field {
    key: 'year' | 'color' | 'nickname';
    label: string;
    placeholder: string;
    required?: boolean;
    fullWidth?: boolean;
}

const fields: Field[] = [
    {
        key: 'year',
        label: 'Год выпуска',
        placeholder: 'Например, 2023',
        required: true,
    },
    {
        key: 'color',
        label: 'Цвет',
        placeholder: 'Например, белый',
    },
    {
        key: 'nickname',
        label: 'Прозвище',
        placeholder: 'Как называете свой автомобиль?',
        fullWidth: true,
    },
];

const inputClassName =
    'w-full rounded-xl border border-[var(--border)] ' +
    'bg-[var(--bg-elevated)] px-4 py-3 text-[var(--text)] ' +
    'placeholder:text-[var(--text-dim)] outline-none transition ' +
    'focus:border-[var(--link)] focus:ring-2 ' +
    'focus:ring-[var(--link)]/10';

export function CarBasicsFields({ form, onChange }: Props) {
    function handleChange(field: Field['key'], value: string) {
        if (field === 'year' && !/^\d{0,4}$/.test(value)) {
            return;
        }

        onChange(field, value);
    }

    return (
        <section className="space-y-5 rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
            <h2 className="text-lg font-semibold text-[var(--text)]">
                Данные автомобиля
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
                {fields.map(field => {
                    const isYear = field.key === 'year';

                    return (
                        <label
                            key={field.key}
                            className={`block space-y-2 ${
                                field.fullWidth
                                    ? 'sm:col-span-2'
                                    : ''
                            }`}
                        >
                            <span className="block text-sm font-medium text-[var(--text)]">
                                {field.label}
                                {field.required && ' *'}
                            </span>

                            <input
                                type="text"
                                inputMode={
                                    isYear ? 'numeric' : undefined
                                }
                                maxLength={isYear ? 4 : undefined}
                                pattern={
                                    isYear ? '[0-9]{4}' : undefined
                                }
                                title={
                                    isYear
                                        ? 'Введите год из четырёх цифр'
                                        : undefined
                                }
                                value={form[field.key]}
                                required={field.required}
                                placeholder={field.placeholder}
                                onChange={event =>
                                    handleChange(
                                        field.key,
                                        event.target.value
                                    )
                                }
                                className={inputClassName}
                            />
                        </label>
                    );
                })}
            </div>
        </section>
    );
}