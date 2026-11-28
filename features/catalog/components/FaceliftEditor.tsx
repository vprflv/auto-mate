import { faceliftNumber, faceliftValues, formatFacelift, normalizeFacelift, parseFacelift } from '../lib/facelift';

type Props = {
    value?: string;
    onChange: (value: string) => void;
    className: string;
};

export function FaceliftEditor({ value, onChange, className }: Props) {
    const version = normalizeFacelift(value);
    const number = faceliftNumber(version);
    const base = number ? 'facelift' : version;

    function changeNumber(input: string) {
        if (input === '') {
            onChange('facelift');
            return;
        }
        if (!/^\d+$/u.test(input)) return;
        const parsed = parseFacelift(`facelift_${input}`);
        if (parsed) onChange(parsed);
    }

    return (
        <div className="space-y-2">
            <label className="block space-y-1">
                <span className="text-xs font-medium text-[var(--text-muted)]">Версия кузова</span>
                <select value={base} onChange={event => onChange(event.target.value === 'unknown' ? '' : event.target.value)} className={className}>
                    {faceliftValues.map(option => <option key={option} value={option}>{formatFacelift(option)}</option>)}
                </select>
            </label>
            {base === 'facelift' && (
                <label className="block space-y-1">
                    <span className="text-xs font-medium text-[var(--text-muted)]">Номер рестайлинга (необязательно)</span>
                    <input type="text" inputMode="numeric" value={number} onChange={event => changeNumber(event.target.value)}
                        placeholder="Например, 2" className={className} />
                </label>
            )}
        </div>
    );
}
