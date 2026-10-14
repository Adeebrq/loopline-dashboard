import type { ButtonHTMLAttributes } from 'react'

export function Button({ className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={`btn ${className}`} {...rest} />
}
