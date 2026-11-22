'use client';

import * as React from 'react';
import { X, Copy, Check, CarFront, GitBranchPlus, ShieldCheck, ChevronDown, Plus } from 'lucide-react';
import { InboxItem, normalizeSlug } from '@/features/admin/lib/systemStore';
import { useCarCatalog } from '@/features/garage/add/hooks/useCarCatalog';
import { ROBOT_TRANSMISSION } from '@/features/garage/add/lib/config/robotTransmission';
import { checkCarReviewModification } from '@/features/admin/lib/system-store/carCatalogReview';
import type { ApproveCarModelPayload } from '@/features/admin/lib/system-store/actions/catalog';
import { assertRequiredModificationAttributes } from '@/features/admin/lib/system-store/actions/modifications';

interface Props {
    item: InboxItem;
    isOpen: boolean;
    onClose: () => void;
    onApprove: (id: string, payload: ApproveCarModelPayload) => void;
    onReject: (id: string) => void;
}

export function CarModerationModal({ item, isOpen, onClose, onApprove, onReject }: Props) {
    const specs = item.carSpecs || (item as any).specs || {};
    const rawVin = specs.vin || item.carVin;
    const vin = rawVin === 'UNKNOWN' ? '' : rawVin;
    const incomingFields = [
        ['Марка и модель', `${item.carBrand} ${item.carModel}`],
        ['Год автомобиля', item.carYear || specs.year],
        ['Код кузова', specs.bodyCode],
        ['Тип кузова', specs.bodyClass],
        ['Двигатель', item.engine || specs.engineCode || item.engineCode],
        ['Объём двигателя, л', specs.displacementL],
        ['Количество цилиндров', specs.cylinders],
        ['Тип топлива', specs.fuel],
        ['Комплектация (Trim)', specs.trim],
        ['КПП', specs.transmission || item.transmission],
        ['Привод', specs.driveType || item.drivetrain],
        ['Количество дверей', specs.doors],
        ['Страна сборки', specs.plantCountry],
        ['Цвет', specs.color],
    ];

    const [copiedVin, setCopiedVin] = React.useState(false);

    // Стейты для эталонного кузова (Master Catalog)
    const [brand, setBrand] = React.useState<string>(item.carBrand || '');
    const [model, setModel] = React.useState<string>(item.carModel || '');
    const [years, setYears] = React.useState<string>(item.carYear ? `${item.carYear} – н.в.` : '2015 – н.в.');

    // Стейты для эталонной модификации
    const catalog = useCarCatalog();
    const [selectedModificationId, setSelectedModificationId] = React.useState<string>();
    const existingModel = catalog.models.find(candidate =>
        candidate.brandSlug === normalizeSlug(brand) &&
        candidate.modelSlug === normalizeSlug(model)
    );
    const proposedModification = existingModel?.modifications?.find(
        candidate => candidate.id === item.proposedModificationId
    );
    const existingModificationId = selectedModificationId ?? proposedModification?.id ?? '';
    const existingModification = existingModel?.modifications?.find(
        candidate => candidate.id === existingModificationId
    );
    const modificationCheck = existingModification
        ? checkCarReviewModification(item, existingModification)
        : null;
    const [approvalError, setApprovalError] = React.useState('');
    const [createMod, setCreateMod] = React.useState(true);
    const [modName, setModName] = React.useState<string>('');
    const [isModNameEdited, setIsModNameEdited] = React.useState(false);
    const [modTrim, setModTrim] = React.useState<string>((specs.trim as string) || '');
    const [modEngine, setModEngine] = React.useState<string>(
        item.engine || item.engineCode || specs.engineCode || ''
    );
    const [modTrans, setModTrans] = React.useState<string>((specs.transmission as string) || (item.transmission as string) || '');
    const transmissionOptionsId = React.useId();
    const [modDrive, setModDrive] = React.useState<string>((specs.driveType as string) || (item.drivetrain as string) || '');
    const [modFuel, setModFuel] = React.useState(typeof specs.fuel === 'string' ? specs.fuel : '');
    const [modBodyClass, setModBodyClass] = React.useState(typeof specs.bodyClass === 'string' ? specs.bodyClass : '');

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
        if (modFuel.trim()) parts.push(modFuel.trim());
        if (modBodyClass.trim()) parts.push(modBodyClass.trim());

        // Добавляем значения кастомных полей в автоназвание
        customAttributes.forEach(attr => {
            if (attr.value.trim()) parts.push(attr.value.trim());
        });

        const generatedName = parts.join(' ');
        if (generatedName !== modName) {
            setModName(generatedName);
        }
    }, [modTrim, modEngine, modTrans, modDrive, modFuel, modBodyClass, customAttributes, isModNameEdited]);

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
        if (!vin) return;
        navigator.clipboard.writeText(vin);
        setCopiedVin(true);
        setTimeout(() => setCopiedVin(false), 2000);
    };

    const handleApprove = () => {
        setApprovalError('');
        if (modificationCheck?.conflicts.length) return;
        // Упаковываем кастомные атрибуты в один объект
        const customObj = customAttributes.reduce((acc, curr) => {
            if (curr.key.trim() && curr.value.trim()) {
                acc[curr.key.trim()] = curr.value.trim();
            }
            return acc;
        }, {} as Record<string, string>);

        const payload: ApproveCarModelPayload = {
            brandName: brand.trim(),
            modelName: model.trim(),
            years: years.trim(),
            existingModificationId: existingModificationId || undefined,
            approveYearMismatch: Boolean(modificationCheck?.yearConflicts.length),
            modification: !existingModificationId && createMod && modName.trim() ? {
                id: `mod_${Date.now().toString(36)}`,
                name: modName.trim(),
                attributes: {
                    ...customObj,
                    year: item.carYear ? String(item.carYear) : undefined,
                    bodyCode: typeof specs.bodyCode === 'string' ? specs.bodyCode.trim() || undefined : undefined,
                    trim: modTrim.trim() || undefined,
                    engine: modEngine.trim() || undefined,
                    engineCode:
                        typeof specs.engineCode === 'string'
                            ? specs.engineCode.trim() || undefined
                            : item.engineCode?.trim() || undefined,
                    transmission: modTrans.trim() || undefined,
                    drivetrain: modDrive.trim() || undefined,
                    displacementL:
                        typeof specs.displacementL === 'string'
                            ? specs.displacementL.trim() || undefined
                            : undefined,
                    fuel: modFuel.trim(),
                    bodyClass: modBodyClass.trim(),
                }
            } : undefined,
        };
        try {
            if (createMod && !existingModificationId) {
                assertRequiredModificationAttributes({ fuel: modFuel, bodyClass: modBodyClass });
                if (!payload.modification) throw new Error('Укажите название модификации.');
            }
            onApprove(item.id, payload);
        } catch (error: unknown) {
            setApprovalError(error instanceof Error ? error.message : 'Не удалось одобрить заявку.');
        }
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
                                                {vin || 'НЕ УКАЗАН'}
                                            </span>
                                            {copiedVin ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5 text-[var(--text-muted)]" />}
                                        </button>
                                    </div>
                                    <dl className="space-y-2 text-sm">
                                        {incomingFields.map(([label, value]) => (
                                            <div key={label} className="flex justify-between gap-3 border-b border-[var(--border)]/20 pb-2">
                                                <dt className="font-medium text-[var(--text-dim)]">{label}</dt>
                                                <dd className="min-w-0 break-words text-right font-semibold text-[var(--text)]">{value || '—'}</dd>
                                            </div>
                                        ))}
                                    </dl>
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
                                            <input value={brand} onChange={(e) => { setBrand(e.target.value); setSelectedModificationId(''); }} className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--link)]" />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs text-[var(--text-muted)]">Модель</label>
                                            <input value={model} onChange={(e) => { setModel(e.target.value); setSelectedModificationId(''); }} className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--link)]" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="mb-1 block text-xs text-[var(--text-muted)]">Поколение / Годы (напр. 2013-2020)</label>
                                            <input value={years} onChange={(e) => setYears(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--link)]" />
                                        </div>
                                    </div>
                                </div>

                                <label className="mt-4 block space-y-2 text-sm text-[var(--text)]">
                                    <span>Модификация для ИИ-каталога</span>
                                    <select
                                        value={existingModification?.id ?? ''}
                                        onChange={event => setSelectedModificationId(event.target.value)}
                                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-3"
                                    >
                                        <option value="">Создать новую / одобрить только модель</option>
                                        {(existingModel?.modifications ?? []).map(modification => {
                                            const { year, yearEnd, bodyCode } = modification.attributes;
                                            const years = yearEnd && yearEnd !== year ? `${year ?? '…'}–${yearEnd}` : year;
                                            const label = [modification.name, years, bodyCode,
                                                modification.id === item.proposedModificationId ? 'выбрано пользователем' : '',
                                            ].filter(Boolean).join(' · ');
                                            return <option key={modification.id} value={modification.id}>{label}</option>;
                                        })}
                                    </select>
                                    {item.proposedModificationId && <span className="block text-xs text-[var(--text-muted)]">
                                        {proposedModification
                                            ? `Пользователь выбрал: ${proposedModification.name}`
                                            : 'Выбранная пользователем модификация отсутствует в этой модели.'}
                                    </span>}
                                    {existingModification && <span className="block text-xs text-[var(--text-muted)]">
                                        ИИ-каталог откроется для выбранной модификации. Год автомобиля сохранится.
                                    </span>}
                                </label>

                                {modificationCheck && (
                                    <div className="mt-2 space-y-1 text-xs">
                                        {modificationCheck.conflicts.map(message => (
                                            <p key={message} role="alert" className="text-[var(--danger)]">{message}</p>
                                        ))}
                                        {[...modificationCheck.yearConflicts, ...modificationCheck.warnings].map(message => (
                                            <p key={message} className="text-amber-600 dark:text-amber-400">{message}</p>
                                        ))}
                                    </div>
                                )}

                                {!existingModification && <div className={`mt-4 rounded-2xl border transition-colors p-5 ${createMod ? 'border-[var(--link)]/50 bg-[var(--link)]/5' : 'border-[var(--border)]/40 bg-[var(--bg-elevated)]/20'}`}>
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
                                                    <input value={modTrans} list={transmissionOptionsId} onChange={(e) => setModTrans(e.target.value)} placeholder="AT, MT, CVT..." className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--link)]" />
                                                    <datalist id={transmissionOptionsId}>
                                                        <option value={ROBOT_TRANSMISSION} />
                                                    </datalist>
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-xs text-[var(--text-muted)]">Привод</label>
                                                    <input value={modDrive} onChange={(e) => setModDrive(e.target.value)} placeholder="FWD, 4WD..." className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--link)]" />
                                                </div>
                                                {[
                                                    { label: 'Тип топлива', placeholder: 'Бензин', value: modFuel, setValue: setModFuel },
                                                    { label: 'Тип кузова', placeholder: 'Седан', value: modBodyClass, setValue: setModBodyClass },
                                                ].map(({ label, placeholder, value, setValue }) => (
                                                    <label key={label} className="block space-y-1 text-xs text-[var(--text-muted)]">
                                                        <span>{label} *</span>
                                                        <input
                                                            value={value}
                                                            onChange={event => {
                                                                setValue(event.target.value);
                                                                setApprovalError('');
                                                            }}
                                                            placeholder={placeholder}
                                                            required
                                                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--link)]"
                                                        />
                                                    </label>
                                                ))}
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
                                </div>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Футер с кнопками */}
                {approvalError && <p role="alert" className="px-6 py-2 text-sm text-[var(--danger)]">{approvalError}</p>}
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-[var(--border)]/40 bg-[var(--bg-elevated)]/30 px-6 py-4">
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
                        disabled={!catalog.loaded || Boolean(modificationCheck?.conflicts.length)}
                        className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-50"
                    >
                        {existingModification ? 'Одобрить каталог для модификации' : 'Одобрить в эталон'}
                    </button>
                </div>
            </div>
        </div>
    );
}
