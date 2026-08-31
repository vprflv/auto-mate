import Field from './Field';
import { EditCarFormValues } from '../types';

type Props = {
    form: EditCarFormValues;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export default function EditCarExtra({ form, onChange }: Props) {
    return (
        <section className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-[#F5F5F5]">Дополнительно (вручную)</h2>
            <div className="grid gap-5 sm:grid-cols-2">
                <Field
                    label="Прозвище"
                    name="nickname"
                    value={form.nickname}
                    onChange={onChange}
                    placeholder="Например: Белая стрела"
                />
                <Field
                    label="Цвет"
                    name="color"
                    value={form.color}
                    onChange={onChange}
                    placeholder="Чёрный, белый..."
                />
                <Field
                    label="Текущий пробег (км)"
                    name="currentMileage"
                    type="number"
                    value={form.currentMileage}
                    onChange={onChange}
                    placeholder="125000"
                />
            </div>
            <Field
                label="Заметки"
                name="notes"
                value={form.notes}
                onChange={onChange}
                placeholder="Особенности, комплектация, что важно помнить..."
                textarea
            />
        </section>
    );
}