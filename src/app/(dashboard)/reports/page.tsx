'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { FileText, Download } from 'lucide-react'

export default function ReportsPage() {
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState('')

  const generateReport = async () => {
    setGenerating(true)
    setMessage('')
    try {
      await api.post('/reports/generate', { type: 'risk_register' })
      setMessage('Report generated successfully.')
    } catch {
      setMessage('Report generation coming soon.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 text-sm mt-1">Generate and download risk assessment reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Risk Register Report', desc: 'Full company risk register with scores and review dates', icon: FileText },
          { title: 'Assessment Summary', desc: 'Summary of all completed assessments', icon: FileText },
          { title: 'Control Assurance Report', desc: 'Control effectiveness and assurance scores', icon: FileText },
        ].map(({ title, desc, icon: Icon }) => (
          <div key={title} className="bg-white rounded-xl border p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg"><Icon size={18} className="text-blue-600" /></div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
            <button
              onClick={generateReport}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
            >
              <Download size={14} />
              {generating ? 'Generating...' : 'Generate PDF'}
            </button>
          </div>
        ))}
      </div>

      {message && <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3">{message}</p>}
    </div>
  )
}
