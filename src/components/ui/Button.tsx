import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={clsx(
                    'btn',
                    {
                        'btn-primary': variant === 'primary',
                        'btn-secondary': variant === 'secondary',
                        'btn-success': variant === 'success',
                        'btn-danger': variant === 'danger',
                        'hover:bg-gray-100': variant === 'ghost',
                        'btn-sm': size === 'sm',
                        'btn-md': size === 'md',
                        'btn-lg': size === 'lg',
                    },
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <div className="spinner w-4 h-4 mr-2" />
                )}
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'
