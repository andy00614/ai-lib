"use client"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

type Step = {
  id: number
  label: string
}

export function Stepper({
  steps,
  current,
  className,
}: {
  steps: Step[]
  current: number
  className?: string
}) {
  return (
    <ol className={cn("flex items-center gap-6", className)}>
      {steps.map((s, idx) => {
        const state = s.id < current ? "complete" : s.id === current ? "active" : "upcoming"
        return (
          <li key={s.id} className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-full border text-xs font-semibold",
                state === "complete" && "border-emerald-400 bg-emerald-50 text-emerald-600",
                state === "active" && "border-primary bg-primary text-primary-foreground",
                state === "upcoming" && "border-border bg-background text-muted-foreground"
              )}
            >
              {state === "complete" ? <Check className="size-4" /> : s.id}
            </div>
            <span
              className={cn(
                "text-sm",
                state === "complete" && "text-emerald-600",
                state === "active" && "text-foreground font-medium",
                state === "upcoming" && "text-muted-foreground"
              )}
            >
              {s.label}
            </span>
            {idx < steps.length - 1 && (
              <span className="mx-2 h-px w-10 bg-border" />
            )}
          </li>
        )
      })}
    </ol>
  )
}

