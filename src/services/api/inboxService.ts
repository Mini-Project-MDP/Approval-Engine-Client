import { axiosClient } from './axiosClient'
import type { ApiEnvelope } from '../../types/api'
import type { InboxItem } from '../../types/domain'

export async function getInbox(userId: string): Promise<InboxItem[]> {
  const { data } = await axiosClient.get<ApiEnvelope<InboxItem[]>>(`/inbox/${encodeURIComponent(userId)}`)
  return data.data ?? []
}
