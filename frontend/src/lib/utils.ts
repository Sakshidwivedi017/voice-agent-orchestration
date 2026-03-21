/**
 * Utility to combine CSS class names conditionally.
 * Equivalent to a lightweight version of 'clsx' or 'classnames'.
 */
export function cn(...inputs: (string | boolean | undefined | null | { [key: string]: any })[]) {
    const classes: string[] = []

    for (const input of inputs) {
        if (!input) continue

        if (typeof input === 'string') {
            classes.push(input)
        } else if (typeof input === 'object') {
            for (const [key, value] of Object.entries(input)) {
                if (value) {
                    classes.push(key)
                }
            }
        }
    }

    return classes.join(' ')
}

/**
 * Formats a date to a readable string.
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })
}
