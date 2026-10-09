import Link from 'next/link';
import { ArrowLeft, UserRound } from 'lucide-react';

export default async function AdminUserPage({
                                                params,
                                            }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <div className="space-y-6">
            <Link
                href="/admin/users"
                className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--link)]"
            >
                <ArrowLeft className="h-4 w-4" />
                Пользователи
            </Link>

            <div>
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[var(--bg-elevated)] p-3 text-[var(--text-muted)]">
                        <UserRound className="h-6 w-6" />
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-[var(--text)]">
                            Пользователь
                        </h2>

                        <p className="mt-1 text-sm text-[var(--text-dim)]">
                            ID: {id}
                        </p>
                    </div>
                </div>
            </div>

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                <p className="text-sm text-[var(--text-dim)]">
                    Данные пользователя появятся после подключения серверной части.
                </p>
            </section>
        </div>
    );
}