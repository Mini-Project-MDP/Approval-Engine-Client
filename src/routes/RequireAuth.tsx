import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '../context/CurrentUserContext'

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { userId } = useCurrentUser()
  if (!userId) return <Navigate to="/login" replace />
  return <>{children}</>
}
