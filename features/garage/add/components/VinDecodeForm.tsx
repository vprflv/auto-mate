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
        <form onSubmit={onSubmit} className="space-y-5 mb-8">
            <div>
                <label className="block text-sm text-zinc-400 mb-2">VIN-код</label>
                <input
                    type="text"
                    value={vin}
                    onChange={(e) => onVinChange(e.target.value.toUpperCase())}
                    maxLength={17}
                    placeholder="WBA3A5C52EP602456"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-blue-500 tracking-wider"
                />
                <p className="text-xs text-zinc-500 mt-2">
                    17 символов • можно найти на лобовом стекле или в СТС
                </p>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
                type="submit"
                disabled={isDecoding}
                className="w-full bg-white text-black font-medium py-4 rounded-2xl hover:bg-zinc-200 transition disabled:opacity-50"
            >
                {isDecoding ? 'Расшифровываем...' : 'Расшифровать VIN'}
            </button>
        </form>
    );
}