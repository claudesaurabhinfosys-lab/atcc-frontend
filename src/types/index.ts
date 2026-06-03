export type RiskBand = 'low' | 'medium' | 'high' | 'critical'
export type AssessmentStatus = 'draft' | 'submitted' | 'approved' | 'archived'
export type PSOEElement = 'present' | 'suitable' | 'operational' | 'effective'
export type UserRole = 'super_admin' | 'company_admin' | 'assessor' | 'viewer'

export interface Company {
  id: number
  name: string
  slug: string
  subdomain?: string
  branding?: { logo?: string; primary_color?: string; secondary_color?: string }
  settings?: Record<string, any>
  knowledge_version: string
}

export interface User {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  job_title?: string
  roles: UserRole[]
  company?: Company
}

export interface RiskModule {
  id: number
  module_code: string
  name: string
  description?: string
  scope: 'global' | 'company'
  sort_order: number
  is_active: boolean
}

export interface Control {
  id: number
  control_code: string
  module_code: string
  control_text: string
  control_type?: string
  hierarchy_level: number
  is_critical: boolean
  pivot?: ControlPivot
}

export interface ControlPivot {
  design_strength: number
  implementation: number
  verification: number
  evidence_quality: number
  effectiveness_score?: number
  effectiveness_band?: string
  present_score: number
  suitable_score: number
  operational_score: number
  effective_score: number
  assurance_score?: number
  notes?: string
}

export interface Assessment {
  id: number
  title: string
  scope_type: string
  scope_entity_id?: number
  status: AssessmentStatus
  knowledge_version: string
  inherent_risk_score?: number
  residual_risk_score?: number
  residual_risk_band?: RiskBand
  control_assurance_score?: number
  confidence_score?: number
  notes?: string
  next_review_date?: string
  submitted_at?: string
  approved_at?: string
  created_at: string
  creator?: User
  risk_modules?: RiskModule[]
  controls?: Control[]
}

export interface RiskRegisterEntry {
  id: number
  assessment_id: number
  residual_risk_band?: RiskBand
  residual_risk_score?: number
  control_assurance_score?: number
  weakest_assurance_element?: PSOEElement
  evidence_status: 'incomplete' | 'partial' | 'complete'
  low_assurance_critical_controls_count: number
  next_review_date?: string
  status: 'active' | 'under_review' | 'archived'
  assessment?: Assessment
}

export interface Finding {
  id?: number
  rule_code?: string
  rule_type?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description?: string
  module_code?: string
  status?: 'open' | 'actioned' | 'accepted'
}
