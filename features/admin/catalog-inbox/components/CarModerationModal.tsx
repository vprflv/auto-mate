'use client';

import * as React from 'react';
import { X, Copy, Check, CarFront, GitBranchPlus, ShieldCheck, ChevronDown, Plus } from 'lucide-react';
import { InboxItem } from '@/features/admin/lib/systemStore';

interface Props {
    item: InboxItem;
    isOpen: boolean;
    onClose: () => void;
    onApprove: (id: string, payload: any) => void;
    onReject: (id: string) => void;
}

export function CarModerationModal({ item, isOpen, onClose, onApprove, onReject }: Props) {
    const specs = item.carSpecs || (item as any).specs || {};

    const [copiedVin, setCopiedVin] = React.useState(false);

    // Стейты для эталонного кузова (Master Catalog)
    const [brand, setBrand] = React.useState<string>(item.carBrand || '');
    const [model, setModel] = React.useState<string>(item.carModel || '');
    const [years, setYears] = React.useState<string>(item.carYear ? `${item.carYear} – н.в.` : '2015 – н.в.');

    // Стейты для эталонной модификации
    const [createMod, setCreateMod] = React.useState(false);
    const [modName, setModName] = React.useState<string>('');
    const [isModNameEdited, setIsModNameEdited] = React.useState(false);
    const [modTrim, setModTrim] = React.useState<string>((specs.trim as string) || '');
    const [modEngine, setModEngine] = React.useState<string>((item.engineCode as string) || (item.engine as string) || '');
    const [modTrans, setModTrans] = React.useState<string>((specs.transmission as string) || (item.transmission as string) || '');
    const [modDrive, setModDrive] = React.useState<string>((specs.driveType as string) || (item.drivetrain as string) || '');

    // Стейт для кастомных полей (спасательный люк)
    const [customAttributes, setCustomAttributes] = React.useState<{id: string, key: string, value: string}[]>([]);

    // Автогенерация "Названия в фильтре"
    React.useEffect(() => {
        if (isModNameEdited) return;

        const parts = [];
        if (modTrim.trim()) parts.push(modTrim.trim());
        if (modEngine.trim()) parts.push(`(${modEngine.trim()})`);
        if (modTrans.trim()) parts.push(modTrans.trim());
        if (modDrive.trim()) parts.push(modDrive.trim());

        // Добавляем значения кастомных полей в автоназвание
        customAttributes.forEach(attr => {
            if (attr.value.trim()) parts.push(attr.value.trim());
        });

        const generatedName = parts.join(' ');
        if (generatedName !== modName) {
            setModName(generatedName);
        }
    }, [modTrim, modEngine, modTrans, modDrive, customAttributes, isModNameEdited]);

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCopyVin = () => {
        if (!specs.vin) return;
        navigator.clipboard.writeText(specs.vin);
        setCopiedVin(true);
        setTimeout(() => setCopiedVin(false), 2000);
    };

    const handleApprove = () => {
        // Упаковываем кастомные атрибуты в один объект
        const customObj = customAttributes.reduce((acc, curr) => {
            if (curr.key.trim() && curr.value.trim()) {
                acc[curr.key.trim()] = curr.value.trim();
            }
            return acc;
        }, {} as Record<string, string>);

        const payload = {
            brandName: brand.trim(),
            modelName: model.trim(),
            years: years.trim(),
            modification: createMod && modName.trim() ? {
                id: `mod_${Date.now().toString(36)}`,
                name: modName.trim(),
                attributes: {
                    trim: modTrim.trim() || undefined,
                    engine: modEngine.trim() || undefined,
                    transmission: modTrans.trim() || undefined,
                    drivetrain: modDrive.trim() || undefined,
                    ...customObj, // Подмешиваем кастомные поля
                }
            } : undefined
        };
        onApprove(item.id, payload);
    };

    const handleReject = () => {
        onReject(item.id);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6">
            <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[var(--border)]/40 bg-[var(--card)] shadow-2xl">

                {/* Шапка модалки */}
                <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <CarFront className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[var(--text)]">Модерация автомобиля</h2>
                            <p className="text-xs text-[var(--text-dim)]">Тикет от пользователя {item.submittedBy}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] transition">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Основной контент */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* ЛЕВАЯ КОЛОНКА */}
                        <div className="space-y-5">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">1. Входящие данные</h3>
                                <div className="rounded-2xl border border-dashed border-[var(--border)]/60 bg-[var(--bg-elevated)]/20 p-5 space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-[var(--text-dim)] mb-1.5">VIN-код для проверки</p>
                                        <button
                                            type="button"
                                            onClick={handleCopyVin}
                                            className="flex w-full items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 transition hover:border-[var(--link)]/50 active:scale-[0.98]"
                                        >
                                            <span className="font-mono text-lg font-bold tracking-widest text-[var(--text)]">
                                                {specs.vin || 'НЕ УКАЗАН'}
                                            </span>
                                            {copiedVin ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5 text-[var(--text-muted)]" />}
                                        </button>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between border-b border-[var(--border)]/20 pb-2">
                                            <span className="text-[var(--text-dim)] font-medium">Марка и Модель</span>
                                            <span className="font-semibold text-[var(--text)] text-right">{item.carBrand} {item.carModel}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-[var(--border)]/20 pb-2">
                                            <span className="text-[var(--text-dim)] font-medium">Год выпуска</span>
                                            <span className="font-semibold text-[var(--text)] text-right">{item.carYear || specs.year || '—'}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-[var(--border)]/20 pb-2">
                                            <span className="text-[var(--text-dim)] font-medium">Двигатель</span>
                                            <span className="font-semibold text-[var(--text)] text-right">{item.engine || specs.displacementL || '—'}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-[var(--border)]/20 pb-2">
                                            <span className="text-[var(--text-dim)] font-medium">Комплектация (Trim)</span>
                                            <span className="font-semibold text-[var(--text)] text-right">{specs.trim || '—'}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-[var(--border)]/20 pb-2">
                                            <span className="text-[var(--text-dim)] font-medium">КПП</span>
                                            <span className="font-semibold text-[var(--text)] text-right">{specs.transmission || '—'}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-[var(--border)]/20 pb-2">
                                            <span className="text-[var(--text-dim)] font-medium">Привод</span>
                                            <span className="font-semibold text-[var(--text)] text-right">{specs.driveType || '—'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ПРАВАЯ КОЛОНКА */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--link)] mb-3 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4" />
                                    2. Эталонный каталог
                                </h3>

                                <div className="space-y-3 rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/40 p-5">
                                    <p className="text-[10px] font-bold uppercase text-[var(--text-dim)]">Базовая модель (Кузов)</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1 block text-xs text-[var(--text-muted)]">Марка</label>
                                            <input value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--link)]" />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs text-[var(--text-muted)]">Модель</label>
                                            <input value={model} onChange={(e) => setModel(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--link)]" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="mb-1 block text-xs text-[var(--text-muted)]">Поколение / Годы (напр. 2013-2020)</label>
                                            <input value={years} onChange={(e) => setYears(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--link)]" />
                                        </div>
                                    </div>
                                </div>

                                <div className={`mt-4 rounded-2xl border transition-colors p-5 ${createMod ? 'border-[var(--link)]/50 bg-[var(--link)]/5' : 'border-[var(--border)]/40 bg-[var(--bg-elevated)]/20'}`}>
                                    <button
                                        type="button"
                                        onClick={() => setCreateMod(!createMod)}
                                        className="flex w-full items-center justify-between text-left cursor-pointer outline-none group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${createMod ? 'bg-[var(--link)] text-[var(--btn-primary-text)] shadow-[0_0_12px_rgba(57,255,20,0.2)]' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] group-hover:text-[var(--text)]'}`}>
                                                <GitBranchPlus className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[var(--text)]">
                                                    Создать модификацию
                                                </p>
                                                <p className="text-xs text-[var(--text-dim)] mt-0.5">
                                                    Привяжет запчасти к этой конкретной версии авто
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronDown
                                            className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                                                createMod ? 'rotate-180 text-[var(--link)]' : 'text-[var(--text-dim)] group-hover:text-[var(--text)]'
                                            }`}
                                        />
                                    </button>

                                    {createMod && (
                                        <div className="mt-5 space-y-3 animate-in fade-in slide-in-from-top-2">
                                            <div>
                                                <label className="mb-1 flex items-center justify-between text-xs font-semibold text-[var(--link)]">
                                                    <span>Название в фильтре *</span>
                                                    {isModNameEdited && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsModNameEdited(false)}
                                                            className="text-[9px] text-[var(--text-dim)] hover:text-[var(--text)] uppercase tracking-wider"
                                                        >
                                                            Автосборка
                                                        </button>
                                                    )}
                                                </label>
                                                <input
                                                    value={modName}
                                                    onChange={(e) => {
                                                        setModName(e.target.value);
                                                        setIsModNameEdited(true);
                                                    }}
                                                    placeholder="Напр: 2.0 SiR (F20B) AT"
                                                    className="w-full rounded-xl border border-[var(--link)]/50 bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--text)] outline-none focus:border-[var(--link)] focus:ring-1 focus:ring-[var(--link)]"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="mb-1 block text-xs text-[var(--text-muted)]">Комплектация (Trim)</label>
                                                    <input value={modTrim} onChange={(e) => setModTrim(e.target.value)} placeholder="SiR, LEV, RS..." className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--link)]" />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-xs text-[var(--text-muted)]">Код ДВС</label>
                                                    <input value={modEngine} onChange={(e) => setModEngine(e.target.value)} placeholder="F20B, CWVA..." className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--link)]" />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-xs text-[var(--text-muted)]">КПП</label>
                                                    <input value={modTrans} onChange={(e) => setModTrans(e.target.value)} placeholder="AT, MT, CVT..." className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--link)]" />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-xs text-[var(--text-muted)]">Привод</label>
                                                    <input value={modDrive} onChange={(e) => setModDrive(e.target.value)} placeholder="FWD, 4WD..." className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--link)]" />
                                                </div>
                                            </div>

                                            {/* БЛОК СОБСТВЕННЫХ ХАРАКТЕРИСТИК */}
                                            {customAttributes.length > 0 && (
                                                <div className="mt-4 space-y-2 border-t border-[var(--border)]/30 pt-4">
                                                    <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">
                                                        Кастомные параметры
                                                    </p>
                                                    {customAttributes.map((attr, index) => (
                                                        <div key={attr.id} className="flex items-center gap-2">
                                                            <input
                                                                value={attr.key}
                                                                onChange={(e) => {
                                                                    const newAttrs = [...customAttributes];
                                                                    newAttrs[index].key = e.target.value;
                                                                    setCustomAttributes(newAttrs);
                                                                }}
                                                                placeholder="Ключ (напр. Руль)"
                                                                className="w-1/2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--text)] outline-none focus:border-[var(--link)]"
                                                            />
                                                            <input
                                                                value={attr.value}
                                                                onChange={(e) => {
                                                                    const newAttrs = [...customAttributes];
                                                                    newAttrs[index].value = e.target.value;
                                                                    setCustomAttributes(newAttrs);
                                                                }}
                                                                placeholder="Значение (Правый)"
                                                                className="w-1/2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--text)] outline-none focus:border-[var(--link)]"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setCustomAttributes(customAttributes.filter((a) => a.id !== attr.id));
                                                                }}
                                                                className="rounded-lg p-1.5 text-[var(--danger)] hover:bg-[var(--danger)]/10 transition"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => setCustomAttributes([...customAttributes, { id: Date.now().toString(), key: '', value: '' }])}
                                                className="mt-2 flex w-max items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-[var(--link)] hover:bg-[var(--link)]/10 transition"
                                            >
                                                <Plus size={14} /> Добавить свое поле
                                            </button>

                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Футер с кнопками */}
                <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 px-6 py-4">
                    <button
                        type="button"
                        onClick={handleReject}
                        className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-5 py-2.5 text-sm font-semibold text-rose-500 transition hover:bg-rose-500 hover:text-white"
                    >
                        Отклонить мусор
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--bg-elevated)]"
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        onClick={handleApprove}
                        className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600"
                    >
                        Одобрить в эталон
                    </button>
                </div>
            </div>
        </div>
    );
}