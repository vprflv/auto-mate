import type { ChangeEvent } from 'react';

import Field from './Field';
import type { EditCarFormValues } from '../types';

interface Props {
    form: EditCarFormValues;
    onChange: (
        event: ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >
    ) => void;
}

const fields: {
    key: 'currentMileage' | 'cylinders' | 'doors' | 'plantCountry';
    label: string;
    placeholder: string;
}[] = [
    {
        key: 'currentMileage',
        label: 'Текущий пробег, км',
        placeholder: 'Например, 125000',
    },
    {
        key: 'cylinders',
        label: 'Количество цилиндров',
        placeholder: 'Например, 4',
    },
    {
        key: 'doors',
        label: 'Количество дверей',
        placeholder: 'Например, 5',
    },
    {
        key: 'plantCountry',
        label: 'Страна сборки',
        placeholder: 'Например, Китай',
    },
];

export default function EditCarExtra({
                                         form,
                                         onChange,
                                     }: Props) {
    return (
        <section className="space-y-5 rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
            <h2 className="text-lg font-semibold text-[var(--text)]">
                Дополнительно
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
                {fields.map(field => (
                    <Field
                        key={field.key}
                        label={field.label}
                        name={field.key}
                        value={form[field.key]}
                        onChange={onChange}
                        placeholder={field.placeholder}
                    />
                ))}
            </div>

            <Field
                label="Заметки"
                name="notes"
                value={form.notes}
                onChange={onChange}
                placeholder="Что важно помнить об автомобиле"
                textarea
            />
        </section>
    );
}