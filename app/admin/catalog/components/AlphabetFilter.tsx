interface Props {
    availableLetters: string[];
    selectedLetter: string;
    onSelectLetter: (letter: string) => void;
}

export function AlphabetFilter({
                                   availableLetters,
                                   selectedLetter,
                                   onSelectLetter,
                               }: Props) {
    return (
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2">
            <button
                type="button"
                onClick={() => onSelectLetter('all')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    selectedLetter === 'all'
                        ? 'bg-[var(--text)] text-[var(--bg)]'
                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]'
                }`}
            >
                Все
            </button>
            {availableLetters.map((letter) => {
                const active = selectedLetter === letter;
                return (
                    <button
                        key={letter}
                        type="button"
                        onClick={() => onSelectLetter(letter)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                            active
                                ? 'bg-[var(--text)] text-[var(--bg)]'
                                : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]'
                        }`}
                    >
                        {letter}
                    </button>
                );
            })}
        </div>
    );
}