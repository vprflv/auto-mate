import Field from './Field';
import { EditCarFormValues } from '../types';

type Props = {
    form: EditCarFormValues;
    onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
};

export default function EditCarBasics({ form, onChange }: Props) {
    return (
        <section className="space-y-5 rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
            <h2 className="text-lg font-semibold text-[var(--text)]">
                Основное
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
                <Field
                    label="Марка"
                    name="make"
                    value={form.make}
                    onChange={onChange}
                />

                <Field
                    label="Модель"
                    name="model"
                    value={form.model}
                    onChange={onChange}
                />

                <Field
                    label="Год"
                    name="year"
                    type="number"
                    value={form.year}
                    onChange={onChange}
                />

                <Field
                    label="VIN"
                    name="vin"
                    value={form.vin}
                    onChange={onChange}
                    maxLength={17}
                    mono
                />
            </div>
        </section>
    );
}