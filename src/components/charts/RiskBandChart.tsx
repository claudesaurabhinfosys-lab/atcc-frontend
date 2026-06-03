'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from '@/lib/api'

const COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' }

export function RiskBandChart() {
  const [data, setData] = useState<{ name: string; value: number; color: string }[]>([])

  useEffect(() => {
    api.get('/risk-register').then((r) => {
      const entries = r.data.data ?? []
      const counts: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 }

      entries.forEach((e: any) => {
        if (e.residual_risk_band && counts[e.residual_risk_band] !== undefined) {
          counts[e.residual_risk_band]++
        }
      })

      setData(
        Object.entries(counts)
          .filter(([, v]) => v > 0)
          .map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
            color: COLORS[name as keyof typeof COLORS],
          }))
      )
    }).catch(() => {})
  }, [])

  return (
    <div className="bg-white rounded-xl border p-5">
      <h2 className="font-semibold text-gray-900 mb-4">Risk Distribution</h2>
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
