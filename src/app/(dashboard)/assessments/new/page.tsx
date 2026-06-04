'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/lib/api'

const SCOPE_TYPES = [
  'company_wide', 'business_unit', 'region', 'depot', 'customer_site',
  'route_corridor', 'vehicle_type', 'freight_type', 'activity_task',
  'contractor', 'incident_review',
]

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  scope_type: z.string().min(1, 'Select a scope type'),
  notes: z.string().optional(),
  next_review_date: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function NewAssessmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/assessments', data)
      router.push(`/assessments/${res.data.id}`)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to create assessment.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Assessment</h1>
        <p className="text-gray-500 text-sm mt-1">Create a new risk assessment</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Title <span className="text-red-500">*</span></label>
          <input {...register('title')} type="text" placeholder="e.g. Depot Safety Assessment — Melbourne"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scope Type <span className="text-red-500">*</span></label>
          <select {...register('scope_type')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white">
            <option value="">Select scope...</option>
            {SCOPE_TYPES.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
            ))}
          </select>
          {errors.scope_type && <p className="text-red-500 text-xs mt-1">{errors.scope_type.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Next Review Date</label>
          <input {...register('next_review_date')} type="date"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea {...register('notes')} rows={3} placeholder="Optional notes about this assessment..."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Assessment'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg text-sm font-medium border hover:bg-gray-50 transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
