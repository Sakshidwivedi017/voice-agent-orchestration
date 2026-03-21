'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

export default function LightTheme() {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme, resolvedTheme } = useTheme()

    // useEffect only runs on the client, so now we can safely show the UI
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="toggle-placeholder" style={{ width: '80px', height: '32px' }}></div>
    }

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'light' ? 'dark' : 'light')
    }

    // Use resolvedTheme for accurately showing the icon even if mode is 'system'
    const isDark = resolvedTheme === 'dark'

    return (
        <button
            className="toggle"
            id="themeToggle"
            type="button"
            aria-label="Toggle light/dark mode"
            onClick={toggleTheme}
        >
            <span id="themeIcon" aria-hidden="true" dangerouslySetInnerHTML={{
                __html: isDark ?
                    `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 17.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Z" fill="currentColor" opacity=".9"/><path d="M12 2.8v2.1M12 19.1v2.1M3.2 12h2.1M18.7 12h2.1M4.8 4.8l1.5 1.5M17.7 17.7l1.5 1.5M19.2 4.8l-1.5 1.5M6.3 17.7l-1.5 1.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".9"/></svg>` :
                    `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 13.2A7.7 7.7 0 1 1 10.8 3a6.9 6.9 0 0 0 10.2 10.2Z" fill="currentColor" opacity=".9"/></svg>`
            }}></span>
            <span id="themeLabel">{isDark ? 'Light' : 'Dark'}</span>
        </button>
    )
}
