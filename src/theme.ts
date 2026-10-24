import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

/** Theme starts from the saved choice or the system setting (see index.html). */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(currentTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    // Colors the phone's status bar to match the page background
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0a110d' : '#f6f7f1')
  }, [theme])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    try {
      localStorage.setItem('sr-theme', next)
    } catch {
      // storage unavailable
    }
  }

  return [theme, toggle]
}
