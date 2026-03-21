import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '../forms/Button';
import styles from './Pagination.module.css';

export interface PaginationProps {
    /**
     * Current active page
     */
    currentPage: number;

    /**
     * Total number of pages
     */
    totalPages: number;

    /**
     * Callback when page changes
     */
    onPageChange: (page: number) => void;

    /**
     * Additional CSS classes
     */
    className?: string;
}

/**
 * Pagination component for navigating through paged data.
 */
export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className,
}: PaginationProps) {
    const canGoPrev = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    return (
        <nav
            className={cn(styles.pagination, className)}
            aria-label="Pagination"
        >
            <Button
                variant="secondary"
                size="sm"
                disabled={!canGoPrev}
                onClick={() => onPageChange(currentPage - 1)}
                className={styles.prev}
            >
                Previous
            </Button>

            <div className={styles.info}>
                Page <span className={styles.current}>{currentPage}</span> of {totalPages}
            </div>

            <Button
                variant="secondary"
                size="sm"
                disabled={!canGoNext}
                onClick={() => onPageChange(currentPage + 1)}
                className={styles.next}
            >
                Next
            </Button>
        </nav>
    );
}
