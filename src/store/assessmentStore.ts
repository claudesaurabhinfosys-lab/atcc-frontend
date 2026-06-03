import { create } from 'zustand'

export type WizardStep = 'scope' | 'templates' | 'hazards' | 'controls' | 'assurance' | 'recommendations' | 'review'

interface AssessmentWizardState {
  assessmentId: number | null
  currentStep: WizardStep
  completedSteps: WizardStep[]
  formData: Record<string, any>

  setAssessmentId: (id: number) => void
  setStep: (step: WizardStep) => void
  markStepComplete: (step: WizardStep) => void
  setFormData: (key: string, data: any) => void
  reset: () => void
}

const WIZARD_STEPS: WizardStep[] = [
  'scope', 'templates', 'hazards', 'controls', 'assurance', 'recommendations', 'review'
]

export const useAssessmentStore = create<AssessmentWizardState>((set) => ({
  assessmentId: null,
  currentStep: 'scope',
  completedSteps: [],
  formData: {},

  setAssessmentId: (id) => set({ assessmentId: id }),

  setStep: (step) => set({ currentStep: step }),

  markStepComplete: (step) =>
    set((state) => ({
      completedSteps: state.completedSteps.includes(step)
        ? state.completedSteps
        : [...state.completedSteps, step],
    })),

  setFormData: (key, data) =>
    set((state) => ({
      formData: { ...state.formData, [key]: data },
    })),

  reset: () =>
    set({
      assessmentId: null,
      currentStep: 'scope',
      completedSteps: [],
      formData: {},
    }),
}))

export { WIZARD_STEPS }
