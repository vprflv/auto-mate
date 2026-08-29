import Link from 'next/link';

export default function GarageEmpty() {
    return (
        <div className="text-center py-24 bg-[#161616]/70 border border-[#2A2A2A] rounded-3xl">
            <div className="text-5xl mb-4">🚗</div>
            <h2 className="text-2xl font-semibold mb-2 text-[#F5F5F5]">Гараж пуст</h2>
            <p className="text-[#A3A3A3] mb-6 max-w-md mx-auto">
                Добавь свой первый автомобиль по VIN — и начни вести историю обслуживания
            </p>
            <Link
                href="/garage/add"
                className="inline-block bg-[#39FF14] text-black px-8 py-3 rounded-2xl font-medium hover:bg-[#57FF3A] transition shadow-[0_0_16px_rgba(57,255,20,0.25)]"
            >
                Добавить автомобиль
            </Link>
        </div>
    );
}