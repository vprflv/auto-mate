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
                <label className="block text-sm text-[#39FF14] mb-2">VIN-код</label>
                <input
                    type="text"
                    value={vin}
                    onChange={(e) => onVinChange(e.target.value.toUpperCase())}
                    maxLength={17}
                    placeholder="WBA3A5C52EP602456"
                    className="w-full bg-[#161616] border border-[#2A2A2A] rounded-2xl px-5 py-4 text-lg text-[#F5F5F5] placeholder:text-[#666666] focus:outline-none focus:border-[#39FF14] transition tracking-wider font-mono"
                />
                <p className="text-xs text-[#666666] mt-2">
                    17 символов • можно найти на лобовом стекле или в СТС
                </p>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
                type="submit"
                disabled={isDecoding}
                className="w-full bg-[#39FF14] hover:bg-[#57FF3A] text-black font-medium py-4 rounded-2xl transition disabled:opacity-50"
            >
                {isDecoding ? 'Расшифровываем...' : 'Расшифровать VIN'}
            </button>
        </form>
    );
}