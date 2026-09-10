export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type StepStatus = 'waiting' | 'active' | 'approved' | 'rejected' | 'skipped' | 'resolution_failed'
export type AssignmentStatus = 'pending' | 'approved' | 'rejected' | 'skipped'
export type Decision = 'approved' | 'rejected'

export interface ApprovalAssignment {
  id: string
  step_id: string
  request_id: string
  user_id: string
  user_name?: string
  user_position?: string
  status: AssignmentStatus
  comment?: string | null
  acted_at?: string | null
}

export interface ApprovalStep {
  id: string
  request_id: string
  step_order: number
  name: string
  approval_mode: 'any' | 'all'
  status: StepStatus
  activated_at?: string | null
  completed_at?: string | null
  assignments?: ApprovalAssignment[]
}

export interface ApprovalRequest {
  id: string
  app_id: string
  definition_id: string
  doc_type: string
  resource_id: string
  requester_id: string
  payload: Record<string, unknown>
  status: RequestStatus
  current_step_order: number
  created_at: string
  completed_at?: string | null
  steps?: ApprovalStep[]
}

export interface InboxItem {
  assignment: ApprovalAssignment
  request: ApprovalRequest
  step_name: string
  total_steps: number
}

export interface Application {
  id: string
  code: string
  name: string
  api_key?: string
  is_active: boolean
  created_at?: string
}

export type ResolverType = 'superior' | 'role' | 'static' | 'field'
export type ApprovalMode = 'any' | 'all'
export type OnEmpty = 'fail' | 'skip'
export type ConditionOp = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in'

export interface ResolverRule {
  type: ResolverType
  level?: number
  position?: string
  department?: string
  scope?: 'same_department'
  user_id?: string
  path?: string
}

export interface Condition {
  field: string
  op: ConditionOp
  value: string | number
}

export interface WorkflowStep {
  id: string
  definition_id: string
  step_order: number
  name: string
  resolver_rule: ResolverRule
  condition?: Condition | null
  approval_mode: ApprovalMode
  on_empty: OnEmpty
}

export interface WorkflowDefinition {
  id: string
  app_id: string
  doc_type: string
  name: string
  version: number
  is_active: boolean
  created_at?: string
  steps?: WorkflowStep[]
}
