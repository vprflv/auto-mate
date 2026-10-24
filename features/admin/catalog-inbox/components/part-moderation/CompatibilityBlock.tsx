import * as React from 'react';
import { GitBranch } from 'lucide-react';
import { StoredMasterModel } from '@/features/admin/lib/system-store/types';

// Добавляем интерфейс
interface CompatibilityBlockProps {
    targetCar: StoredMasterModel | null;
    compatibilityType: 'all' | 'specific';
    setCompatibilityType: (value: 'all' | 'specific') => void;
    selectedModIds: string[];
    setSelectedModIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export function CompatibilityBlock({ targetCar, compatibilityType, setCompatibilityType, selectedModIds, setSelectedModIds }: CompatibilityBlockProps) {
    const toggleMod = (id: string) => {
        setSelectedModIds(prev => prev.includes(id) ? prev.filter(modId => modId !== id) : [...prev, id]);
    };

    return (
        <div className="space-y-3 rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/40 p-5 mt-4">
            <p className="text-[10px] font-bold uppercase text-[var(--text-dim)] flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5" /> Совместимость с кузовом
            </p>

            <div className="flex rounded-xl bg-[var(--bg-elevated)] p-1 border border-[var(--border)]">
                <button type="button" onClick={() => setCompatibilityType('all')} className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${compatibilityType === 'all' ? 'bg-[var(--card)] text-[var(--text)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
                    Универсальная (На все)
                </button>
                <button type="button" disabled={!targetCar || !targetCar.modifications || targetCar.modifications.length === 0} onClick={() => setCompatibilityType('specific')} className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${compatibilityType === 'specific' ? 'bg-[var(--card)] text-[var(--link)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
                    Выбрать модификации
                </button>
            </div>

            {compatibilityType === 'specific' && targetCar && targetCar.modifications && (
                <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {targetCar.modifications.map(mod => (
                        <label key={mod.id} className="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:bg-[var(--bg-elevated)] border border-transparent hover:border-[var(--border)]/50 transition">
                            <input type="checkbox" checked={selectedModIds.includes(mod.id)} onChange={() => toggleMod(mod.id)} className="mt-0.5 rounded border-[var(--border)] text-[var(--link)] focus:ring-[var(--link)]/20" />
                            <div>
                                <p className="text-sm font-bold text-[var(--text)] leading-tight">{mod.name}</p>
                                <p className="text-[10px] text-[var(--text-dim)] mt-0.5">
                                    {mod.attributes.engine} • {mod.attributes.transmission} • {mod.attributes.drivetrain}
                                </p>
                            </div>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}