'use client';

import * as React from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    CarFront,
    Users,
    Settings2,
    Wrench,
    Filter,
    RotateCcw,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { storage } from '@/features/admin/lib/system-store/storage';
import { StoredMasterModel, StoredCatalogNode, CatalogModification } from '@/features/admin/lib/system-store/types';

export default function ModelCatalogDashboard({ params }: { params: Promise<{ brand: string; model: string }> }) {
    const resolvedParams = React.use(params);
    const brandSlug = resolvedParams.brand;
    const modelSlug = resolvedParams.model;

    const [masterModel, setMasterModel] = React.useState<StoredMasterModel | null>(null);
    const [catalogNodes, setCatalogNodes] = React.useState<StoredCatalogNode[]>([]);

    // Стейты фасетных фильтров
    const [filters, setFilters] = React.useState({
        engine: 'all',
        transmission: 'all',
        drivetrain: 'all',
        trim: 'all'
    });

    React.useEffect(() => {
        const loadData = () => {
            const state = storage.getState();
            const foundModel = state.masterModels.find(
                m => m.brandSlug === brandSlug && m.modelSlug === modelSlug
            );
            const foundNodes = state.catalogNodes.filter(
                n => n.brandSlug === brandSlug && n.modelSlug === modelSlug
            );

            setMasterModel(foundModel || null);
            setCatalogNodes(foundNodes);
        };

        loadData();
        window.addEventListener('system-store-updated', loadData);
        return () => window.removeEventListener('system-store-updated', loadData);
    }, [brandSlug, modelSlug]);

    if (!masterModel) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
                <AlertCircle className="h-12 w-12 text-[var(--text-muted)]" />
                <h2 className="text-xl font-bold text-[var(--text)]">Модель не найдена</h2>
                <Link href="/admin/catalog" className="mt-4 rounded-xl bg-[var(--link)] px-6 py-2.5 text-sm font-bold text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)]">
                    Вернуться в каталог
                </Link>
            </div>
        );
    }

    // 1. Собираем уникальные значения для селектов
    const mods = masterModel.modifications || [];
    const uniqueEngines = Array.from(new Set(mods.map(m => m.attributes.engine).filter(Boolean))) as string[];
    const uniqueTrans = Array.from(new Set(mods.map(m => m.attributes.transmission).filter(Boolean))) as string[];
    const uniqueDrives = Array.from(new Set(mods.map(m => m.attributes.drivetrain).filter(Boolean))) as string[];
    const uniqueTrims = Array.from(new Set(mods.map(m => m.attributes.trim).filter(Boolean))) as string[];

    const hasActiveFilters = Object.values(filters).some(val => val !== 'all');

    // 2. Находим, какие именно модификации (ID) подходят под текущие фильтры
    const activeModIds = mods.filter(mod => {
        if (filters.engine !== 'all' && mod.attributes.engine !== filters.engine) return false;
        if (filters.transmission !== 'all' && mod.attributes.transmission !== filters.transmission) return false;
        if (filters.drivetrain !== 'all' && mod.attributes.drivetrain !== filters.drivetrain) return false;
        if (filters.trim !== 'all' && mod.attributes.trim !== filters.trim) return false;
        return true;
    }).map(mod => mod.id);

    // 3. Фильтруем узлы запчастей
    const visibleNodes = catalogNodes.filter(node => {
        const nodeMods = node.compatibleModifications || [];
        // Если узел "для всех" — показываем всегда
        if (nodeMods.includes('all')) return true;
        // Показываем узел, если ХОТЯ БЫ ОДНА его модификация попадает в наш отфильтрованный список (пересечение массивов)
        return nodeMods.some(id => activeModIds.includes(id));
    });

    const nodesByCategory = visibleNodes.reduce((acc, node) => {
        if (!acc[node.category]) acc[node.category] = [];
        acc[node.category].push(node);
        return acc;
    }, {} as Record<string, StoredCatalogNode[]>);

    const categoryLabels: Record<string, string> = {
        service: 'Расходники ТО', brakes: 'Тормозная система',
        suspension: 'Подвеска и рулевое', ignition: 'Зажигание и электрика',
        fluids: 'Масла и жидкости'
    };

    return (
        <div className="mx-auto max-w-6xl space-y-8 pb-20">

            {/* ШАПКА КУЗОВА */}
            <div className="space-y-4">
                <Link href="/admin/catalog" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--link)] transition">
                    <ChevronLeft className="h-4 w-4" /> Назад к списку марок
                </Link>

                <div className="relative overflow-hidden rounded-3xl border border-[var(--border)]/40 bg-[var(--card)] p-6 shadow-sm sm:p-8">
                    <div className="absolute -right-10 -top-10 text-[var(--bg-elevated)]/50">
                        <CarFront className="h-64 w-64 rotate-12" />
                    </div>

                    <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)]">
                                    {masterModel.brandName} {masterModel.modelName}
                                </h1>
                                {masterModel.verified && (
                                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-500 border border-emerald-500/20">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Эталон
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-medium text-[var(--text-muted)]">
                                Годы выпуска: <span className="text-[var(--text)]">{masterModel.years}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)]/50 bg-[var(--bg-elevated)]/60 px-5 py-3 shadow-inner">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--link)]/10 text-[var(--link)]">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">В гаражах юзеров</p>
                                <p className="text-xl font-black text-[var(--text)]">{masterModel.registeredCount || 0} авто</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* БЛОК ФИЛЬТРОВ (ФАСЕТЫ) */}
            <div className="rounded-3xl border border-[var(--border)]/60 bg-[var(--card)] p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-[var(--border)]/30 pb-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-[var(--link)]" />
                        <h2 className="text-lg font-bold text-[var(--text)]">Параметры автомобиля</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-[var(--text-muted)]">
                            Найдено сборок: <span className="font-bold text-[var(--text)]">{activeModIds.length}</span>
                        </span>
                        {hasActiveFilters && (
                            <button
                                onClick={() => setFilters({ engine: 'all', transmission: 'all', drivetrain: 'all', trim: 'all' })}
                                className="flex items-center gap-1.5 rounded-lg bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--border)] hover:text-[var(--text)] transition"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Сбросить
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Селект Двигатель */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-[var(--text-dim)] ml-1">Двигатель</label>
                        <select
                            value={filters.engine}
                            onChange={e => setFilters(p => ({...p, engine: e.target.value}))}
                            className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--text)] outline-none focus:border-[var(--link)] focus:ring-1 focus:ring-[var(--link)] transition cursor-pointer"
                        >
                            <option value="all">Все моторы</option>
                            {uniqueEngines.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>

                    {/* Селект КПП */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-[var(--text-dim)] ml-1">КПП</label>
                        <select
                            value={filters.transmission}
                            onChange={e => setFilters(p => ({...p, transmission: e.target.value}))}
                            className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--text)] outline-none focus:border-[var(--link)] focus:ring-1 focus:ring-[var(--link)] transition cursor-pointer"
                        >
                            <option value="all">Любая</option>
                            {uniqueTrans.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>

                    {/* Селект Привод */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-[var(--text-dim)] ml-1">Привод</label>
                        <select
                            value={filters.drivetrain}
                            onChange={e => setFilters(p => ({...p, drivetrain: e.target.value}))}
                            className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--text)] outline-none focus:border-[var(--link)] focus:ring-1 focus:ring-[var(--link)] transition cursor-pointer"
                        >
                            <option value="all">Любой</option>
                            {uniqueDrives.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>

                    {/* Селект Комплектация */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-[var(--text-dim)] ml-1">Комплектация</label>
                        <select
                            value={filters.trim}
                            onChange={e => setFilters(p => ({...p, trim: e.target.value}))}
                            className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--text)] outline-none focus:border-[var(--link)] focus:ring-1 focus:ring-[var(--link)] transition cursor-pointer"
                        >
                            <option value="all">Любая</option>
                            {uniqueTrims.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* ДЕРЕВО ЗАПЧАСТЕЙ */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-[var(--text-muted)]" />
                        <h2 className="text-lg font-bold text-[var(--text)]">Каталог запчастей</h2>
                    </div>
                    <span className="text-xs font-medium text-[var(--text-dim)]">Узлов: {visibleNodes.length}</span>
                </div>

                {visibleNodes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border)]/60 bg-[var(--bg-elevated)]/20 py-12 text-center">
                        <Settings2 className="mb-3 h-8 w-8 text-[var(--text-dim)]" />
                        <h3 className="text-sm font-bold text-[var(--text-muted)]">Ничего не найдено</h3>
                        <p className="mt-1 text-xs text-[var(--text-dim)]">Для выбранной конфигурации пока нет запчастей.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2">
                        {Object.entries(nodesByCategory).map(([category, nodes]) => (
                            <div key={category} className="space-y-3 rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 p-5">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                    {categoryLabels[category] || category}
                                </h3>
                                <div className="space-y-2">
                                    {nodes.map(node => (
                                        <div key={node.id} className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-2xs transition hover:border-[var(--link)]/40 hover:shadow-sm">
                                            <div>
                                                <p className="text-sm font-bold text-[var(--text)]">{node.title}</p>
                                                <p className="text-xs text-[var(--text-dim)]">Деталей в базе: {node.items.length}</p>
                                            </div>
                                            <Link
                                                href={`/admin/catalog/${brandSlug}/${modelSlug}/${node.id}`}
                                                className="rounded-lg bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--link)] hover:text-[var(--btn-primary-text)] transition-colors"
                                            >
                                                Открыть
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}