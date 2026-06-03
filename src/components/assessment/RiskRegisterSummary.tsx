'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { getRiskBandColor, capitalize } from '@/lib/utils'
import type { RiskRegisterEntry } from '@/types'

export function RiskRegisterSummary() {
  const [entries, setEntries] = useState<RiskRegisterEntry[]>([])

  useEffect(() => {
    api.get('/risk-register?per_page=5').then((r) => setEntries(r.data.data ?? [])).catch(() => {})
  }, [])

  return (
    <div className="bg-white rounded-xl border">
      <div className="px-5 py-4 border-b">
        <h2 className="font-semibold text-gray-900">Risk Register</h2>
        <p className="text-xs text-gray-400 mt-0.5">Top risks by residual score</p>
      </div>
      <div className="divide-y">
        {entries.length === 0 ? (
          <p className="p-8 text-center text-gray-400 text-sm">No entries yet.</p>
        ) : (
          entries.map((e) => (
            <div key={e.id} className="px-5 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {e.assessment?.title ?? `Assessment #${e.assessment_id}`}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Review: {e.next_review_date ?? 'Not set'}
                </p>
              </div>
              {e.residual_risk_band && (
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getRiskBandColor(e.residual_risk_band)}`}>
                  {capitalize(e.residual_risk_band)}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
