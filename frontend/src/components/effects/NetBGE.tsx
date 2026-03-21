'use client'

import { useEffect, useRef } from 'react'

export default function NetBGE() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const c = canvasRef.current
        if (!c) return

        const ctx = c.getContext('2d', { alpha: true })
        if (!ctx) return

        let w = 0, h = 0, dpr = 1
        const N = 72
        const LINK_DIST = 170
        const SPEED = 0.22
        const WIRE_ALPHA = 0.22
        const NODE_ALPHA = 0.10
        const THICKNESS = 1

        const nodes: any[] = []

        const rnd = (a: number, b: number) => a + Math.random() * (b - a)

        const getPurple = () => getComputedStyle(document.documentElement).getPropertyValue('--orange').trim() || '#ff6a00'
        const getOrange2 = () => getComputedStyle(document.documentElement).getPropertyValue('--orange2').trim() || '#ff8a1f'

        const resize = () => {
            const rect = c.getBoundingClientRect()
            w = c.width = Math.floor(rect.width)
            h = c.height = Math.floor(rect.height)
            dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
            c.width = Math.floor(w * dpr)
            c.height = Math.floor(h * dpr)
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

            nodes.length = 0
            for (let i = 0; i < N; i++) {
                nodes.push({
                    x: rnd(0, w),
                    y: rnd(0, h),
                    vx: rnd(-1, 1) * SPEED,
                    vy: rnd(-1, 1) * SPEED,
                    phase: rnd(0, Math.PI * 2)
                })
            }
        }

        const wrap = (n: any) => {
            const pad = 24
            if (n.x < -pad) n.x = w + pad
            if (n.x > w + pad) n.x = -pad
            if (n.y < -pad) n.y = h + pad
            if (n.y > h + pad) n.y = -pad
        }

        let animId: number
        const draw = (t: number) => {
            ctx.clearRect(0, 0, w, h)

            const startColor = getPurple()
            const endColor = getOrange2()

            const grad = ctx.createLinearGradient(0, 0, w, h)
            grad.addColorStop(0, startColor)
            grad.addColorStop(1, endColor)

            for (const n of nodes) {
                n.x += n.vx
                n.y += n.vy

                const wobble = 0.12
                n.x += Math.cos(t * 0.00035 + n.phase) * wobble
                n.y += Math.sin(t * 0.00035 + n.phase) * wobble
                wrap(n)
            }

            ctx.strokeStyle = grad
            for (let i = 0; i < nodes.length; i++) {
                const a = nodes[i]
                for (let j = i + 1; j < nodes.length; j++) {
                    const b = nodes[j]
                    const dx = a.x - b.x
                    const dy = a.y - b.y
                    const d2 = dx * dx + dy * dy

                    if (d2 < LINK_DIST * LINK_DIST) {
                        const d = Math.sqrt(d2)
                        const strength = 1 - d / LINK_DIST
                        ctx.lineWidth = THICKNESS + strength * 0.9
                        ctx.globalAlpha = WIRE_ALPHA * strength
                        ctx.beginPath()
                        ctx.moveTo(a.x, a.y)
                        ctx.lineTo(b.x, b.y)
                        ctx.stroke()
                    }
                }
            }

            ctx.fillStyle = grad
            ctx.globalAlpha = NODE_ALPHA
            for (const n of nodes) {
                ctx.beginPath()
                ctx.arc(n.x, n.y, 1.2, 0, Math.PI * 2)
                ctx.fill()
            }
            animId = requestAnimationFrame(draw)
        }

        resize()
        animId = requestAnimationFrame(draw)

        const onResize = () => { resize() }
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
