'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { getRiskBandColor, capitalize } from '@/lib/utils'
import type { RiskRegisterEntry } from '@/types'

export default function RiskRegisterPage() {
  const [entries, setEntries] = useState<RiskRegisterEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/risk-register').then(r => setEntries(r.data.data ?? r.data ?? [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Risk Register</h1>
        <p className="text-gray-500 text-sm mt-1">All active risks across your organisation</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Assessment</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Residual Risk</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Control Assurance</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Evidence</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Next Review</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading...</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">No risk register entries yet. Complete and submit an assessment to populate the register.</td></tr>
            ) : entries.map(e => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{e.assessment?.title ?? `Assessment #${e.assessment_id}`}</td>
                <td className="px-5 py-3">
                  {e.residual_risk_band ? (
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getRiskBandColor(e.residual_risk_band)}`}>
                      {capitalize(e.residual_risk_band)} {e.residual_risk_score ? `(${e.residual_risk_score})` : ''}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-5 py-3 text-gray-600">{e.control_assurance_score ? `${e.control_assurance_score}/4` : '—'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                    e.evidence_status === 'complete' ? 'text-green-600 bg-green-50 border-green-200' :
                    e.evidence_status === 'partial' ? 'text-amber-600 bg-amber-50 border-amber-200' :
                    'text-gray-500 bg-gray-50 border-gray-200'
                  }`}>{capitalize(e.evidence_status)}</span>
                </td>
                <td className="px-5 py-3 text-gray-600">{e.next_review_date ?? '—'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                    e.status === 'active' ? 'text-green-600 bg-green-50 border-green-200' :
                    'text-gray-500 bg-gray-50 border-gray-200'
                  }`}>{capitalize(e.status)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
