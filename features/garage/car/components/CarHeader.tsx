import Link from 'next/link';

export default function CarHeader() {
    return (
        <header className="border-b border-zinc-800">
            <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
                <Link
                    href="/garage"
                    className="text-zinc-400 hover:text-white transition text-sm"
                >
                    ← Назад в гараж
                </Link>
                <Link href="/automa-te/public" className="font-bold text-lg">
                    AutoMate
                </Link>
            </div>
        </header>
    );
}