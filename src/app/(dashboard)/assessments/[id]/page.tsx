'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { getRiskBandColor, capitalize, formatScore } from '@/lib/utils'
import type { Assessment } from '@/types'

export default function AssessmentDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get(`/assessments/${id}`).then(r => setAssessment(r.data)).catch(() => router.push('/assessments')).finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await api.post(`/assessments/${id}/submit`)
      setAssessment(res.data)
    } catch { } finally { setSubmitting(false) }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading assessment...</div>
  if (!assessment) return null

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{capitalize(assessment.scope_type.replace(/_/g,' '))} · v{assessment.knowledge_version}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-3 py-1 rounded-full border font-medium ${
            assessment.status === 'approved' ? 'text-green-600 bg-green-50 border-green-200' :
            assessment.status === 'submitted' ? 'text-blue-600 bg-blue-50 border-blue-200' :
            'text-gray-500 bg-gray-50 border-gray-200'}`}>
            {capitalize(assessment.status)}
          </span>
          {assessment.status === 'draft' && (
            <button onClick={handleSubmit} disabled={submitting}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          )}
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Inherent Risk', value: formatScore(assessment.inherent_risk_score ?? null), sub: '/ 125' },
          { label: 'Residual Risk', value: formatScore(assessment.residual_risk_score ?? null), band: assessment.residual_risk_band },
          { label: 'Control Assurance', value: formatScore(assessment.control_assurance_score ?? null), sub: '/ 4' },
          { label: 'Confidence', value: formatScore(assessment.confidence_score ?? null), sub: '/ 5' },
        ].map(({ label, value, sub, band }) => (
          <div key={label} className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {sub && <p className="text-xs text-gray-400">{sub}</p>}
            {band && <span className={`text-xs px-2 py-0.5 rounded-full border font-medium mt-1 inline-block ${getRiskBandColor(band)}`}>{capitalize(band)}</span>}
          </div>
        ))}
      </div>

      {/* Risk Modules */}
      {assessment.risk_modules && assessment.risk_modules.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Risk Templates</h2>
          <div className="flex flex-wrap gap-2">
            {assessment.risk_modules.map(m => (
              <span key={m.id} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{m.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {assessment.notes && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-2">Notes</h2>
          <p className="text-sm text-gray-600">{assessment.notes}</p>
        </div>
      )}

      {/* Meta */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Details</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-gray-500">Created by</p><p className="font-medium mt-0.5">{assessment.creator?.full_name ?? '—'}</p></div>
          <div><p className="text-gray-500">Created</p><p className="font-medium mt-0.5">{new Date(assessment.created_at).toLocaleDateString()}</p></div>
          <div><p className="text-gray-500">Next Review</p><p className="font-medium mt-0.5">{assessment.next_review_date ?? 'Not set'}</p></div>
          <div><p className="text-gray-500">Knowledge Version</p><p className="font-medium mt-0.5">{assessment.knowledge_version}</p></div>
        </div>
      </div>
    </div>
  )
}
