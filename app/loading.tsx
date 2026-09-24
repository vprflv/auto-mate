export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] transition-colors duration-200">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--btn-primary)] border-t-transparent" />

                <p className="text-sm text-[var(--text-muted)]">
                    Загрузка приложения...
                </p>
            </div>
        </div>
    );
}