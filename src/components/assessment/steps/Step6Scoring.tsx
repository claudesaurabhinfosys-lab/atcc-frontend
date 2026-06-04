'use client'

import { useState } from 'react'
import { getRiskBandColor, capitalize } from '@/lib/utils'

interface ModuleScoring {
  module_code: string
  consequence: number
  likelihood: number
  exposure: number
}

interface Props {
  moduleCodes: string[]
  scores: Record<string, ModuleScoring>
  onChange: (scores: Record<string, ModuleScoring>) => void
}

const LABELS: Record<string, string[]> = {
  consequence: ['', 'Insignificant', 'Minor', 'Moderate', 'Major', 'Catastrophic'],
  likelihood:  ['', 'Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'],
  exposure:    ['', 'Minimal', 'Occasional', 'Moderate', 'Frequent', 'Constant'],
}

function getResidualBand(score: number) {
  if (score <= 15) return 'low'
  if (score <= 35) return 'medium'
  if (score <= 70) return 'high'
  return 'critical'
}

export default function Step6Scoring({ moduleCodes, scores, onChange }: Props) {
  const update = (code: string, field: string, value: number) => {
    const current = scores[code] ?? { module_code: code, consequence: 1, likelihood: 1, exposure: 1 }
    onChange({ ...scores, [code]: { ...current, [field]: value } })
  }

  const get = (code: string, field: keyof ModuleScoring): number =>
    (scores[code] as any)?.[field] ?? 1

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Risk Scoring</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Score each template on Consequence, Likelihood and Exposure (1–5). Inherent Risk = C × L × E (max 125).
        </p>
      </div>

      {moduleCodes.map(code => {
        const c = get(code, 'consequence')
        const l = get(code, 'likelihood')
        const e = get(code, 'exposure')
        const inherent = c * l * e
        const band = getResidualBand(inherent)

        return (
          <div key={code} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">{code.replace(/_/g, ' ')}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Inherent Risk:</span>
                <span className="text-xl font-bold text-gray-900">{inherent}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getRiskBandColor(band)}`}>
                  {capitalize(band)}
                </span>
              </div>
            </div>

            {(['consequence', 'likelihood', 'exposure'] as const).map(field => {
              const val = get(code, field)
              return (
                <div key={field}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 capitalize">{field}</label>
                    <span className="text-xs text-gray-500 font-medium">{val} — {LABELS[field][val]}</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(score => (
                      <button
                        key={score}
                        onClick={() => update(code, field, score)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition ${
                          val === score
                            ? score <= 2 ? 'bg-green-100 text-green-700 border-green-300'
                            : score === 3 ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                            : score === 4 ? 'bg-orange-100 text-orange-700 border-orange-300'
                            : 'bg-red-100 text-red-700 border-red-300'
                            : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
