import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hover?: boolean
}

export function Card({ className, hover, children, ...props }: CardProps) {
    return (
        <div
            className={clsx('card', hover && 'card-hover', className)}
            {...props}
        >
            {children}
        </div>
    )
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={clsx('border-b border-gray-200 pb-4 mb-4', className)} {...props}>
            {children}
        </div>
    )
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3 className={clsx('text-lg font-semibold text-gray-900', className)} {...props}>
            {children}
        </h3>
    )
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={clsx(className)} {...props}>
            {children}
        </div>
    )
}
