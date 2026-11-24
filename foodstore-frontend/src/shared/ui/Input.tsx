import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export default function Input({
  className = '',
  ...props
}: InputProps) {
  return (
    <input
      className={`w-full rounded-xl border px-4 py-2 outline-none focus:border-[#788B50] ${className}`}
      {...props}
    />
  )
}