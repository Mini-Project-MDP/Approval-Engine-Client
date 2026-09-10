import { axiosClient } from './axiosClient'
import type { ApiEnvelope } from '../../types/api'
import type { ApprovalRequest, Decision } from '../../types/domain'

export async function getRequest(id: string): Promise<ApprovalRequest> {
  const { data } = await axiosClient.get<ApiEnvelope<ApprovalRequest>>(`/requests/${encodeURIComponent(id)}`)
  if (!data.data) throw new Error(data.error ?? 'request not found')
  return data.data
}

export interface DecisionInput {
  user_id: string
  decision: Decision
  comment?: string
}

export async function decideRequest(id: string, input: DecisionInput): Promise<ApprovalRequest> {
  const { data } = await axiosClient.post<ApiEnvelope<ApprovalRequest>>(
    `/requests/${encodeURIComponent(id)}/decision`,
    input,
  )
  if (!data.data) throw new Error(data.error ?? 'failed to record decision')
  return data.data
}
