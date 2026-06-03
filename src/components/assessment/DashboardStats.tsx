'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { getRiskBandColor } from '@/lib/utils'
import { ClipboardList, ShieldAlert, CheckCircle, Clock } from 'lucide-react'

interface Stats {
  total_assessments: number
  critical_risks: number
  approved_this_month: number
  due_for_review: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    api.get('/dashboard').then((r) => setStats(r.data)).catch(() => {})
  }, [])

  const cards = [
    { label: 'Total Assessments', value: stats?.total_assessments ?? '—', icon: ClipboardList, color: 'text-blue-600 bg-blue-50' },
    { label: 'Critical Risks',    value: stats?.critical_risks ?? '—',    icon: ShieldAlert,  color: 'text-red-600 bg-red-50' },
    { label: 'Approved This Month', value: stats?.approved_this_month ?? '—', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'Due for Review',    value: stats?.due_for_review ?? '—',    icon: Clock,        color: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      ))}
    </div>
  )
}
