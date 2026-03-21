'use client'

import { useEffect } from 'react'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) * 100
            const y = (e.clientY / window.innerHeight) * 100

            document.documentElement.style.setProperty('--mx', `${x}%`)
            document.documentElement.style.setProperty('--my', `${y}%`)
            document.documentElement.style.setProperty('--mxpx', `${e.clientX}px`)
            document.documentElement.style.setProperty('--mypx', `${e.clientY}px`)
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    return <>{children}</>
}
