import { axiosClient } from './axiosClient'
import type { ApiEnvelope, PagedData } from '../../types/api'
import type { Application } from '../../types/domain'

export async function listApplications(page = 1, limit = 20): Promise<PagedData<Application>> {
  const { data } = await axiosClient.get<ApiEnvelope<PagedData<Application>>>('/portal/applications', {
    params: { page, limit },
  })
  return data.data ?? { items: [], meta: { page, limit, total: 0, total_pages: 1 } }
}

export interface CreateApplicationInput {
  code: string
  name: string
}

export async function createApplication(input: CreateApplicationInput): Promise<Application> {
  const { data } = await axiosClient.post<ApiEnvelope<Application>>('/portal/applications', input)
  if (!data.data) throw new Error(data.error ?? 'failed to create application')
  return data.data
}
