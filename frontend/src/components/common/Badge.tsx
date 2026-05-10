import type { ReactNode } from 'react'

type BadgeColor = 'brand' | 'green' | 'yellow' | 'red' | 'gray'

interface BadgeProps {
  children: ReactNode
  color?: BadgeColor
  className?: string
}

const colorMap: Record<BadgeColor, string> = {
  brand: 'bg-brand-500/20 text-brand-300 border border-brand-500/30',
  green: 'bg-accent-500/20 text-accent-400 border border-accent-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  red: 'bg-red-500/20 text-red-300 border border-red-500/30',
  gray: 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
}

const Badge = ({ children, color = 'brand', className = '' }: BadgeProps) => {
  return (
    <span className={`badge ${colorMap[color]} ${className}`}>
      {children}
    </span>
  )
}

export default Badge
