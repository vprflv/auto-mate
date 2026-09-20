import Link from 'next/link';

type Props = {
    carsLabel: string;
};

export default function GarageTitle({ carsLabel }: Props) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
                <h1 className="text-4xl font-bold text-[var(--text)]">Мой Гараж</h1>
                <p className="text-[var(--text-muted)] mt-1">{carsLabel}</p>
            </div>

            <Link
                href="/garage/add"
                className="inline-flex items-center justify-center bg-[var(--btn-primary)] text-[var(--btn-primary-text)] px-6 py-3 rounded-2xl font-medium transition-all duration-200 hover:bg-[var(--btn-primary-hover)] cursor-pointer active:scale-95 [html[data-theme=dark]_&]:shadow-[0_0_16px_rgba(57,255,20,0.25)]"
            >
                + Добавить автомобиль
            </Link>
        </div>
    );
}
