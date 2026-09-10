export function formatRupiah(n: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

/** Backend timestamps are SQLite UTC strings ("2026-09-08 06:35:29", no
 * offset marker) — normalize to ISO-8601 UTC before handing to Date so every
 * browser parses them the same way. */
export function parseServerDate(s: string): Date {
  return new Date(s.includes('T') ? s : `${s.replace(' ', 'T')}Z`)
}

export function relativeTime(s: string): string {
  const diffMs = Date.now() - parseServerDate(s).getTime()
  const minutes = Math.round(diffMs / 60_000)
  if (minutes < 1) return 'baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.round(hours / 24)
  return `${days} hari lalu`
}

/** Pulls a plausible monetary value out of an arbitrary request payload,
 * without assuming every workflow's payload shape includes one. */
export function payloadAmount(payload: Record<string, unknown>): number | null {
  const v = payload.amount
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}
