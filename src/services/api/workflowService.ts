import { axiosClient } from './axiosClient'
import type { ApiEnvelope } from '../../types/api'
import type { ApprovalMode, Condition, OnEmpty, ResolverRule, WorkflowDefinition } from '../../types/domain'

export async function listWorkflows(appId?: string): Promise<WorkflowDefinition[]> {
  const { data } = await axiosClient.get<ApiEnvelope<WorkflowDefinition[]>>('/workflows', {
    params: appId ? { app_id: appId } : undefined,
  })
  return data.data ?? []
}

export async function getWorkflow(id: string): Promise<WorkflowDefinition> {
  const { data } = await axiosClient.get<ApiEnvelope<WorkflowDefinition>>(`/workflows/${encodeURIComponent(id)}`)
  if (!data.data) throw new Error(data.error ?? 'workflow not found')
  return data.data
}

export interface StepInput {
  name: string
  resolver_rule: ResolverRule
  condition?: Condition | null
  approval_mode: ApprovalMode
  on_empty: OnEmpty
}

export interface PublishWorkflowInput {
  app_id: string
  doc_type: string
  name: string
  steps: StepInput[]
}

export async function publishWorkflow(input: PublishWorkflowInput): Promise<WorkflowDefinition> {
  const { data } = await axiosClient.post<ApiEnvelope<WorkflowDefinition>>('/workflows', input)
  if (!data.data) throw new Error(data.error ?? 'failed to publish workflow')
  return data.data
}

export async function deactivateWorkflow(id: string): Promise<void> {
  await axiosClient.post(`/workflows/${encodeURIComponent(id)}/deactivate`)
}
