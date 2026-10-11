'use client';

import * as React from 'react';
import Link from 'next/link';
import {
    UserPlus,
    CarFront,
    Wrench,
    CheckCircle2,
    ArrowRight,
    RotateCcw,
} from 'lucide-react';
import { systemStore, AppUser, AppCar } from '@/features/admin/lib/systemStore';

export default function AdminTestFlowPage() {
    const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);

    // Данные формы
    const [userName, setUserName] = React.useState('Иван Кузнецов');
    const [userEmail, setUserEmail] = React.useState('ivan.kuznetsov@example.com');
    const [createdUser, setCreatedUser] = React.useState<AppUser | null>(null);

    const [brand, setBrand] = React.useState('Skoda');
    const [model, setModel] = React.useState('Octavia A7');
    const [year, setYear] = React.useState(2017);
    const [engine, setEngine] = React.useState('1.4 TSI (CZDA)');
    const [mileage, setMileage] = React.useState(135000);
    const [createdCar, setCreatedCar] = React.useState<AppCar | null>(null);

    const [serviceTitle, setServiceTitle] = React.useState('Замена передних колодок и масла');
    const [partBrand, setPartBrand] = React.useState('Miles');
    const [partArticle, setPartArticle] = React.useState('E100140');
    const [partName, setPartName] = React.useState('Тормозные колодки передние');

    // Шаг 1: Создать пользователя
    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        const user = systemStore.createUser(userName, userEmail);
        setCreatedUser(user);
        setStep(2);
    };

    // Шаг 2: Добавить автомобиль
    const handleAddCar = (e: React.FormEvent) => {
        e.preventDefault();
        if (!createdUser) return;
        const car = systemStore.addCar({
            userId: createdUser.id,
            brand,
            model,
            year: Number(year),
            engine,
            mileage: Number(mileage),
            plateNumber: 'М777ММ 777',
        });
        setCreatedCar(car);
        setStep(3);
    };

    // Шаг 3: Добавить запись ТО
    const handleAddService = (e: React.FormEvent) => {
        e.preventDefault();
        if (!createdCar) return;
        systemStore.addServiceRecord({
            carId: createdCar.id,
            title: serviceTitle,
            date: new Date().toLocaleDateString('ru-RU'),
            mileage: Number(mileage) + 500,
            items: [
                {
                    brand: partBrand,
                    article: partArticle,
                    name: partName,
                    quantity: 1,
                    isOem: false,
                },
            ],
        });
        setStep(4);
    };

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-[var(--text)]">
                    Интерактивное тестирование цепочки
                </h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Эмуляция действий пользователя в реальном времени: регистрация → гараж → ТО → модерация
                </p>
            </div>

            {/* Индикатор шагов */}
            <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                {[
                    { num: 1, label: 'Пользователь' },
                    { num: 2, label: 'Гараж / Авто' },
                    { num: 3, label: 'Запись ТО' },
                    { num: 4, label: 'Результат в админке' },
                ].map((s) => (
                    <div key={s.num} className="flex items-center gap-2">
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                                step >= s.num
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-[var(--bg-elevated)] text-[var(--text-dim)]'
                            }`}
                        >
                            {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                        </div>
                        <span className="hidden text-xs font-medium text-[var(--text)] sm:inline">
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* ЭТАП 1: Создание пользователя */}
            {step === 1 && (
                <form
                    onSubmit={handleCreateUser}
                    className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
                >
                    <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                        <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-500">
                            <UserPlus className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[var(--text)]">
                                Шаг 1: Пользователь регистрируется
                            </h3>
                            <p className="text-xs text-[var(--text-dim)]">
                                Ввод имени и контактного адреса
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-xs font-semibold text-[var(--text-dim)]">
                                Имя пользователя
                            </label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                required
                                className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--btn-primary)]"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[var(--text-dim)]">
                                Email
                            </label>
                            <input
                                type="email"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                required
                                className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--btn-primary)]"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--btn-primary)] px-5 text-sm font-semibold text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)]"
                    >
                        Зарегистрировать и перейти к авто
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </form>
            )}

            {/* ЭТАП 2: Добавление машины */}
            {step === 2 && (
                <form
                    onSubmit={handleAddCar}
                    className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
                >
                    <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                        <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-500">
                            <CarFront className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[var(--text)]">
                                Шаг 2: Добавление автомобиля в гараж
                            </h3>
                            <p className="text-xs text-[var(--text-dim)]">
                                Владелец: {createdUser?.name} ({createdUser?.email})
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-xs font-semibold text-[var(--text-dim)]">Марка</label>
                            <input
                                type="text"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[var(--text-dim)]">Модель</label>
                            <input
                                type="text"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[var(--text-dim)]">Двигатель</label>
                            <input
                                type="text"
                                value={engine}
                                onChange={(e) => setEngine(e.target.value)}
                                className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[var(--text-dim)]">Пробег (км)</label>
                            <input
                                type="number"
                                value={mileage}
                                onChange={(e) => setMileage(Number(e.target.value))}
                                className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] outline-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--btn-primary)] px-5 text-sm font-semibold text-[var(--btn-primary-text)]"
                    >
                        Сохранить в гараж и перейти к ТО
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </form>
            )}

            {/* ЭТАП 3: Добавление ТО */}
            {step === 3 && (
                <form
                    onSubmit={handleAddService}
                    className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
                >
                    <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                        <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400">
                            <Wrench className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[var(--text)]">
                                Шаг 3: Пользователь записывает ТО
                            </h3>
                            <p className="text-xs text-[var(--text-dim)]">
                                Автомобиль: {createdCar?.title}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-[var(--text-dim)]">
                                Название обслуживания
                            </label>
                            <input
                                type="text"
                                value={serviceTitle}
                                onChange={(e) => setServiceTitle(e.target.value)}
                                className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] outline-none"
                            />
                        </div>

                        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 p-4 space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-dim)]">
                                Установленная деталь (попадет в модерацию)
                            </p>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div>
                                    <label className="text-xs text-[var(--text-dim)]">Бренд</label>
                                    <input
                                        type="text"
                                        value={partBrand}
                                        onChange={(e) => setPartBrand(e.target.value)}
                                        className="mt-1 h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 text-xs text-[var(--text)]"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-[var(--text-dim)]">Артикул</label>
                                    <input
                                        type="text"
                                        value={partArticle}
                                        onChange={(e) => setPartArticle(e.target.value)}
                                        className="mt-1 h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 font-mono text-xs text-[var(--text)]"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-[var(--text-dim)]">Наименование</label>
                                    <input
                                        type="text"
                                        value={partName}
                                        onChange={(e) => setPartName(e.target.value)}
                                        className="mt-1 h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 text-xs text-[var(--text)]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
                    >
                        Зафиксировать ТО в сервисной книжке
                        <CheckCircle2 className="h-4 w-4" />
                    </button>
                </form>
            )}

            {/* ЭТАП 4: Результат и переход в админку */}
            {step === 4 && (
                <div className="space-y-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-emerald-500 p-2 text-white">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[var(--text)]">
                                Цикл завершён: данные отправлены в админку
                            </h3>
                            <p className="text-xs text-[var(--text-muted)]">
                                Теперь можно открыть разделы панели управления и увидеть изменения:
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <Link
                            href="/admin/users"
                            className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:border-[var(--link)]"
                        >
                            <div>
                                <p className="font-bold text-sm text-[var(--text)]">1. Пользователи</p>
                                <p className="mt-1 text-xs text-[var(--text-dim)]">
                                    Пользователь {createdUser?.name} появился в реестре
                                </p>
                            </div>
                            <span className="mt-4 text-xs font-semibold text-blue-500">
                                Открыть список пользователей →
                            </span>
                        </Link>

                        <Link
                            href="/admin/cars"
                            className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:border-[var(--link)]"
                        >
                            <div>
                                <p className="font-bold text-sm text-[var(--text)]">2. Автомобили</p>
                                <p className="mt-1 text-xs text-[var(--text-dim)]">
                                    {createdCar?.title} привязан к владельцу
                                </p>
                            </div>
                            <span className="mt-4 text-xs font-semibold text-blue-500">
                                Открыть список машин →
                            </span>
                        </Link>

                        <Link
                            href="/admin/catalog/inbox"
                            className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:border-[var(--link)]"
                        >
                            <div>
                                <p className="font-bold text-sm text-[var(--text)]">3. Модерация</p>
                                <p className="mt-1 text-xs text-[var(--text-dim)]">
                                    {partBrand} {partArticle} ожидает подтверждения
                                </p>
                            </div>
                            <span className="mt-4 text-xs font-semibold text-emerald-500">
                                Перейти к модерации →
                            </span>
                        </Link>
                    </div>

                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Запустить тестовый сценарий заново
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}