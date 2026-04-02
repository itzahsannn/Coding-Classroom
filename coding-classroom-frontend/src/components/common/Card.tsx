import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
}

const Card = ({ children, className = '', hover = false, glow = false }: CardProps) => {
  const baseClass = hover ? 'glass-hover' : 'glass'
  const glowClass = glow ? 'animate-glow' : ''

  return (
    <div className={`${baseClass} ${glowClass} p-6 ${className}`}>
      {children}
    </div>
  )
}

export default Card
