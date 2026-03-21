'use client'

import React, { FormEvent } from 'react'
import { cn } from '@/lib/cn'
import styles from './Form.module.css'
import { Input } from './Input'
import { Textarea } from './Textarea'
import { Button } from './Button'
import { Stack } from '../layout/Stack'
import { Grid } from '../layout/Grid'

export interface FormField {
    /**
     * Field type
     */
    type: 'text' | 'email' | 'password' | 'number' | 'textarea'

    /**
     * Field name (for form submission)
     */
    name: string

    /**
     * Placeholder text
     */
    placeholder: string

    /**
     * Whether field is required
     * @default false
     */
    required?: boolean

    /**
     * Number of rows (textarea only)
     * @default 4
     */
    rows?: number
}

export interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
    /**
     * Form fields configuration
     */
    fields: FormField[]

    /**
     * Submit handler
     */
    onSubmit: (e: FormEvent<HTMLFormElement>, data: Record<string, FormDataEntryValue>) => void

    /**
     * Submit button label
     * @default 'Submit'
     */
    submitLabel?: string

    /**
     * Submit button variant
     * @default 'primary'
     */
    submitVariant?: 'primary' | 'secondary' | 'tertiary' | 'danger'

    /**
     * Show submit button
     * @default true
     */
    showSubmit?: boolean

    /**
     * Additional CSS classes
     */
    className?: string

    /**
     * Form content
     */
    children?: React.ReactNode
}

/**
 * Reusable Form component with automatic field rendering.
 * 
 * @example
 * <Form
 *   fields={[
 *     { type: 'textarea', name: 'message', placeholder: 'Your message', required: true, rows: 4 },
 *     { type: 'text', name: 'name', placeholder: 'Your name', required: true },
 *     { type: 'email', name: 'email', placeholder: 'Your email', required: true }
 *   ]}
 *   onSubmit={(e, data) => console.log(data)}
 *   submitLabel="Send"
 * />
 */
export const Form = React.forwardRef<HTMLFormElement, FormProps>(
    (
        {
            fields,
            onSubmit,
            submitLabel = 'Submit',
            submitVariant = 'primary',
            showSubmit = true,
            className,
            children,
            ...props
        },
        ref
    ) => {
        const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const data = Object.fromEntries(formData)
            onSubmit(e, data)
        }

        // Separate textarea from input fields
        const textareaFields = fields.filter(f => f.type === 'textarea')
        const inputFields = fields.filter(f => f.type !== 'textarea')

        return (
            <form
                ref={ref}
                className={cn(styles.form, className)}
                onSubmit={handleSubmit}
                {...props}
            >
                <Stack gap="24">
                    {/* Textarea fields first */}
                    {textareaFields.map((field) => (
                        <Textarea
                            key={field.name}
                            name={field.name}
                            placeholder={field.placeholder}
                            required={field.required}
                            rows={field.rows || 4}
                        />
                    ))}

                    {/* Input fields in grid (side by side) */}
                    {inputFields.length > 0 && (
                        <Grid columns={{ base: 1, md: inputFields.length as 1 | 2 }} gap="16">
                            {inputFields.map((field) => (
                                <Input
                                    key={field.name}
                                    type={field.type}
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                />
                            ))}
                        </Grid>
                    )}

                    {children}

                    {showSubmit && (
                        <div className={styles.actions}>
                            <Button variant={submitVariant} type="submit">
                                {submitLabel}
                            </Button>
                        </div>
                    )}
                </Stack>
            </form>
        )
    }
)

Form.displayName = 'Form'
