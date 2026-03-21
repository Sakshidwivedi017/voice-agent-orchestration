"use client";

import { useEffect } from "react";

/**
 * Attach once near the root (e.g. in layout or top-level page)
 * so CSS variables --mx, --my, --mxpx, --mypx are kept updated.
 */
export function CursorGlow() {
  useEffect(() => {
    const root = document.documentElement;

    function setMouseVars(clientX: number, clientY: number) {
      const x = Math.max(0, Math.min(1, clientX / window.innerWidth));
      const y = Math.max(0, Math.min(1, clientY / window.innerHeight));
      root.style.setProperty("--mx", (x * 100).toFixed(2) + "%");
      root.style.setProperty("--my", (y * 100).toFixed(2) + "%");
      root.style.setProperty("--mxpx", ((x - 0.5) * 40).toFixed(2) + "px");
      root.style.setProperty("--mypx", ((y - 0.5) * 40).toFixed(2) + "px");
    }

    function onMove(e: MouseEvent) {
      setMouseVars(e.clientX, e.clientY);
    }

    function onTouch(e: TouchEvent) {
      if (!e.touches || !e.touches[0]) return;
      setMouseVars(e.touches[0].clientX, e.touches[0].clientY);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });

    // initial position
    setMouseVars(window.innerWidth * 0.55, window.innerHeight * 0.25);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  return null;
}
