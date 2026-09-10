import { color } from '../theme/tokens'

export interface StatusVisual {
  label: string
  color: string
  bg: string
  /** antd Badge/Tag status keyword, for components that want one. */
  dot: 'success' | 'processing' | 'error' | 'warning' | 'default'
}

const MAP: Record<string, StatusVisual> = {
  pending: { label: 'Menunggu', color: color.textSecondary, bg: '#F1F0EE', dot: 'default' },
  waiting: { label: 'Menunggu', color: color.textTertiary, bg: '#F1F0EE', dot: 'default' },
  active: { label: 'Aktif', color: color.warning, bg: color.warningTint, dot: 'processing' },
  approved: { label: 'Disetujui', color: color.success, bg: color.successTint, dot: 'success' },
  rejected: { label: 'Ditolak', color: color.danger, bg: '#FCEBEE', dot: 'error' },
  skipped: { label: 'Dilewati', color: color.textTertiary, bg: '#F1F0EE', dot: 'default' },
  cancelled: { label: 'Dibatalkan', color: color.textTertiary, bg: '#F1F0EE', dot: 'default' },
  resolution_failed: { label: 'Gagal resolve', color: color.danger, bg: '#FCEBEE', dot: 'error' },
}

export function statusVisual(status: string): StatusVisual {
  return MAP[status] ?? { label: status, color: color.textSecondary, bg: '#F1F0EE', dot: 'default' }
}
