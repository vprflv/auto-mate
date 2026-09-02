type Props = {
    title: string;
    date: string;
    mileage: string;
    description: string;
    cost: string;
    onTitleChange: (v: string) => void;
    onDateChange: (v: string) => void;
    onMileageChange: (v: string) => void;
    onDescriptionChange: (v: string) => void;
    onCostChange: (v: string) => void;
};

const inputClass =
    'w-full bg-[#161616] border border-[#2A2A2A] rounded-2xl px-5 py-4 text-[#F5F5F5] placeholder:text-[#666666] focus:outline-none focus:border-[#39FF14] transition';

export default function ServiceMainFields({
                                              title,
                                              date,
                                              mileage,
                                              description,
                                              cost,
                                              onTitleChange,
                                              onDateChange,
                                              onMileageChange,
                                              onDescriptionChange,
                                              onCostChange,
                                          }: Props) {
    return (
        <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6 space-y-5">
            <div>
                <label className="block text-sm text-[#39FF14] mb-2">Название работы</label>
                <input
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    required
                    placeholder="Замена масла, колодки, диагностика..."
                    className={inputClass}
                />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label className="block text-sm text-[#39FF14] mb-2">Дата</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => onDateChange(e.target.value)}
                        required
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className="block text-sm text-[#39FF14] mb-2">Пробег (км)</label>
                    <input
                        type="number"
                        value={mileage}
                        onChange={(e) => onMileageChange(e.target.value)}
                        placeholder="125000"
                        className={inputClass}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm text-[#39FF14] mb-2">Комментарий</label>
                <textarea
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    rows={3}
                    placeholder="Что ещё важно помнить..."
                    className={`${inputClass} resize-none`}
                />
            </div>

            <div>
                <label className="block text-sm text-[#39FF14] mb-2">Стоимость (₽)</label>
                <input
                    type="number"
                    value={cost}
                    onChange={(e) => onCostChange(e.target.value)}
                    placeholder="4500"
                    className={inputClass}
                />
            </div>
        </div>
    );
}