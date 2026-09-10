/** First two alphanumeric characters of a NIK, for a compact avatar label. */
export function initials(userId: string): string {
  return userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || '??'
}
