type Props = {
    vin: string;
    error: string;
    isDecoding: boolean;
    onVinChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
};

export default function VinDecodeForm({
                                          vin,
                                          error,
                                          isDecoding,
                                          onVinChange,
                                          onSubmit,
                                      }: Props) {
    return (
        <form onSubmit={onSubmit} className="mb-8 space-y-6">
            <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                    VIN-код
                </label>

                <input
                    type="text"
                    value={vin}
                    onChange={(e) =>
                        onVinChange(e.target.value.toUpperCase())
                    }
                    maxLength={17}
                    placeholder="WBA3A5C52EP602456"
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-4 font-mono text-lg tracking-wider text-[var(--text)] placeholder:text-[var(--text-dim)] transition-colors focus:border-[var(--link)] focus:outline-none focus:ring-2 focus:ring-[var(--link)]/10"
                />

                <p className="mt-2 px-1 text-xs leading-relaxed text-[var(--text-dim)]">
                    17 символов • можно найти на лобовом стекле или в СТС
                </p>
            </div>

            {error && (
                <div className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3">
                    <p className="text-sm text-[var(--danger)]">
                        {error}
                    </p>
                </div>
            )}

            <button
                type="submit"
                disabled={isDecoding}
                className="w-full rounded-2xl bg-[var(--btn-primary)] px-5 py-4 font-medium text-[var(--btn-primary-text)] shadow-sm transition-colors hover:bg-[var(--btn-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isDecoding
                    ? 'Расшифровываем...'
                    : 'Расшифровать VIN'}
            </button>
        </form>
    );
}