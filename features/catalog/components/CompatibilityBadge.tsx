import * as React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { CompatibilityResult } from '../lib/compatibility';

export function CompatibilityBadge({ data }: { data: CompatibilityResult }) {
    const { score, tier, label, warning } = data;

    const colorConfig = {
        high: {
            text: 'text-emerald-500',
            bar: 'bg-emerald-500',
            icon: CheckCircle2,
        },
        medium: {
            text: 'text-amber-500',
            bar: 'bg-amber-500',
            icon: ShieldCheck,
        },
        low: {
            text: 'text-rose-500',
            bar: 'bg-rose-500',
            icon: AlertTriangle,
        },
    }[tier];

    const Icon = colorConfig.icon;

    return (
        <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5">
                <Icon className={`h-4 w-4 ${colorConfig.text}`} />
                <span className={`text-sm font-bold ${colorConfig.text}`}>
          {score}%
        </span>
            </div>

            {/* Линейка-индикатор */}
            <div className="h-1.5 w-20 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${colorConfig.bar}`}
                    style={{ width: `${score}%` }}
                />
            </div>

            <span className="text-[10px] text-[var(--text-dim)]">
        {label}
      </span>

            {warning && (
                <span className="text-[11px] text-rose-500 font-medium text-right mt-1 max-w-[220px]">
          {warning}
        </span>
            )}
        </div>
    );
}