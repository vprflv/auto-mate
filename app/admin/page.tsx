import {
    ArrowRight,
    CarFront,
    Building2,
    Upload,
    Users,
} from 'lucide-react';

const stats = [
    {
        label: 'Пользователи',
        value: '—',
        icon: Users,
        href: '/admin/users',
    },
    {
        label: 'Автомобили',
        value: '—',
        icon: CarFront,
        href: '/admin/cars',
    },
    {
        label: 'Поставщики',
        value: '—',
        icon: Building2,
        href: '/admin/suppliers',
    },
    {
        label: 'Импорты',
        value: '—',
        icon: Upload,
        href: '/admin/imports',
    },
];

export default function AdminPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-[var(--text)]">
                    Обзор
                </h2>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Состояние системы и основные показатели
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map(({ label, value, icon: Icon, href }) => (
                    <a
                        key={href}
                        href={href}
                        className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-colors hover:border-[var(--btn-primary)]"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-[var(--text-muted)]">
                                    {label}
                                </p>

                                <p className="mt-2 text-3xl font-bold text-[var(--text)]">
                                    {value}
                                </p>
                            </div>

                            <div className="rounded-xl bg-[var(--bg-elevated)] p-2.5 text-[var(--text-muted)] transition-colors group-hover:text-[var(--btn-primary)]">
                                <Icon className="h-5 w-5" />
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <DashboardSection
                    title="Последние пользователи"
                    href="/admin/users"
                >
                    <EmptyState text="Пока нет данных" />
                </DashboardSection>

                <DashboardSection
                    title="Последние автомобили"
                    href="/admin/cars"
                >
                    <EmptyState text="Пока нет данных" />
                </DashboardSection>
            </div>

            <DashboardSection title="Последние события">
                <EmptyState text="Пока нет данных" />
            </DashboardSection>
        </div>
    );
}

function DashboardSection({
                              title,
                              href,
                              children,
                          }: {
    title: string;
    href?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
                <h3 className="font-semibold text-[var(--text)]">
                    {title}
                </h3>

                {href && (
                    <a
                        href={href}
                        className="flex items-center gap-1 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--link)]"
                    >
                        Все
                        <ArrowRight className="h-4 w-4" />
                    </a>
                )}
            </div>

            <div className="p-5">
                {children}
            </div>
        </section>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="flex min-h-32 items-center justify-center rounded-xl bg-[var(--bg-elevated)]">
            <p className="text-sm text-[var(--text-dim)]">
                {text}
            </p>
        </div>
    );
}