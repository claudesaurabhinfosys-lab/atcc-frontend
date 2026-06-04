'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import WizardShell from '@/components/assessment/WizardShell'
import Step1Details from '@/components/assessment/steps/Step1Details'
import Step2Templates from '@/components/assessment/steps/Step2Templates'
import Step3Hazards from '@/components/assessment/steps/Step3Hazards'
import Step4Controls from '@/components/assessment/steps/Step4Controls'
import Step5Assurance, { AssuranceScore } from '@/components/assessment/steps/Step5Assurance'
import Step6Scoring from '@/components/assessment/steps/Step6Scoring'
import Step7Review from '@/components/assessment/steps/Step7Review'

interface WizardState {
  // Step 1
  details: { title: string; scope_type: string; notes?: string; next_review_date?: string } | null
  // Step 2
  selectedModules: string[]
  // Step 3
  selectedHazards: string[]
  // Step 4
  selectedControlIds: number[]
  selectedControls: any[]
  // Step 5
  assuranceScores: Record<number, AssuranceScore>
  // Step 6
  moduleScores: Record<string, any>
}

export default function NewAssessmentPage() {
  const router = useRouter()
  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [assessmentId, setAssessmentId] = useState<number | null>(null)
  const [assessment, setAssessment]     = useState<any>(null)

  const [state, setState] = useState<WizardState>({
    details: null,
    selectedModules: [],
    selectedHazards: [],
    selectedControlIds: [],
    selectedControls: [],
    assuranceScores: {},
    moduleScores: {},
  })

  const update = (patch: Partial<WizardState>) => setState(s => ({ ...s, ...patch }))

  // ── STEP HANDLERS ──────────────────────────────────────────────────────────

  const handleStep1 = async (data: any) => {
    setLoading(true); setError('')
    try {
      let res
      if (assessmentId) {
        res = await api.put(`/assessments/${assessmentId}`, data)
      } else {
        res = await api.post('/assessments', data)
        setAssessmentId(res.data.id)
      }
      setAssessment(res.data)
      update({ details: data })
      setStep(2)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to save.')
    } finally { setLoading(false) }
  }

  const handleStep2 = async () => {
    if (state.selectedModules.length === 0) { setError('Select at least one template.'); return }
    setLoading(true); setError('')
    try {
      await api.put(`/assessments/${assessmentId}/templates`, { module_codes: state.selectedModules })
      setStep(3)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to save templates.')
    } finally { setLoading(false) }
  }

  const handleStep3 = () => {
    // Hazards are informational — just move forward
    setStep(4)
  }

  const handleStep4 = async () => {
    if (state.selectedControlIds.length === 0) { setError('Select at least one control.'); return }
    // Fetch full control objects for assurance step
    setLoading(true); setError('')
    try {
      // Build controls list from selection — get from knowledge base
      const r = await api.get('/knowledge')
      const allControls = r.data ?? []
      const selected = allControls.filter((c: any) => state.selectedControlIds.includes(c.id))
      update({ selectedControls: selected })
      setStep(5)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load controls.')
    } finally { setLoading(false) }
  }

  const handleStep5 = async () => {
    setLoading(true); setError('')
    try {
      const controls = state.selectedControlIds.map(id => {
        const score = state.assuranceScores[id] ?? {
          control_id: id, present_score: 2, suitable_score: 2, operational_score: 1, effective_score: 1, notes: ''
        }
        return { ...score, control_id: id }
      })
      await api.put(`/assessments/${assessmentId}/control-assurance`, { controls })
      setStep(6)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to save assurance scores.')
    } finally { setLoading(false) }
  }

  const handleStep6 = async () => {
    setLoading(true); setError('')
    try {
      // Save controls with effectiveness scores
      const controls = state.selectedControlIds.map(id => {
        const assurance = state.assuranceScores[id]
        return {
          control_id: id,
          design_strength:  assurance?.suitable_score ?? 2,
          implementation:   assurance?.operational_score ?? 2,
          verification:     assurance?.effective_score ?? 1,
          evidence_quality: assurance?.present_score ?? 1,
        }
      })
      await api.put(`/assessments/${assessmentId}/controls`, { controls })
      setStep(7)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to save scoring.')
    } finally { setLoading(false) }
  }

  const handleSubmit = async () => {
    setLoading(true); setError('')
    try {
      // Score the assessment first
      await api.get(`/assessments/${assessmentId}/score`)
      // Then submit
      await api.post(`/assessments/${assessmentId}/submit`)
      router.push(`/assessments/${assessmentId}?submitted=1`)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to submit assessment.')
    } finally { setLoading(false) }
  }

  const handleNext = () => {
    setError('')
    if (step === 1) { document.getElementById('step1-form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); return }
    if (step === 2) { handleStep2(); return }
    if (step === 3) { handleStep3(); return }
    if (step === 4) { handleStep4(); return }
    if (step === 5) { handleStep5(); return }
    if (step === 6) { handleStep6(); return }
    if (step === 7) { handleSubmit(); return }
  }

  const handleBack = () => { setError(''); setStep(s => s - 1) }

  return (
    <div className="space-y-2">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Assessment</h1>
        <p className="text-gray-500 text-sm mt-0.5">Complete each step to create a risk assessment.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <WizardShell
        currentStep={step}
        onNext={handleNext}
        onBack={handleBack}
        onSkip={step >= 3 && step <= 6 ? () => { setError(''); setStep(s => s + 1) } : undefined}
        nextLabel={step === 7 ? 'Submit Assessment' : 'Next'}
        loading={loading}
        disableNext={step === 2 && state.selectedModules.length === 0}
      >
        {step === 1 && (
          <Step1Details
            defaultValues={state.details ?? undefined}
            onSubmit={handleStep1}
            loading={loading}
          />
        )}
        {step === 2 && (
          <Step2Templates
            selected={state.selectedModules}
            onChange={mods => update({ selectedModules: mods })}
          />
        )}
        {step === 3 && (
          <Step3Hazards
            moduleCodes={state.selectedModules}
            selected={state.selectedHazards}
            onChange={h => update({ selectedHazards: h })}
          />
        )}
        {step === 4 && (
          <Step4Controls
            moduleCodes={state.selectedModules}
            selected={state.selectedControlIds}
            onChange={ids => update({ selectedControlIds: ids })}
          />
        )}
        {step === 5 && (
          <Step5Assurance
            controls={state.selectedControls.length > 0
              ? state.selectedControls
              : state.selectedControlIds.map(id => ({ id, control_code: `CTRL_${id}`, control_text: `Control #${id}`, module_code: '' }))
            }
            scores={state.assuranceScores}
            onChange={s => update({ assuranceScores: s })}
          />
        )}
        {step === 6 && (
          <Step6Scoring
            moduleCodes={state.selectedModules}
            scores={state.moduleScores}
            onChange={s => update({ moduleScores: s })}
          />
        )}
        {step === 7 && (
          <Step7Review
            assessment={assessment}
            moduleCodes={state.selectedModules}
            selectedControls={state.selectedControlIds}
            scoringData={state.moduleScores}
            assuranceData={state.assuranceScores}
          />
        )}
      </WizardShell>
    </div>
  )
}
