import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRiskBandColor(band: string) {
  const map: Record<string, string> = {
    low:      'text-green-600 bg-green-50  border-green-200',
    medium:   'text-amber-600 bg-amber-50  border-amber-200',
    high:     'text-orange-600 bg-orange-50 border-orange-200',
    critical: 'text-red-600   bg-red-50    border-red-200',
  }
  return map[band] ?? 'text-gray-600 bg-gray-50 border-gray-200'
}

export function formatScore(score: number | null): string {
  if (score === null || score === undefined) return '—'
  return score.toFixed(1)
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
}
