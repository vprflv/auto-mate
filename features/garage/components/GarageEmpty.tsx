import Link from 'next/link';

export default function GarageEmpty() {
    return (
        /*
           Заменили фоны и бордеры на переменные.
           Вместо bg-[#161616]/70 теперь используется var(--bg-elevated) с прозрачностью,
           чтобы на кремовом фоне светлой темы плашка выглядела как чистый белый полупрозрачный слой.
        */
        <div className="text-center py-24 bg-[var(--bg-elevated)]/70 border border-[var(--border)]/60 rounded-3xl backdrop-blur-sm">
            <div className="text-5xl mb-4">🚗</div>

            {/* Текст адаптируется под основную и приглушенную палитру темы */}
            <h2 className="text-2xl font-semibold mb-2 text-[var(--text)]">Гараж пуст</h2>
            <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto px-4">
                Добавь свой первый автомобиль по VIN — и начни вести историю обслуживания
            </p>

            {/*
               Кнопка использует созданные нами глобальные CSS-токены.
               В светлой теме она будет оранжевой, в тёмной — неоново-зелёной.
               Свечение (shadow) включается только для тёмного режима.
            */}
            <Link
                href="/garage/add"
                className="inline-block bg-[var(--btn-primary)] text-[var(--btn-primary-text)] px-8 py-3 rounded-2xl font-medium transition-all duration-200 hover:bg-[var(--btn-primary-hover)] cursor-pointer active:scale-95 [html[data-theme=dark]_&]:shadow-[0_0_16px_rgba(57,255,20,0.25)]"
            >
                Добавить автомобиль
            </Link>
        </div>
    );
}
