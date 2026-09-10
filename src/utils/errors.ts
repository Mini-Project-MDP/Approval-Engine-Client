import axios from 'axios'
import type { ApiEnvelope } from '../types/api'

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError<ApiEnvelope<unknown>>(err)) {
    return err.response?.data?.error ?? err.message
  }
  if (err instanceof Error) return err.message
  return 'Terjadi kesalahan tak terduga'
}
