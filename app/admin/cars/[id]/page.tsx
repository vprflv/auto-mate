import Link from 'next/link';
import { ArrowLeft, CarFront } from 'lucide-react';

export default async function AdminCarPage({
                                               params,
                                           }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <div className="space-y-6">
            <Link
                href="/admin/cars"
                className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--link)]"
            >
                <ArrowLeft className="h-4 w-4" />
                Автомобили
            </Link>

            <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[var(--bg-elevated)] p-3 text-[var(--text-muted)]">
                    <CarFront className="h-6 w-6" />
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[var(--text)]">
                        Автомобиль
                    </h2>

                    <p className="mt-1 text-sm text-[var(--text-dim)]">
                        ID: {id}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                    <h3 className="font-semibold text-[var(--text)]">
                        Автомобиль
                    </h3>

                    <p className="mt-3 text-sm text-[var(--text-dim)]">
                        Данные автомобиля появятся после подключения серверной части.
                    </p>
                </section>

                <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                    <h3 className="font-semibold text-[var(--text)]">
                        Владелец
                    </h3>

                    <p className="mt-3 text-sm text-[var(--text-dim)]">
                        Данные владельца появятся после подключения серверной части.
                    </p>
                </section>
            </div>
        </div>
    );
}