import { axiosClient } from './axiosClient'
import type { ApiEnvelope, PagedData } from '../../types/api'
import type { InboxItem } from '../../types/domain'

export async function getInbox(userId: string, page = 1, limit = 20): Promise<PagedData<InboxItem>> {
  const { data } = await axiosClient.get<ApiEnvelope<PagedData<InboxItem>>>(`/portal/inbox/${encodeURIComponent(userId)}`, {
    params: { page, limit },
  })
  return data.data ?? { items: [], meta: { page, limit, total: 0, total_pages: 1 } }
}
