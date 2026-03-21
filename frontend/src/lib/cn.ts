/**
 * Class name merge utility
 * 
 * Combines multiple class names, filtering out falsy values.
 * Useful for conditional class application in React components.
 * 
 * @example
 * cn('base', isActive && 'active', className)
 * // => 'base active custom-class'
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}
