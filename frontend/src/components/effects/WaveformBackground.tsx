'use client';

import React, { useEffect, useRef } from 'react';
import styles from './WaveformBackground.module.css';

/**
 * Animated waveform background effect for hero sections.
 * Creates subtle pulsing orbs that animate continuously.
 */
export default function WaveformBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Animation parameters
        let frame = 0;
        const orbs = [
            { x: 0.3, y: 0.4, radius: 150, speed: 0.002, color: 'rgba(255, 106, 0, 0.15)' },
            { x: 0.7, y: 0.6, radius: 200, speed: 0.0015, color: 'rgba(255, 138, 31, 0.1)' },
            { x: 0.5, y: 0.5, radius: 180, speed: 0.0025, color: 'rgba(255, 174, 0, 0.08)' },
        ];

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            orbs.forEach((orb) => {
                const x = canvas.width * orb.x;
                const y = canvas.height * orb.y;
                const pulse = Math.sin(frame * orb.speed) * 20;
                const radius = orb.radius + pulse;

                // Create radial gradient
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, orb.color);
                gradient.addColorStop(1, 'rgba(255, 106, 0, 0)');

                // Draw orb
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            });

            frame++;
            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
        };
    }, []);

    return <canvas ref={canvasRef} className={styles.waveformCanvas} />;
}
