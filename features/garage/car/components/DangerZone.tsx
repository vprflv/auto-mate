type Props = {
    onDelete: () => void;
};

export default function DangerZone({ onDelete }: Props) {
    return (
        <section className="border border-red-900/40 bg-red-950/20 rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-red-400 mb-2">
                Опасная зона
            </h2>
            <p className="text-sm text-zinc-400 mb-4">
                Удаление автомобиля также удалит всю историю его обслуживания.
            </p>
            <button
                onClick={onDelete}
                className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-800 px-5 py-2.5 rounded-xl text-sm font-medium transition"
            >
                Удалить автомобиль
            </button>
        </section>
    );
}