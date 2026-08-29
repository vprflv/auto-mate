export default function Loading() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-[#39FF14] border-t-transparent rounded-full animate-spin" />
                <p className="text-[#A3A3A3] text-sm">Загрузка AutoMate...</p>
            </div>
        </div>
    );
}