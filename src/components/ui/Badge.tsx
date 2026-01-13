import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'gray'
}

export function Badge({ className, variant = 'gray', children, ...props }: BadgeProps) {
    return (
        <span
            className={clsx(
                'badge',
                {
                    'badge-primary': variant === 'primary',
                    'badge-success': variant === 'success',
                    'badge-warning': variant === 'warning',
                    'badge-danger': variant === 'danger',
                    'badge-gray': variant === 'gray',
                },
                className
            )}
            {...props}
        >
            {children}
        </span>
    )
}
