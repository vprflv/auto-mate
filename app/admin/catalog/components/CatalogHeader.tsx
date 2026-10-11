import Link from 'next/link';

interface Props {
    inboxCount: number;
}

export function CatalogHeader({ inboxCount }: Props) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 className="text-2xl font-bold text-[var(--text)]">
                    Каталог деталей по моделям
                </h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    База знаний совместимости, расходников и истории установок
                </p>
            </div>

            <Link
                href="/admin/catalog/inbox"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--bg-elevated)]"
            >
                <span>Модерация входящих</span>
                <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs ${
                        inboxCount > 0
                            ? 'bg-amber-500 font-bold text-white'
                            : 'bg-[var(--bg-elevated)] font-semibold text-[var(--text-dim)]'
                    }`}
                >
    {inboxCount}
</span>
            </Link>
        </div>
    );
}