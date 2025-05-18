import type React from "react"
import { cn } from "@/lib/utils"

interface PulsingBadgeProps {
  children: React.ReactNode
  className?: string
  dotClassName?: string
  dotPosition?: "left" | "right" | "none"
}

export function PulsingBadge({ children, className, dotClassName, dotPosition = "left" }: PulsingBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center px-4 py-2 rounded-full bg-avblue-50 dark:bg-avblue-900/30 text-avblue-600 dark:text-avblue-300 text-sm font-medium",
        className,
      )}
    >
      {dotPosition === "left" && (
        <span className={cn("relative flex h-2 w-2 mr-2", dotClassName)}>
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-avblue-600 dark:bg-avblue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-avblue-600 dark:bg-avblue-400"></span>
        </span>
      )}

      {children}

      {dotPosition === "right" && (
        <span className={cn("relative flex h-2 w-2 ml-2", dotClassName)}>
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-avblue-600 dark:bg-avblue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-avblue-600 dark:bg-avblue-400"></span>
        </span>
      )}
    </div>
  )
}
