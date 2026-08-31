import Field from './Field';
import { EditCarFormValues } from '../types';

type Props = {
    form: EditCarFormValues;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export default function EditCarBasics({ form, onChange }: Props) {
    return (
        <section className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-[#F5F5F5]">Основное</h2>
            <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Марка" name="make" value={form.make} onChange={onChange} />
                <Field label="Модель" name="model" value={form.model} onChange={onChange} />
                <Field label="Год" name="year" type="number" value={form.year} onChange={onChange} />
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