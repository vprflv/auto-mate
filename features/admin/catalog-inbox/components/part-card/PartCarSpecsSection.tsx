'use client';

import * as React from 'react';
import { Package, Droplet, Copy, CheckCheck } from 'lucide-react';
import { InboxItem } from '@/features/admin/lib/systemStore';
import { ParsedCarSpecs } from '../../lib/partInboxUtils';

interface Props {
    item: InboxItem;
    specs: ParsedCarSpecs;
}

function SpecRow({
                     label,
                     value,
                     mono = false,
                 }: {
    label: string;
    value?: string | number | null;
    mono?: boolean;
}) {
    if (!value) return null;
    return (
        <div className="flex items-baseline justify-between text-[11px] leading-relaxed">
            <span className="text-[var(--text-dim)] shrink-0">{label}</span>
            <span className="mx-1.5 flex-1 border-b border-dotted border-[var(--border)]/80" />
            <span
                className={`text-[var(--text)] font-semibold shrink-0 max-w-[65%] truncate ${
                    mono ? 'font-mono' : ''
                }`}
                title={String(value)}
            >
                {value}
            </span>
        </div>
    );
}

export function PartCarSpecsSection({ item, specs }: Props) {
    const isFluid = item.itemType === 'Техническая жидкость' || (item as any).type === 'fluid';
    const isFromService = item.source === 'user_service';
    const [copiedVin, setCopiedVin] = React.useState(false);

    const handleCopyVin = () => {
        if (!specs.vinDisplay) return;
        navigator.clipboard.writeText(specs.vinDisplay);
        setCopiedVin(true);
        setTimeout(() => setCopiedVin(false), 2000);
    };

    return (
        <div className="border-b border-[var(--border)]/40 bg-[var(--bg-elevated)]/60 p-3.5 space-y-2.5">
            {/* ВЕРХНЯЯ СТРОКА: СЛЕВА VIN, СПРАВА ТИП И ПОВТОРЫ */}
            <div className="flex items-center justify-between gap-2">
                {specs.vinDisplay ? (
                    <button
                        type="button"
                        onClick={handleCopyVin}
                        title="Нажмите, чтобы скопировать VIN"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)]/60 bg-[var(--card)] px-2 py-0.5 text-[11px] font-mono font-bold text-[var(--text)] tracking-wider hover:border-[var(--link)]/50 transition"
                    >
                        <span>{specs.vinDisplay}</span>
                        {copiedVin ? (
                            <CheckCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                        ) : (
                            <Copy className="h-3 w-3 text-[var(--text-dim)] shrink-0" />
                        )}
                    </button>
                ) : (
                    <span className="rounded-lg border border-dashed border-[var(--border)]/60 px-2 py-0.5 text-[10px] text-[var(--text-dim)] italic">
                        VIN не указан
                    </span>
                )}

                <div className="flex items-center gap-1 shrink-0">
                    {item.occurrencesCount && item.occurrencesCount > 1 && (
                        <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-500 border border-amber-500/30">
                            ★ {item.occurrencesCount}
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-bold text-blue-500 border border-blue-500/20">
                        {isFluid ? <Droplet className="h-2.5 w-2.5" /> : <Package className="h-2.5 w-2.5" />}
                        {isFluid ? 'Жидкость' : 'Запчасть'}
                    </span>
                    <span className="rounded bg-[var(--card)] px-1.5 py-0.5 text-[10px] text-[var(--text-dim)] border border-[var(--border)]/40">
                        {isFromService ? 'ТО' : 'Вручную'}
                    </span>
                </div>
            </div>

            {/* НАЗВАНИЕ АВТОМОБИЛЯ */}
            <h4 className="truncate text-sm font-bold text-[var(--text)]">
                {item.carBrand} {item.carModel} {item.carYear ? `(${item.carYear})` : ''}
            </h4>

            {/* ТАБЛИЦА ХАРАКТЕРИСТИК С ТОЧКАМИ НА РУССКОМ */}
            <div className="rounded-xl border border-[var(--border)]/50 bg-[var(--card)] p-2.5 space-y-1">
                <SpecRow
                    label="Двигатель"
                    value={specs.fullEngineTag || 'не указан'}
                    mono={Boolean(specs.engineCodeDisplay)}
                />
                <SpecRow label="Мощность" value={specs.powerDisplay} />
                <SpecRow label="Топливо" value={specs.fuelDisplay} />
                <SpecRow label="КПП" value={specs.transmissionDisplay || 'не указана'} />
                <SpecRow label="Привод" value={specs.drivetrainDisplay || 'не указан'} />
                <SpecRow label="Кузов / поколение" value={specs.bodyGenerationDisplay} />
                <SpecRow label="Руль" value={specs.wheelDisplay} />
                <SpecRow label="Пробег" value={specs.mileageDisplay} mono />
                <SpecRow label="Госномер" value={specs.plateDisplay} mono />

                {specs.extraUnknownSpecs.map((row, idx) => (
                    <SpecRow key={idx} label={row.label} value={row.value} />
                ))}
            </div>
        </div>
    );
}