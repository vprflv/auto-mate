import Link from 'next/link';

export default function GarageHeader() {
    return (
        <header className="border-b border-zinc-800">
            <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold">
                    AutoMate
                </Link>
                <nav className="flex items-center gap-6 text-sm text-zinc-400">
                    <Link href="/garage" className="text-white">
                        Гараж
                    </Link>
                    <Link href="/garage/add" className="hover:text-white transition">
                        Добавить авто
                    </Link>
                </nav>
            </div>
        </header>
    );
}