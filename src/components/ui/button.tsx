import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "glow" | "premium" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/85 shadow-sm hover:shadow transition-all",
      outline: "border border-border bg-surface hover:bg-secondary hover:border-accent/30 text-foreground transition-all",
      ghost: "hover:bg-muted/70 hover:text-foreground transition-colors",
      link: "text-accent underline-offset-4 hover:underline hover:text-accent/80",
      glow: "bg-accent text-accent-foreground shadow-[0_0_12px_rgba(13,148,136,0.25)] hover:shadow-[0_0_20px_rgba(13,148,136,0.4)] transition-shadow duration-300 border border-accent/40",
      premium: "bg-gradient-to-r from-zinc-900 to-zinc-800 text-white border border-white/10 hover:border-white/20 shadow-lg hover:shadow-xl dark:from-white dark:to-zinc-200 dark:text-black transition-all",
      destructive: "bg-red-500/15 text-red-600 border border-red-500/20 hover:bg-red-500/25 hover:border-red-500/30 transition-all",
    }

    const sizes = {
      default: "h-11 px-5 py-2.5 text-sm min-h-[44px]", // Touch friendly min-height
      sm: "h-9 px-3 py-2 text-xs",
      lg: "h-14 px-8 text-base font-semibold leading-none",
      icon: "h-10 w-10 p-0 grid place-items-center", // Square icon button
    }

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50 select-none",
          "[&_svg]:size-4 [&_svg]:shrink-0", // Enforce icon size and no shrink
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
