'use client'

import { getRiskBandColor, capitalize } from '@/lib/utils'

interface Props {
  assessment: any
  moduleCodes: string[]
  selectedControls: number[]
  scoringData: Record<string, any>
  assuranceData: Record<number, any>
}

function getResidualBand(score: number) {
  if (score <= 15) return 'low'
  if (score <= 35) return 'medium'
  if (score <= 70) return 'high'
  return 'critical'
}

export default function Step7Review({ assessment, moduleCodes, selectedControls, scoringData, assuranceData }: Props) {
  // Calculate aggregate scores
  const maxInherent = Math.max(...moduleCodes.map(code => {
    const s = scoringData[code]
    return s ? s.consequence * s.likelihood * s.exposure : 1
  }), 0)

  const avgAssurance = selectedControls.length > 0
    ? selectedControls.reduce((sum, id) => {
        const a = assuranceData[id]
        if (!a) return sum
        return sum + ((a.present_score + a.suitable_score + a.operational_score + a.effective_score) / 4)
      }, 0) / selectedControls.length
    : 0

  const controlEffectiveness = avgAssurance >= 3.5 ? 'very_strong' : avgAssurance >= 3 ? 'strong' : avgAssurance >= 2 ? 'moderate' : avgAssurance >= 1 ? 'weak' : 'very_weak'
  const reductionFactor = { very_strong: 0.20, strong: 0.35, moderate: 0.55, weak: 0.75, very_weak: 0.90 }[controlEffectiveness] ?? 0.55
  const residualRisk = Math.round(maxInherent * reductionFactor)
  const residualBand = getResidualBand(residualRisk)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Review & Submit</h2>
        <p className="text-sm text-gray-500 mt-0.5">Review the assessment summary before submitting.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Templates', value: moduleCodes.length, sub: 'selected' },
          { label: 'Controls', value: selectedControls.length, sub: 'selected' },
          { label: 'Inherent Risk', value: maxInherent, sub: '/ 125' },
          { label: 'Residual Risk', value: residualRisk, band: residualBand },
        ].map(({ label, value, sub, band }) => (
          <div key={label} className="bg-gray-50 rounded-lg border p-3 text-center">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {sub && <p className="text-xs text-gray-400">{sub}</p>}
            {band && (
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium mt-1 inline-block ${getRiskBandColor(band)}`}>
                {capitalize(band)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="border rounded-lg divide-y text-sm">
        <div className="flex justify-between px-4 py-3">
          <span className="text-gray-500">Title</span>
          <span className="font-medium text-gray-900">{assessment?.title}</span>
        </div>
        <div className="flex justify-between px-4 py-3">
          <span className="text-gray-500">Scope</span>
          <span className="font-medium text-gray-900">{capitalize((assessment?.scope_type ?? '').replace(/_/g, ' '))}</span>
        </div>
        <div className="flex justify-between px-4 py-3">
          <span className="text-gray-500">Avg Control Assurance</span>
          <span className="font-medium text-gray-900">{avgAssurance.toFixed(2)} / 4 ({capitalize(controlEffectiveness.replace(/_/g, ' '))})</span>
        </div>
        <div className="flex justify-between px-4 py-3">
          <span className="text-gray-500">Next Review</span>
          <span className="font-medium text-gray-900">{assessment?.next_review_date ?? 'Not set'}</span>
        </div>
      </div>

      {/* Risk templates */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Templates Included</p>
        <div className="flex flex-wrap gap-2">
          {moduleCodes.map(c => (
            <span key={c} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full">
              {c.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        <p className="text-sm text-amber-800 font-medium">Ready to submit?</p>
        <p className="text-xs text-amber-700 mt-0.5">Submitting will lock the assessment and add it to the Risk Register. You can still view it but not edit it.</p>
      </div>
    </div>
  )
}
