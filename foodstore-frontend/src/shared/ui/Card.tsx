import type { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement>

export default function Card({
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-white shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}