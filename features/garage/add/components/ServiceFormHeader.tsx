import Link from 'next/link';

type Props = {
    carId: string;
};

export default function ServiceFormHeader({ carId }: Props) {
    return (
        <header className="border-b border-zinc-800">
            <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
                <Link
                    href={`/garage/${carId}`}
                    className="text-zinc-400 hover:text-white transition text-sm"
                >
                    ← Назад к авто
                </Link>
                <span className="font-semibold">Новая запись ТО</span>
            </div>
        </header>
    );
}