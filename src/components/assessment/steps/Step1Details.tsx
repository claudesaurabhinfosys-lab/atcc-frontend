'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'

const SCOPE_TYPES = [
  { value: 'company_wide',    label: 'Company Wide' },
  { value: 'business_unit',   label: 'Business Unit' },
  { value: 'region',          label: 'Region' },
  { value: 'depot',           label: 'Depot' },
  { value: 'customer_site',   label: 'Customer Site' },
  { value: 'route_corridor',  label: 'Route / Corridor' },
  { value: 'vehicle_type',    label: 'Vehicle Type' },
  { value: 'freight_type',    label: 'Freight Type' },
  { value: 'activity_task',   label: 'Activity / Task' },
  { value: 'contractor',      label: 'Contractor' },
  { value: 'incident_review', label: 'Incident Review' },
]

const schema = z.object({
  title:            z.string().min(3, 'Title must be at least 3 characters'),
  scope_type:       z.string().min(1, 'Select a scope type'),
  notes:            z.string().optional(),
  next_review_date: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<FormData>
  onSubmit: (data: FormData) => void
  loading?: boolean
}

export default function Step1Details({ defaultValues, onSubmit, loading }: Props) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  useEffect(() => { if (defaultValues) reset(defaultValues) }, [])

  return (
    <form id="step1-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Assessment Details</h2>
        <p className="text-sm text-gray-500 mt-0.5">Set the title, scope and basic information for this assessment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assessment Title <span className="text-red-500">*</span>
          </label>
          <input
            {...register('title')}
            type="text"
            placeholder="e.g. Melbourne Depot — Fatigue & Loading Assessment"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Scope Type <span className="text-red-500">*</span>
          </label>
          <select
            {...register('scope_type')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            <option value="">Select scope...</option>
            {SCOPE_TYPES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {errors.scope_type && <p className="text-red-500 text-xs mt-1">{errors.scope_type.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Next Review Date</label>
          <input
            {...register('next_review_date')}
            type="date"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            {...register('notes')}
            rows={3}
            placeholder="Optional context about this assessment..."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
      </div>
    </form>
  )
}
