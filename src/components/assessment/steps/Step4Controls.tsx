'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface Control {
  id: number
  control_code: string
  module_code: string
  control_text: string
  control_type?: string
  hierarchy_level: number
  is_critical: boolean
}

interface Props {
  moduleCodes: string[]
  selected: number[]
  onChange: (ids: number[]) => void
}

const HIERARCHY = ['', 'Eliminate', 'Substitute', 'Engineering', 'Administrative', 'PPE']
const HIERARCHY_COLORS: Record<number, string> = {
  1: 'bg-red-100 text-red-700',
  2: 'bg-orange-100 text-orange-700',
  3: 'bg-yellow-100 text-yellow-700',
  4: 'bg-blue-100 text-blue-700',
  5: 'bg-gray-100 text-gray-600',
}

export default function Step4Controls({ moduleCodes, selected, onChange }: Props) {
  const [controlsByModule, setControlsByModule] = useState<Record<string, Control[]>>({})
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(moduleCodes[0] ?? null)

  useEffect(() => {
    const load = async () => {
      const results: Record<string, Control[]> = {}
      await Promise.all(moduleCodes.map(async code => {
        try {
          const r = await api.get(`/risk-modules/${code}/controls`)
          results[code] = r.data ?? []
        } catch { results[code] = [] }
      }))
      setControlsByModule(results)
      setLoading(false)
    }
    if (moduleCodes.length > 0) load()
    else setLoading(false)
  }, [moduleCodes.join(',')])

  const toggle = (id: number) => {
    onChange(selected.includes(id) ? selected.filter(i => i !== id) : [...selected, id])
  }

  const selectModule = (module: string) => {
    const ids = (controlsByModule[module] ?? []).map(c => c.id)
    const allSel = ids.every(i => selected.includes(i))
    onChange(allSel ? selected.filter(i => !ids.includes(i)) : [...new Set([...selected, ...ids])])
  }

  const totalControls = Object.values(controlsByModule).flat().length

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Select Controls</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Choose the controls in place for this assessment. {selected.length} of {totalControls} selected.
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">{Array(3).fill(0).map((_, i) => <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg" />)}</div>
      ) : moduleCodes.map(code => {
        const controls = controlsByModule[code] ?? []
        const isExpanded = expanded === code
        const allSel = controls.length > 0 && controls.every(c => selected.includes(c.id))

        return (
          <div key={code} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setExpanded(isExpanded ? null : code)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left"
            >
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={allSel} onChange={() => selectModule(code)} onClick={e => e.stopPropagation()} className="rounded" />
                <span className="font-medium text-sm text-gray-900">{code.replace(/_/g, ' ')}</span>
                <span className="text-xs text-gray-400">{controls.length} controls · {controls.filter(c => selected.includes(c.id)).length} selected</span>
              </div>
              <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
            </button>

            {isExpanded && (
              <div className="divide-y">
                {controls.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-gray-400">No controls loaded for this module.</p>
                ) : controls.map(c => (
                  <label key={c.id} className={cn(
                    'flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition',
                    selected.includes(c.id) ? 'bg-blue-50' : ''
                  )}>
                    <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} className="mt-0.5 rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 leading-snug">{c.control_text.slice(0, 150)}{c.control_text.length > 150 ? '...' : ''}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {c.hierarchy_level > 0 && (
                          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', HIERARCHY_COLORS[c.hierarchy_level] ?? 'bg-gray-100 text-gray-600')}>
                            {HIERARCHY[c.hierarchy_level] ?? 'Other'}
                          </span>
                        )}
                        {c.is_critical && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">Critical</span>
                        )}
                      </div>
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
