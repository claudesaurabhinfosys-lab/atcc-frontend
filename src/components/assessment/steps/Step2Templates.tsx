'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import type { RiskModule } from '@/types'

interface Props {
  selected: string[]
  onChange: (codes: string[]) => void
}

export default function Step2Templates({ selected, onChange }: Props) {
  const [modules, setModules] = useState<RiskModule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/risk-modules').then(r => setModules(r.data ?? [])).finally(() => setLoading(false))
  }, [])

  const toggle = (code: string) => {
    onChange(selected.includes(code) ? selected.filter(c => c !== code) : [...selected, code])
  }

  const selectAll = () => onChange(modules.map(m => m.module_code))
  const clearAll  = () => onChange([])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Select Risk Templates</h2>
          <p className="text-sm text-gray-500 mt-0.5">Choose which risk areas apply to this assessment. {selected.length} selected.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={selectAll} className="text-xs text-primary hover:underline">Select All</button>
          <span className="text-gray-300">|</span>
          <button onClick={clearAll} className="text-xs text-gray-500 hover:underline">Clear</button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-2">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {modules.map((m, i) => {
            const isSelected = selected.includes(m.module_code)
            return (
              <button
                key={m.id}
                onClick={() => toggle(m.module_code)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border text-left transition',
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                )}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold',
                  isSelected ? 'border-primary bg-primary text-white' : 'border-gray-300 text-gray-400'
                )}>
                  {isSelected ? '✓' : String(i + 1).padStart(2, '0')}
                </div>
                <span className="text-sm font-medium">{m.name}</span>
              </button>
            )
          })}
        </div>
      )}

      {selected.length === 0 && (
        <p className="text-amber-600 text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Select at least one template to continue.
        </p>
      )}
    </div>
  )
}
