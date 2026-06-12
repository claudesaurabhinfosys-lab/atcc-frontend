'use client'

import { CheckCircle, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

export const STEPS = [
  { id: 1, key: 'details',      label: 'Details' },
  { id: 2, key: 'templates',    label: 'Risks' },
  { id: 3, key: 'hazards',      label: 'Hazards' },
  { id: 4, key: 'controls',     label: 'Controls' },
  { id: 5, key: 'assurance',    label: 'Assurance' },
  { id: 6, key: 'scoring',      label: 'Scoring' },
  { id: 7, key: 'review',       label: 'Review' },
]

interface Props {
  currentStep: number
  children: React.ReactNode
  onNext?: () => void
  onBack?: () => void
  onSkip?: () => void
  nextLabel?: string
  loading?: boolean
  disableNext?: boolean
}

export default function WizardShell({ currentStep, children, onNext, onBack, onSkip, nextLabel = 'Next', loading, disableNext }: Props) {
  return (
    <div className="max-w-4xl space-y-6">
      {/* Step indicator */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                  currentStep > step.id  ? 'bg-green-500 text-white' :
                  currentStep === step.id ? 'bg-primary text-white' :
                  'bg-gray-100 text-gray-400'
                )}>
                  {currentStep > step.id ? <CheckCircle size={16} /> : step.id}
                </div>
                <span className={cn(
                  'text-xs mt-1 font-medium whitespace-nowrap',
                  currentStep === step.id ? 'text-primary' : 'text-gray-400'
                )}>{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('h-0.5 flex-1 mx-2 mb-4', currentStep > step.id ? 'bg-green-400' : 'bg-gray-200')} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white rounded-xl border p-6">
        {children}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={currentStep === 1 || loading}
          className="px-5 py-2.5 rounded-lg text-sm font-medium border hover:bg-gray-50 transition disabled:opacity-40"
        >
          Back
        </button>
        <div className="flex gap-3">
          {onSkip && (
            <button onClick={onSkip} disabled={loading}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition">
              Skip
            </button>
          )}
          <button
            onClick={onNext}
            disabled={loading || disableNext}
            className="px-6 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : nextLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
