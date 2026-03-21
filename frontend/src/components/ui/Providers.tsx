'use client'

import { ThemeProvider } from 'next-themes'
import { ToastProvider } from '@/components/ui/overlays/Toast'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={true}>
            <ToastProvider>
                {children}
            </ToastProvider>
        </ThemeProvider>
    )
}
