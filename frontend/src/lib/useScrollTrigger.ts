import { useEffect, useRef, useState } from 'react';

export interface UseScrollTriggerOptions {
    /**
     * Threshold for triggering the animation (0-1)
     * @default 0.1
     */
    threshold?: number;
    
    /**
     * Root margin for the intersection observer
     * @default '0px'
     */
    rootMargin?: string;
    
    /**
     * Trigger only once
     * @default true
     */
    once?: boolean;
}

/**
 * Custom hook for scroll-triggered animations using Intersection Observer API.
 * Returns a ref to attach to the element and a boolean indicating if it's visible.
 * 
 * @example
 * const [ref, isVisible] = useScrollTrigger({ threshold: 0.2, once: true });
 * 
 * return (
 *   <div ref={ref} className={isVisible ? 'animate-in' : ''}>
 *     Content
 *   </div>
 * );
 */
export function useScrollTrigger<T extends HTMLElement = HTMLDivElement>(
    options: UseScrollTriggerOptions = {}
): [React.RefObject<T>, boolean] {
    const { threshold = 0.1, rootMargin = '0px', once = true } = options;
    const ref = useRef<T>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) {
                        observer.unobserve(element);
                    }
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            {
                threshold,
                rootMargin,
            }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [threshold, rootMargin, once]);

    return [ref, isVisible];
}
