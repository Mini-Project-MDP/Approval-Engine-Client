import { axiosClient } from './axiosClient'
import type { ApiEnvelope } from '../../types/api'
import type { Application } from '../../types/domain'

export async function listApplications(): Promise<Application[]> {
  const { data } = await axiosClient.get<ApiEnvelope<Application[]>>('/applications')
  return data.data ?? []
}

export interface CreateApplicationInput {
  code: string
  name: string
}

export async function createApplication(input: CreateApplicationInput): Promise<Application> {
  const { data } = await axiosClient.post<ApiEnvelope<Application>>('/applications', input)
  if (!data.data) throw new Error(data.error ?? 'failed to create application')
  return data.data
}
