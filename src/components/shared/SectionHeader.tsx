import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export default function SectionHeader({ title, subtitle, actionLabel, onAction, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between", className)}>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="flex items-center gap-0.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors shrink-0 cursor-pointer"
        >
          {actionLabel}
          <ChevronRight className="size-3.5" />
        </button>
      )}
    </div>
  )
}
