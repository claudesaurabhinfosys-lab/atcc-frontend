'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { getRiskBandColor, capitalize } from '@/lib/utils'
import type { Assessment } from '@/types'

const STATUS_FILTERS = ['All', 'Draft', 'Submitted', 'Approved']

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    const params = filter !== 'All' ? `?status=${filter.toLowerCase()}` : ''
    api.get(`/assessments${params}`).then(r => setAssessments(r.data.data ?? r.data ?? [])).catch(() => {}).finally(() => setLoading(false))
  }, [filter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your risk assessments</p>
        </div>
        <Link href="/assessments/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
          + New Assessment
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${filter === s ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-gray-50'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border divide-y">
        {loading ? (
          <p className="p-10 text-center text-gray-400 text-sm">Loading...</p>
        ) : assessments.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">No assessments yet.</p>
            <Link href="/assessments/new" className="mt-3 inline-block text-primary text-sm hover:underline">Create your first assessment →</Link>
          </div>
        ) : assessments.map(a => (
          <Link key={a.id} href={`/assessments/${a.id}`}
            className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition">
            <div>
              <p className="font-medium text-gray-900 text-sm">{a.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{capitalize(a.scope_type.replace(/_/g,' '))} · {a.creator?.full_name ?? ''}</p>
            </div>
            <div className="flex items-center gap-3">
              {a.residual_risk_band && (
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getRiskBandColor(a.residual_risk_band)}`}>
                  {capitalize(a.residual_risk_band)}
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                a.status === 'approved' ? 'text-green-600 bg-green-50 border-green-200' :
                a.status === 'submitted' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                'text-gray-500 bg-gray-50 border-gray-200'}`}>
                {capitalize(a.status)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
