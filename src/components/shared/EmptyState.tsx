import type React from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2 text-center py-8 px-6", className)}>
      <div className="text-muted-foreground">{icon}</div>
      <p className="text-xs font-bold text-foreground">{title}</p>
      {description && (
        <p className="text-[10px] text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  )
}
