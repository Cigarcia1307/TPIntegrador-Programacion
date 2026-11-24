import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export default function Button({
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`rounded-xl px-5 py-2 font-semibold disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}