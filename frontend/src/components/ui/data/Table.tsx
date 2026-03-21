import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Table.module.css';

export interface TableProps {
    /**
     * Column headers
     */
    headers: readonly string[];
    rows: readonly (readonly React.ReactNode[])[];

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Zebra striping
     * @default false
     */
    striped?: boolean;
}

/**
 * Table component for displaying structured tabular data.
 */
export function Table({
    headers,
    rows,
    className,
    striped = false,
}: TableProps) {
    return (
        <div className={cn(styles.wrapper, className)}>
            <table className={cn(styles.table, striped && styles.striped)}>
                <thead>
                    <tr>
                        {headers.map((header) => (
                            <th key={header} className={styles.th}>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className={styles.tr}>
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className={styles.td}>
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
