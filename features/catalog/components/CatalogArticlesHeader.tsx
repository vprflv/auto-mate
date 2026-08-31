type Props = {
    title: string;
    count: number;
    onReset?: () => void;
};

function plural(count: number) {
    if (count === 1) return 'позиция';
    if (count >= 2 && count <= 4) return 'позиции';
    return 'позиций';
}

export default function CatalogArticlesHeader({ title, count, onReset }: Props) {
    return (
        <div className="flex items-center justify-between gap-3 mb-5">
            <div>
                <h2 className="text-lg font-semibold text-[#F5F5F5]">{title}</h2>
                <p className="text-sm text-[#666666] mt-0.5">
                    {count} {plural(count)}
                </p>
            </div>
            {onReset && (
                <button
                    type="button"
                    onClick={onReset}
                    className="text-sm text-[#A3A3A3] hover:text-[#39FF14] transition"
                >
                    Сбросить
                </button>
            )}
        </div>
    );
}