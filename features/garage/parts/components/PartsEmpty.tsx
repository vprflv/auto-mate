type Props = {
    onEdit?: () => void;
};

export default function PartsEmpty({ onEdit }: Props) {
    return (
        <div className="text-center py-6">
            <p className="text-zinc-500 text-sm mb-1">Пока не указано</p>
            <p className="text-zinc-600 text-xs">
                Добавь фильтры, колодки, диски и другие расходники
            </p>
            {onEdit && (
                <button
                    type="button"
                    onClick={onEdit}
                    className="mt-4 text-sm text-white underline"
                >
                    Заполнить
                </button>
            )}
        </div>
    );
}