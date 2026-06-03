'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { getRiskBandColor, capitalize } from '@/lib/utils'
import type { Assessment } from '@/types'

export function RecentAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([])

  useEffect(() => {
    api.get('/assessments?per_page=5').then((r) => setAssessments(r.data.data ?? [])).catch(() => {})
  }, [])

  return (
    <div className="bg-white rounded-xl border">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h2 className="font-semibold text-gray-900">Recent Assessments</h2>
        <Link href="/assessments" className="text-sm text-primary hover:underline">View all</Link>
      </div>
      <div className="divide-y">
        {assessments.length === 0 ? (
          <p className="p-8 text-center text-gray-400 text-sm">No assessments yet.</p>
        ) : (
          assessments.map((a) => (
            <Link key={a.id} href={`/assessments/${a.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition">
              <div>
                <p className="text-sm font-medium text-gray-900">{a.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{capitalize(a.scope_type)}</p>
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
                  'text-gray-500 bg-gray-50 border-gray-200'
                }`}>
                  {capitalize(a.status)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
