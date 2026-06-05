'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

function hexToHsl(hex: string): string {
  // Convert hex color to HSL for CSS variables
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export default function BrandingProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const branding = (session?.user as any)?.company?.branding

  useEffect(() => {
    if (!branding) return

    const root = document.documentElement

    if (branding.primary_color && /^#[0-9A-Fa-f]{6}$/.test(branding.primary_color)) {
      try {
        const hsl = hexToHsl(branding.primary_color)
        root.style.setProperty('--primary', hsl)
        root.style.setProperty('--ring', hsl)
      } catch {}
    }

    if (branding.secondary_color && /^#[0-9A-Fa-f]{6}$/.test(branding.secondary_color)) {
      try {
        const hsl = hexToHsl(branding.secondary_color)
        root.style.setProperty('--secondary', hsl)
      } catch {}
    }

    // Update page title with company name
    const companyName = (session?.user as any)?.company?.name
    if (companyName) {
      document.title = `${companyName} — Risk Management`
    }
  }, [branding, session])

  return <>{children}</>
}
