import { normalizeIdentifierLetters, VIN_LENGTH } from '../lib/config/vin';
import { normalizeFrameNumber } from '../lib/catalogFrameRules';

function canEnterIdentifier(value: string): boolean {
    return value.length <= VIN_LENGTH && (
        /^[A-Z0-9]*$/.test(value) || /^[A-Z](?=[A-Z0-9]*[0-9])[A-Z0-9]{1,7}-[0-9]{0,8}$/.test(value)
    );
}

type Props = {
    vin: string;
    error: string;
    isDecoding: boolean;
    correctedVin?: string;
    onVinChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
};

export default function VinDecodeForm({
                                          vin,
                                          error,
                                          isDecoding,
                                          correctedVin,
                                          onVinChange,
                                          onSubmit,
                                      }: Props) {
    return (
        <form onSubmit={onSubmit} className="mb-8 space-y-6">
            <div>
                <label htmlFor="vehicle-identifier" className="mb-2 block text-sm font-medium text-[var(--text)]">
                    VIN или номер кузова
                </label>

                <input
                    id="vehicle-identifier"
                    type="text"
                    value={vin}
                    maxLength={VIN_LENGTH}
                    onChange={event => {
                        const value = normalizeIdentifierLetters(event.target.value).replace(/\s+/g, '').replace(/[‐‑–—−]/g, '-');
                        if (canEnterIdentifier(value)) onVinChange(value);
                    }}
                    onPaste={event => {
                        event.preventDefault();
                        const { value, selectionStart, selectionEnd } = event.currentTarget;
                        const pasted = normalizeFrameNumber(event.clipboardData.getData('text'));
                        if (!pasted) return;
                        const next = value.slice(0, selectionStart ?? value.length) + pasted +
                            value.slice(selectionEnd ?? value.length);
                        if (canEnterIdentifier(next)) onVinChange(next);
                    }}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Например, NZE141-1234567"
                    aria-describedby="vehicle-identifier-help"
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-4 font-mono text-lg tracking-wider text-[var(--text)] placeholder:text-[var(--text-dim)] transition-colors focus:border-[var(--link)] focus:outline-none focus:ring-2 focus:ring-[var(--link)]/10"
                />

                <p id="vehicle-identifier-help" className="mt-2 px-1 text-xs leading-relaxed text-[var(--text-dim)]">
                    VIN — 17 латинских букв и цифр. Для поиска по кузову введите полный номер с дефисом или код, например GD1.
                </p>
            </div>

            {correctedVin && <p role="status" className="text-sm text-[var(--text-muted)]">Проверьте исправленный VIN · {correctedVin}</p>}

            {error && (
                <div className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3">
                    <p role="alert" className="text-sm text-[var(--danger)]">
                        {error}
                    </p>
                </div>
            )}

            <button
                type="submit"
                disabled={isDecoding}
                className="w-full rounded-2xl bg-[var(--btn-primary)] px-5 py-4 font-medium text-[var(--btn-primary-text)] shadow-sm transition-colors hover:bg-[var(--btn-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isDecoding ? 'Ищем автомобиль…' : 'Найти автомобиль'}
            </button>
        </form>
    );
}
