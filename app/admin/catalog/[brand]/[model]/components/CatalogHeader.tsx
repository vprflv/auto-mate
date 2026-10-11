import Link from 'next/link';
import { ArrowLeft, CarFront } from 'lucide-react';

interface Props {
    brandTitle: string;
    modelTitle: string;
}

export function CatalogHeader({ brandTitle, modelTitle }: Props) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <Link
                    href="/admin/catalog"
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--text)]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Каталог моделей
                </Link>
                <span>/</span>
                <span className="text-[var(--text)] font-medium">
                    {brandTitle} {modelTitle}
                </span>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--border)]">
                    <CarFront className="h-7 w-7" />
                </div>

                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold tracking-tight text-[var(--text)]">
                            {brandTitle} {modelTitle}
                        </h2>
                        <span className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-muted)]">
                            База деталей
                        </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--text-dim)]">
                        Управление совместимостью, экспертная верификация и статистика установок
                    </p>
                </div>
            </div>
        </div>
    );
}