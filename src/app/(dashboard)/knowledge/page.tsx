'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import type { RiskModule } from '@/types'

export default function KnowledgePage() {
  const [modules, setModules] = useState<RiskModule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/risk-modules').then(r => setModules(r.data ?? [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="text-gray-500 text-sm mt-1">Global and company risk assessment templates</p>
      </div>

      <div className="bg-white rounded-xl border divide-y">
        {loading ? (
          <p className="p-8 text-center text-gray-400 text-sm">Loading...</p>
        ) : modules.map((m, i) => (
          <div key={m.id} className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{m.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">{m.module_code}</p>
              </div>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
              m.scope === 'global' ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-purple-600 bg-purple-50 border-purple-200'
            }`}>{m.scope}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
