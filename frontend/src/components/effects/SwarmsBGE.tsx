'use client'

import { useEffect, useRef } from 'react'
import styles from '@/app/agents/page.module.css' // We might need to handle this CSS dependency, but for now assuming it fits or we inline

export default function SwarmsBGE() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const c = canvasRef.current
        if (!c) return

        const ctx = c.getContext('2d')
        if (!ctx) return

        let w: number, h: number, dpr: number
        const N = 80
        const pts: any[] = []

        const rnd = (a: number, b: number) => a + Math.random() * (b - a)

        const resize = () => {
            dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
            w = c.width = Math.floor(window.innerWidth * dpr)
            h = c.height = Math.floor(window.innerHeight * dpr)
            c.style.width = window.innerWidth + 'px'
            c.style.height = window.innerHeight + 'px'
        }

        const seed = () => {
            pts.length = 0
            for (let i = 0; i < N; i++) pts.push({ x: rnd(0, w), y: rnd(0, h), vx: rnd(-.12, .12) * dpr, vy: rnd(-.12, .12) * dpr })
        }

        let animId: number
        const draw = () => {
            ctx.clearRect(0, 0, w, h)
            // links
            for (let i = 0; i < N; i++) {
                for (let j = i + 1; j < N; j++) {
                    const a = pts[i], b = pts[j]
                    const dx = a.x - b.x, dy = a.y - b.y
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < 170 * dpr) {
                        const alpha = (1 - (dist / (170 * dpr))) * 0.12
                        ctx.strokeStyle = `rgba(255,106,0,${alpha})`
                        ctx.lineWidth = 1 * dpr
                        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
                    }
                }
            }
            // nodes
            for (const p of pts) {
                const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10 * dpr)
                g.addColorStop(0, `rgba(255,106,0,.18)`); g.addColorStop(1, `rgba(255,106,0,0)`)
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 10 * dpr, 0, Math.PI * 2); ctx.fill()

                ctx.fillStyle = `rgba(255,255,255,.16)`; ctx.beginPath(); ctx.arc(p.x, p.y, 2.2 * dpr, 0, Math.PI * 2); ctx.fill()
                p.x += p.vx; p.y += p.vy
                if (p.x < 0 || p.x > w) p.vx *= -1
                if (p.y < 0 || p.y > h) p.vy *= -1
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
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', opacity: 0.85 }} />
        </div>
    )
}
