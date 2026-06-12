'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface Hazard {
  id: number
  hazard_code: string
  module_code: string
  hazard_text: string
  cause?: string
  consequence?: string
}

interface Props {
  moduleCodes: string[]
  selected: string[]
  onChange: (codes: string[]) => void
}

export default function Step3Hazards({ moduleCodes, selected, onChange }: Props) {
  const [hazardsByModule, setHazardsByModule] = useState<Record<string, Hazard[]>>({})
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(moduleCodes[0] ?? null)

  useEffect(() => {
    const load = async () => {
      const results: Record<string, Hazard[]> = {}
      await Promise.all(moduleCodes.map(async code => {
        try {
          const r = await api.get(`/risk-modules/${code}/hazards`)
          results[code] = r.data ?? []
        } catch { results[code] = [] }
      }))
      setHazardsByModule(results)
      setLoading(false)
    }
    if (moduleCodes.length > 0) load()
    else setLoading(false)
  }, [moduleCodes.join(',')])

  const toggle = (code: string) => {
    onChange(selected.includes(code) ? selected.filter(c => c !== code) : [...selected, code])
  }

  const selectModule = (module: string) => {
    const codes = (hazardsByModule[module] ?? []).map(h => h.hazard_code)
    const allSelected = codes.every(c => selected.includes(c))
    if (allSelected) onChange(selected.filter(c => !codes.includes(c)))
    else onChange(Array.from(new Set([...selected, ...codes])))
  }

  const totalHazards = Object.values(hazardsByModule).flat().length

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Areas of Risk: Hazards</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Select the hazards relevant to this assessment. {selected.length} of {totalHazards} selected.
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">{Array(3).fill(0).map((_, i) => <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg" />)}</div>
      ) : moduleCodes.map(code => {
        const hazards = hazardsByModule[code] ?? []
        const isExpanded = expanded === code
        const allSel = hazards.length > 0 && hazards.every(h => selected.includes(h.hazard_code))

        return (
          <div key={code} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setExpanded(isExpanded ? null : code)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={allSel}
                  onChange={() => selectModule(code)}
                  onClick={e => e.stopPropagation()}
                  className="rounded"
                />
                <span className="font-medium text-sm text-gray-900">{code.replace(/_/g, ' ')}</span>
                <span className="text-xs text-gray-400">{hazards.length} hazards</span>
              </div>
              <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
            </button>

            {isExpanded && (
              <div className="divide-y">
                {hazards.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-gray-400">No hazards loaded for this module.</p>
                ) : hazards.map(h => (
                  <label key={h.id} className={cn(
                    'flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition',
                    selected.includes(h.hazard_code) ? 'bg-blue-50' : ''
                  )}>
                    <input
                      type="checkbox"
                      checked={selected.includes(h.hazard_code)}
                      onChange={() => toggle(h.hazard_code)}
                      className="mt-0.5 rounded"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{h.hazard_text}</p>
                      {h.cause && <p className="text-xs text-gray-500 mt-0.5">Cause: {h.cause.slice(0, 100)}{h.cause.length > 100 ? '...' : ''}</p>}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
