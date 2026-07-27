import Link from 'next/link';

export default function GarageEmpty() {
    return (
        <div className="text-center py-24 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
            <div className="text-5xl mb-4">🚗</div>
            <h2 className="text-2xl font-semibold mb-2">Гараж пуст</h2>
            <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                Добавь свой первый автомобиль по VIN — и начни вести историю обслуживания
            </p>
            <Link
                href="/garage/add"
                className="inline-block bg-white text-black px-8 py-3 rounded-2xl font-medium hover:bg-zinc-200 transition"
            >
                Добавить автомобиль
            </Link>
        </div>
    );
}