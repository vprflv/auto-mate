import Link from 'next/link';

export default function CarHeader() {
    return (
        <header className="border-b border-[#2A2A2A] bg-[#0A0A0A]/80 backdrop-blur-md">
            <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
                <Link
                    href="/garage"
                    className="text-[#A3A3A3] hover:text-[#39FF14] transition text-sm"
                >
                    ← Назад в гараж
                </Link>
                <Link href="/automa-te/public" className="font-bold text-lg text-[#F5F5F5] hover:text-[#39FF14] transition">
                    AutoMate
                </Link>
            </div>
        </header>
    );
}