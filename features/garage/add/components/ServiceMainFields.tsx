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
        <>
            <div>
                <label className="block text-sm text-zinc-400 mb-2">Название работы</label>
                <input
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    required
                    placeholder="Замена масла, колодки, диагностика..."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500"
                />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label className="block text-sm text-zinc-400 mb-2">Дата</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => onDateChange(e.target.value)}
                        required
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm text-zinc-400 mb-2">Пробег (км)</label>
                    <input
                        type="number"
                        value={mileage}
                        onChange={(e) => onMileageChange(e.target.value)}
                        placeholder="125000"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm text-zinc-400 mb-2">Комментарий</label>
                <textarea
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    rows={3}
                    placeholder="Что ещё важно помнить..."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 resize-none"
                />
            </div>

            <div>
                <label className="block text-sm text-zinc-400 mb-2">Стоимость (₽)</label>
                <input
                    type="number"
                    value={cost}
                    onChange={(e) => onCostChange(e.target.value)}
                    placeholder="4500"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500"
                />
            </div>
        </>
    );
}