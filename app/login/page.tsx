'use client';

import HomeAuthForm from '@/features/auth/components/HomeAuthForm';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] relative">
            <div className="fixed inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: "url('/images/head_green.jpg')",
                        backgroundPosition: 'center top',
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
            </div>

            <div className="relative z-10">
                <HomeAuthForm />
            </div>
        </div>
    );
}