import Link from 'next/link';

export default function CarHeader() {
    return (
        /*
          Сделали бэкграунд абсолютно прозрачным (bg-transparent).
          Никаких рамок, полос и отдельных цветов — шапка полностью сливается с основным фоном.
        */
        <header className="bg-transparent sticky top-0 z-50 w-full">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">

                {/*
                  Ссылка назад на чистом прозрачном фоне:
                  В светлой теме ховер станет оранжевым, в тёмной — неоново-зелёным.
                */}
                <Link
                    href="/garage"
                    className="inline-flex items-center gap-1.5 text-[var(--text-muted)] transition-colors duration-200 text-sm font-medium hover:text-[var(--link)] cursor-pointer active:scale-95"
                >
                    ← Назад в гараж
                </Link>

            </div>
        </header>
    );
}
