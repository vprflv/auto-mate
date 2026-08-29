'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/features/auth/components/AuthProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 5 * 60 * 1000,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                {children}
                <Toaster
                    theme="dark"
                    position="top-center"
                    offset={{ top: 24 }}
                    richColors
                    closeButton
                    toastOptions={{
                        classNames: {
                            toast: 'bg-[#161616] border border-[#2A2A2A] text-[#F5F5F5]',
                            title: 'text-[#F5F5F5]',
                            description: 'text-[#A3A3A3]',
                            actionButton: 'bg-[#39FF14] text-black font-medium',
                            cancelButton: 'bg-[#1F1F1F] text-[#F5F5F5]',
                            closeButton: 'text-[#A3A3A3] hover:text-[#F5F5F5]',
                        },
                    }}
                />
            </AuthProvider>
        </QueryClientProvider>
    );
}