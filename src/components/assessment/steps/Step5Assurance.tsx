'use client'

import { useState } from 'react'

interface Control {
  id: number
  control_code: string
  control_text: string
  module_code: string
}

export interface AssuranceScore {
  control_id: number
  present_score: number
  suitable_score: number
  operational_score: number
  effective_score: number
  notes: string
}

interface Props {
  controls: Control[]
  scores: Record<number, AssuranceScore>
  onChange: (scores: Record<number, AssuranceScore>) => void
}

const PSOE = [
  { key: 'present_score',     label: 'Control Exists',         desc: 'Is the control established and documented?' },
  { key: 'suitable_score',    label: 'Control is Suitable',    desc: 'Does it fit the scope, task and risk profile?' },
  { key: 'operational_score', label: 'Control is Being Used',  desc: 'Is it used in day-to-day operations?' },
  { key: 'effective_score',   label: 'Control is Working',     desc: 'Is it achieving the intended outcome?' },
] as const

const SCORE_LABELS = ['Not demonstrated', 'Weak', 'Partial', 'Mostly demonstrated', 'Fully demonstrated']
const SCORE_COLORS = ['bg-red-100 text-red-700 border-red-200', 'bg-orange-100 text-orange-700 border-orange-200', 'bg-yellow-100 text-yellow-700 border-yellow-200', 'bg-blue-100 text-blue-700 border-blue-200', 'bg-green-100 text-green-700 border-green-200']

export default function Step5Assurance({ controls, scores, onChange }: Props) {
  const [expanded, setExpanded] = useState<number | null>(controls[0]?.id ?? null)

  const update = (controlId: number, field: string, value: number | string) => {
    const current = scores[controlId] ?? {
      control_id: controlId, present_score: 2, suitable_score: 2,
      operational_score: 1, effective_score: 1, notes: ''
    }
    onChange({ ...scores, [controlId]: { ...current, [field]: value } })
  }

  const getScore = (controlId: number, field: string): number => {
    return (scores[controlId] as any)?.[field] ?? 0
  }

  if (controls.length === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Control Assurance</h2>
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          No controls selected. Go back and select controls first.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Control Assurance (PSOE)</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Rate each control 0–4 on four dimensions. Score: 0 = Not demonstrated, 4 = Fully demonstrated.
        </p>
      </div>

      {controls.map(c => {
        const isExpanded = expanded === c.id
        const avg = PSOE.reduce((sum, p) => sum + getScore(c.id, p.key), 0) / 4
        const avgColor = avg >= 3.5 ? 'text-green-600' : avg >= 2.5 ? 'text-blue-600' : avg >= 1.5 ? 'text-yellow-600' : 'text-red-600'

        return (
          <div key={c.id} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setExpanded(isExpanded ? null : c.id)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left"
            >
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm font-medium text-gray-900 truncate">{c.control_text.slice(0, 80)}...</p>
                <p className="text-xs text-gray-400">{c.module_code.replace(/_/g, ' ')}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold ${avgColor}`}>{avg.toFixed(1)}/4</span>
                <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
              </div>
            </button>

            {isExpanded && (
              <div className="p-4 space-y-4">
                {PSOE.map(p => {
                  const val = getScore(c.id, p.key)
                  return (
                    <div key={p.key}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{p.label}</p>
                          <p className="text-xs text-gray-500">{p.desc}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${SCORE_COLORS[val]}`}>
                          {val} — {SCORE_LABELS[val]}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {[0, 1, 2, 3, 4].map(score => (
                          <button
                            key={score}
                            onClick={() => update(c.id, p.key, score)}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold border transition ${
                              val === score ? SCORE_COLORS[score] : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
                  <textarea
                    value={scores[c.id]?.notes ?? ''}
                    onChange={e => update(c.id, 'notes', e.target.value)}
                    rows={2}
                    placeholder="Add observations or context..."
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
