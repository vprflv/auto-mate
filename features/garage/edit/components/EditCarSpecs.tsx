import Field from './Field';
import { EditCarFormValues } from '../types';

type Props = {
    form: EditCarFormValues;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export default function EditCarSpecs({ form, onChange }: Props) {
    return (
        <section className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-[#F5F5F5]">Технические характеристики</h2>
            <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Кузов" name="bodyClass" value={form.bodyClass} onChange={onChange} />
                <Field
                    label="Объём двигателя (л)"
                    name="displacementL"
                    value={form.displacementL}
                    onChange={onChange}
                />
                <Field label="Цилиндры" name="cylinders" value={form.cylinders} onChange={onChange} />
                <Field label="Двигатель" name="engine" value={form.engine} onChange={onChange} />
                <Field label="Топливо" name="fuel" value={form.fuel} onChange={onChange} />
                <Field label="Привод" name="driveType" value={form.driveType} onChange={onChange} />
                <Field
                    label="КПП"
                    name="transmission"
                    value={form.transmission}
                    onChange={onChange}
                />
                <Field label="Двери" name="doors" value={form.doors} onChange={onChange} />
                <Field
                    label="Страна сборки"
                    name="plantCountry"
                    value={form.plantCountry}
                    onChange={onChange}
                    className="sm:col-span-2"
                />
            </div>
        </section>
    );
}