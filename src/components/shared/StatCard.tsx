import { cn } from "@/lib/utils"

interface StatCardProps {
  value: string | number
  label: string
  className?: string
}

export default function StatCard({ value, label, className }: StatCardProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <span className="text-lg font-bold text-foreground leading-none">{value}</span>
      <span className="text-[11px] text-muted-foreground font-medium mt-1">{label}</span>
    </div>
  )
}
