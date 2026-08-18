import type React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface MenuRowProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
  rightContent?: React.ReactNode
  onClick?: () => void
  className?: string
}

export default function MenuRow({ icon, title, subtitle, rightContent, onClick, className }: MenuRowProps) {
  const content = (
    <div className={cn("flex items-center justify-between py-3 px-4", onClick && "cursor-pointer group", className)}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="size-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-foreground">{title}</div>
          {subtitle && (
            <div className="text-[10px] text-muted-foreground font-normal truncate">{subtitle}</div>
          )}
        </div>
      </div>
      {rightContent ?? (
        <ChevronRight className="size-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
      )}
    </div>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn("w-full text-left transition-colors hover:bg-muted/50", className)}
      >
        {content}
      </button>
    )
  }

  return <div className={className}>{content}</div>
}
