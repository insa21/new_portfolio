"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"

export function ThemeToggle({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { setTheme, resolvedTheme } = useTheme()
  // Use callback ref pattern to track mounting without setState in effect
  const [mounted, setMounted] = useState(false)

  const mountRef = useCallback(() => {
    setMounted(true)
  }, [])

  // Use ref callback on first render effect
  React.useEffect(() => {
    mountRef()
  }, [mountRef])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={cn("relative", className)} {...props}>
        <span className="sr-only">Loading theme</span>
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 0 : 1,
          rotate: isDark ? -100 : 0,
          opacity: isDark ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Sun className="h-5 w-5 fill-current" />
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 1 : 0,
          rotate: isDark ? 0 : 100,
          opacity: isDark ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="flex items-center justify-center"
      >
        <Moon className="h-5 w-5 fill-current" />
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
