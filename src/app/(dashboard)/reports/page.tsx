'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { FileText, Download, Loader } from 'lucide-react'
import { capitalize, getRiskBandColor } from '@/lib/utils'

interface Assessment {
  id: number
  title: string
  scope_type: string
  status: string
  residual_risk_band?: string
  submitted_at?: string
}

export default function ReportsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/reports').then(r => setAssessments(r.data?.data ?? [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const generate = async (assessmentId: number, title: string) => {
    setGenerating(assessmentId)
    setMessage('')
    setError('')
    try {
      const res = await api.post('/reports/generate', { assessment_id: assessmentId })
      const { url, filename } = res.data
      // Auto-download
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setMessage(`Report for "${title}" generated and downloading.`)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to generate report.')
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 text-sm mt-1">Generate PDF reports for submitted or approved assessments</p>
      </div>

      {message && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">{message}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900 text-sm">Submitted & Approved Assessments</h2>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading assessments...</div>
        ) : assessments.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            No submitted or approved assessments found.
            Complete an assessment and submit it to generate reports.
          </div>
        ) : (
          <div className="divide-y">
            {assessments.map(a => (
              <div key={a.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{a.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{capitalize(a.scope_type.replace(/_/g,' '))}</span>
                      {a.residual_risk_band && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${getRiskBandColor(a.residual_risk_band)}`}>
                          {capitalize(a.residual_risk_band)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => generate(a.id, a.title)}
                  disabled={generating === a.id}
                  className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
                >
                  {generating === a.id ? (
                    <><Loader size={14} className="animate-spin" /> Generating...</>
                  ) : (
                    <><Download size={14} /> Download PDF</>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
