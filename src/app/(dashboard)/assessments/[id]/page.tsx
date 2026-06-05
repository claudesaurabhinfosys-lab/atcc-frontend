'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import api from '@/lib/api'
import { getRiskBandColor, capitalize, formatScore } from '@/lib/utils'
import type { Assessment, Finding } from '@/types'
import { CheckCircle, AlertTriangle, Upload, Paperclip, X, FileText } from 'lucide-react'

interface EvidenceItem {
  id: number
  title: string
  description?: string
  file_name?: string
  psoe_element?: string
  control_code?: string
  created_at: string
}

export default function AssessmentDetailPage() {
  const { id } = useParams()
  const router  = useRouter()
  const searchParams  = useSearchParams()
  const justSubmitted = searchParams.get('submitted') === '1'
  const fileRef = useRef<HTMLInputElement>(null)

  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [findings,   setFindings]   = useState<Finding[]>([])
  const [evidence,   setEvidence]   = useState<EvidenceItem[]>([])
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [approving,  setApproving]  = useState(false)

  const [evTitle,   setEvTitle]   = useState('')
  const [evDesc,    setEvDesc]    = useState('')
  const [evFile,    setEvFile]    = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const [uploadErr, setUploadErr] = useState('')

  const loadEvidence = () =>
    api.get(`/assessments/${id}/evidence`).then(r => setEvidence(r.data ?? [])).catch(() => {})

  useEffect(() => {
    Promise.all([
      api.get(`/assessments/${id}`),
      api.get(`/assessments/${id}/findings`),
    ]).then(([aRes, fRes]) => {
      setAssessment(aRes.data)
      setFindings(fRes.data ?? [])
    }).catch(() => router.push('/assessments')).finally(() => setLoading(false))
    loadEvidence()
  }, [id])

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await api.get(`/assessments/${id}/score`)
      const res  = await api.post(`/assessments/${id}/submit`)
      const fRes = await api.get(`/assessments/${id}/findings`)
      setAssessment(res.data)
      setFindings(fRes.data ?? [])
    } catch { } finally { setSubmitting(false) }
  }

  const handleApprove = async () => {
    setApproving(true)
    try {
      const res = await api.post(`/assessments/${id}/approve`)
      setAssessment(res.data)
    } catch { } finally { setApproving(false) }
  }

  const handleEvidenceAdd = async () => {
    if (!evTitle) return
    setUploading(true); setUploadMsg(''); setUploadErr('')
    try {
      const form = new FormData()
      form.append('title', evTitle)
      if (evDesc)  form.append('description', evDesc)
      if (evFile)  form.append('file', evFile)
      await api.post(`/assessments/${id}/evidence`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setEvTitle(''); setEvDesc(''); setEvFile(null)
      if (fileRef.current) fileRef.current.value = ''
      setUploadMsg('Evidence added successfully.')
      setTimeout(() => setUploadMsg(''), 3000)
      loadEvidence()
    } catch (e: any) {
      setUploadErr(e?.response?.data?.message ?? 'Failed to add evidence.')
    } finally { setUploading(false) }
  }

  const removeEvidence = async (evId: number) => {
    try {
      await api.delete(`/evidence/${evId}`)
      setEvidence(ev => ev.filter(e => e.id !== evId))
    } catch { }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading assessment...</div>
  if (!assessment) return null

  const severityColor: Record<string, string> = {
    critical: 'text-red-700 bg-red-50 border-red-200',
    high:     'text-orange-700 bg-orange-50 border-orange-200',
    medium:   'text-amber-700 bg-amber-50 border-amber-200',
    low:      'text-green-700 bg-green-50 border-green-200',
  }

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {capitalize(assessment.scope_type.replace(/_/g, ' '))} · v{assessment.knowledge_version}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-3 py-1 rounded-full border font-medium ${
            assessment.status === 'approved'  ? 'text-green-600 bg-green-50 border-green-200' :
            assessment.status === 'submitted' ? 'text-blue-600 bg-blue-50 border-blue-200' :
            'text-gray-500 bg-gray-50 border-gray-200'
          }`}>{capitalize(assessment.status)}</span>

          {assessment.status === 'draft' && (
            <button onClick={handleSubmit} disabled={submitting}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition">
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
          {assessment.status === 'submitted' && (
            <button onClick={handleApprove} disabled={approving}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition">
              {approving ? 'Approving...' : 'Approve'}
            </button>
          )}
        </div>
      </div>

      {justSubmitted && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle size={16} className="text-green-600" />
          <p className="text-sm text-green-700 font-medium">
            Assessment submitted and added to the Risk Register.
          </p>
        </div>
      )}

      {/* Scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Inherent Risk',     value: formatScore(assessment.inherent_risk_score      ?? null), sub: '/ 125' },
          { label: 'Residual Risk',     value: formatScore(assessment.residual_risk_score       ?? null), band: assessment.residual_risk_band },
          { label: 'Control Assurance', value: formatScore(assessment.control_assurance_score  ?? null), sub: '/ 4' },
          { label: 'Confidence',        value: formatScore(assessment.confidence_score          ?? null), sub: '/ 5' },
        ].map(({ label, value, sub, band }) => (
          <div key={label} className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {sub  && <p className="text-xs text-gray-400">{sub}</p>}
            {band && (
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium mt-1 inline-block ${getRiskBandColor(band)}`}>
                {capitalize(band)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Findings */}
      {findings.length > 0 && (
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-3 border-b flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <h2 className="font-semibold text-gray-900">Findings ({findings.length})</h2>
          </div>
          <div className="divide-y">
            {findings.map((f, i) => (
              <div key={i} className="px-5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-gray-900">{f.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${severityColor[f.severity] ?? 'text-gray-600 bg-gray-50 border-gray-200'}`}>
                    {capitalize(f.severity)}
                  </span>
                </div>
                {f.description && <p className="text-xs text-gray-500 mt-1">{f.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Templates */}
      {assessment.risk_modules && assessment.risk_modules.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Risk Templates</h2>
          <div className="flex flex-wrap gap-2">
            {assessment.risk_modules.map(m => (
              <span key={m.id} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full">
                {m.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Evidence */}
      <div className="bg-white rounded-xl border">
        <div className="px-5 py-3 border-b flex items-center gap-2">
          <Upload size={16} className="text-gray-400" />
          <h2 className="font-semibold text-gray-900">Evidence ({evidence.length})</h2>
        </div>

        {/* Existing evidence */}
        {evidence.length > 0 && (
          <div className="divide-y">
            {evidence.map(ev => (
              <div key={ev.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  {ev.file_name ? (
                    <Paperclip size={14} className="text-blue-500 flex-shrink-0" />
                  ) : (
                    <FileText size={14} className="text-gray-400 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ev.title}</p>
                    {ev.description && <p className="text-xs text-gray-400 mt-0.5">{ev.description}</p>}
                    {ev.file_name && (
                      <p className="text-xs text-blue-600 mt-0.5">{ev.file_name}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {ev.file_name && (
                    <a href={`${process.env.NEXT_PUBLIC_API_URL}/evidence/${ev.id}/download`}
                      target="_blank" rel="noreferrer"
                      className="text-xs text-primary hover:underline">
                      Download
                    </a>
                  )}
                  <button onClick={() => removeEvidence(ev.id)}
                    className="text-gray-300 hover:text-red-400 transition">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add evidence form */}
        <div className="p-5 border-t space-y-3 bg-gray-50">
          <p className="text-xs font-medium text-gray-600">Add Evidence</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={evTitle} onChange={e => setEvTitle(e.target.value)}
              placeholder="Evidence title *"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white" />
            <input value={evDesc} onChange={e => setEvDesc(e.target.value)}
              placeholder="Description (optional)"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white" />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm text-gray-600 cursor-pointer hover:bg-white transition bg-white">
              <Paperclip size={14} />
              {evFile ? evFile.name : 'Attach file (PDF, Word, image — max 10MB)'}
              <input ref={fileRef} type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.csv,.txt"
                className="hidden"
                onChange={e => setEvFile(e.target.files?.[0] ?? null)} />
            </label>
            {evFile && (
              <button onClick={() => { setEvFile(null); if (fileRef.current) fileRef.current.value = '' }}
                className="text-gray-400 hover:text-red-400 transition"><X size={14} /></button>
            )}
          </div>
          {uploadMsg && <p className="text-green-600 text-xs">{uploadMsg}</p>}
          {uploadErr && <p className="text-red-600 text-xs">{uploadErr}</p>}
          <button onClick={handleEvidenceAdd} disabled={!evTitle || uploading}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-40">
            {uploading ? 'Uploading...' : 'Add Evidence'}
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Details</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-gray-500">Created by</p><p className="font-medium mt-0.5">{assessment.creator?.full_name ?? '—'}</p></div>
          <div><p className="text-gray-500">Created</p><p className="font-medium mt-0.5">{new Date(assessment.created_at).toLocaleDateString()}</p></div>
          <div><p className="text-gray-500">Next Review</p><p className="font-medium mt-0.5">{assessment.next_review_date ?? 'Not set'}</p></div>
          <div><p className="text-gray-500">Version</p><p className="font-medium mt-0.5">{assessment.knowledge_version}</p></div>
          {assessment.notes && (
            <div className="col-span-2">
              <p className="text-gray-500">Notes</p>
              <p className="font-medium mt-0.5">{assessment.notes}</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
