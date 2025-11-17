'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import icons to avoid hydration issues
const Moon = dynamic(() => import('lucide-react').then(mod => mod.Moon), { ssr: false })
const Sun = dynamic(() => import('lucide-react').then(mod => mod.Sun), { ssr: false })

export default function DarkModeToggle() {
  // Initialize state based on localStorage only (default to light)
  const getInitialDarkMode = () => {
    if (typeof window === 'undefined') return false
    const savedTheme = localStorage.getItem('theme')
    return savedTheme === 'dark'
  }

  const [isDark, setIsDark] = useState(getInitialDarkMode)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Apply the initial theme
    const shouldBeDark = getInitialDarkMode()
    setIsDark(shouldBeDark)

    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)

    if (newIsDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
      aria-label="Toggle dark mode"
    >
      {mounted && (
        isDark ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-gray-600 dark:text-slate-300" />
        )
      )}
    </button>
  )
}