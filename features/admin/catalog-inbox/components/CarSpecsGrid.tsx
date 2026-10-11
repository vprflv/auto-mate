import * as React from 'react';
import { Layers, Gauge, Fuel, Cog, Binary } from 'lucide-react';
import { CarSpecs } from '@/features/admin/lib/systemStore';

interface Props {
    specs?: CarSpecs;
    engineFallback?: string;
}

export function CarSpecsGrid({ specs, engineFallback }: Props) {
    return (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/50 p-3.5">
            <div className="space-y-1">
                <div className="flex items-center gap-1 text-[11px] text-[var(--text-dim)] font-medium">
                    <Layers className="h-3 w-3" />
                    Кузов
                </div>
                <p className="text-xs font-semibold text-[var(--text)] truncate">
                    {specs?.bodyClass || '—'}
                </p>
            </div>

            <div className="space-y-1">
                <div className="flex items-center gap-1 text-[11px] text-[var(--text-dim)] font-medium">
                    <Gauge className="h-3 w-3" />
                    Объём / ДВС
                </div>
                <p className="text-xs font-semibold text-[var(--text)] truncate">
                    {specs?.displacementL ? `${specs.displacementL} л` : engineFallback || '—'}
                </p>
            </div>

            <div className="space-y-1">
                <div className="flex items-center gap-1 text-[11px] text-[var(--text-dim)] font-medium">
                    <Fuel className="h-3 w-3" />
                    Топливо
                </div>
                <p className="text-xs font-semibold text-[var(--text)] truncate">
                    {specs?.fuel || '—'}
                </p>
            </div>

            <div className="space-y-1">
                <div className="flex items-center gap-1 text-[11px] text-[var(--text-dim)] font-medium">
                    <Cog className="h-3 w-3" />
                    КПП
                </div>
                <p className="text-xs font-semibold text-[var(--text)] truncate">
                    {specs?.transmission || '—'}
                </p>
            </div>

            <div className="space-y-1">
                <div className="flex items-center gap-1 text-[11px] text-[var(--text-dim)] font-medium">
                    <Cog className="h-3 w-3" />
                    Привод
                </div>
                <p className="text-xs font-semibold text-[var(--text)] truncate">
                    {specs?.driveType || '—'}
                </p>
            </div>

            <div className="space-y-1">
                <div className="flex items-center gap-1 text-[11px] text-[var(--text-dim)] font-medium">
                    <Binary className="h-3 w-3" />
                    VIN
                </div>
                <p className="text-xs font-mono font-semibold text-[var(--text)] truncate" title={specs?.vin}>
                    {specs?.vin || '—'}
                </p>
            </div>
        </div>
    );
}