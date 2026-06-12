'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { Plus, X } from 'lucide-react'
import type { RiskModule } from '@/types'

interface Props {
  selected: string[]
  onChange: (codes: string[]) => void
}

export default function Step2Templates({ selected, onChange }: Props) {
  const [modules, setModules]     = useState<RiskModule[]>([])
  const [loading, setLoading]     = useState(true)
  const [showAdd, setShowAdd]     = useState(false)
  const [customName, setCustomName] = useState('')
  const [saving, setSaving]       = useState(false)
  const [addError, setAddError]   = useState('')

  const loadModules = () => {
    api.get('/risk-modules').then(r => setModules(r.data ?? [])).finally(() => setLoading(false))
  }

  useEffect(() => { loadModules() }, [])

  const toggle = (code: string) => {
    onChange(selected.includes(code) ? selected.filter(c => c !== code) : [...selected, code])
  }

  const handleAddCustom = async () => {
    setAddError('')
    if (!customName.trim()) { setAddError('Name is required.'); return }
    setSaving(true)
    try {
      const res = await api.post('/knowledge/risk-modules', { name: customName.trim() })
      const newModule: RiskModule = res.data
      setModules(prev => [...prev, newModule])
      onChange([...selected, newModule.module_code])
      setCustomName('')
      setShowAdd(false)
    } catch (e: any) {
      setAddError(e?.response?.data?.message ?? 'Could not create area of risk.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Areas of Risk</h2>
          <p className="text-sm text-gray-500 mt-0.5">Choose which areas of risk apply to this assessment. {selected.length} selected.</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setAddError(''); setCustomName('') }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition"
        >
          <Plus size={13} /> Add Custom Area of Risk
        </button>
      </div>

      {/* Inline add form */}
      {showAdd && (
        <div className="border border-primary/20 bg-primary/5 rounded-lg px-4 py-3 space-y-2">
          <p className="text-xs font-semibold text-primary">New Custom Area of Risk</p>
          {addError && <p className="text-xs text-red-600">{addError}</p>}
          <div className="flex gap-2">
            <input
              autoFocus
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
              placeholder="e.g. Night and Low-Visibility Operations"
              className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleAddCustom}
              disabled={saving}
              className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={() => { setShowAdd(false); setCustomName(''); setAddError('') }}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-gray-400">This will create a company-specific area of risk and select it automatically.</p>
        </div>
      )}

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
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{m.name}</span>
                  {(m as any).scope === 'company' && (
                    <span className="ml-2 text-xs text-purple-500 font-normal">custom</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {selected.length === 0 && (
        <p className="text-amber-600 text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Select at least one area of risk to continue.
        </p>
      )}
    </div>
  )
}
