'use client'

import { useEffect, useRef } from 'react'

export default function EmbersBGE() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const c = canvasRef.current
        if (!c) return

        const ctx = c.getContext('2d')
        if (!ctx) return

        let w: number, h: number, dpr: number
        const N = 90
        const pts: any[] = []

        const rnd = (a: number, b: number) => a + Math.random() * (b - a)

        const resize = () => {
            dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
            w = c.width = Math.floor(window.innerWidth * dpr)
            h = c.height = Math.floor(window.innerHeight * dpr)
            // c.style.width = window.innerWidth + 'px' // Handled by CSS usually, but good for safety
            // c.style.height = window.innerHeight + 'px'
        }

        const seed = () => {
            pts.length = 0
            for (let i = 0; i < N; i++) {
                pts.push({
                    x: rnd(0, w),
                    y: rnd(0, h),
                    r: rnd(0.6, 2.4) * dpr,
                    vx: rnd(-0.10, 0.10) * dpr,
                    vy: rnd(-0.22, -0.04) * dpr,
                    a: rnd(0.06, 0.22)
                })
            }
        }

        let animId: number
        const draw = () => {
            ctx.clearRect(0, 0, w, h)
            for (const p of pts) {
                const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8)
                g.addColorStop(0, `rgba(255,106,0,${p.a})`)
                g.addColorStop(0.45, `rgba(255,138,31,${p.a * 0.55})`)
                g.addColorStop(1, `rgba(255,138,31,0)`)
                ctx.fillStyle = g
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2)
                ctx.fill()

                ctx.fillStyle = `rgba(255,255,255,${p.a * 0.55})`
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fill()

                p.x += p.vx
                p.y += p.vy

                if (p.y < -20 * dpr) { p.y = h + 20 * dpr; p.x = rnd(0, w) }
                if (p.x < -20 * dpr) p.x = w + 20 * dpr
                if (p.x > w + 20 * dpr) p.x = -20 * dpr
            }
            animId = requestAnimationFrame(draw)
        }

        resize()
        seed()
        draw()

        const onResize = () => { resize(); seed(); }
        window.addEventListener('resize', onResize)

        return () => {
            window.removeEventListener('resize', onResize)
            cancelAnimationFrame(animId)
        }
    }, [])

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} aria-hidden="true"></canvas>
        </div>
    )
}
