import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'approval-engine.current_user_id'

interface CurrentUserContextValue {
  userId: string | null
  login: (id: string) => void
  logout: () => void
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null)

function readStoredUserId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

// Deliberately lightweight (no SSO): the engine trusts a consuming app's own
// login for server-to-server calls, but this portal is a browser app talking
// directly to the API, so it still needs its own way to know "who is
// looking at this inbox right now". A real login can replace this later
// without touching how the rest of the app reads the current user.
export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(readStoredUserId)

  useEffect(() => {
    try {
      if (userId) localStorage.setItem(STORAGE_KEY, userId)
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // private browsing / storage disabled: session just won't persist
    }
  }, [userId])

  const login = (id: string) => setUserId(id.trim().toUpperCase())
  const logout = () => setUserId(null)

  return <CurrentUserContext.Provider value={{ userId, login, logout }}>{children}</CurrentUserContext.Provider>
}

export function useCurrentUser(): CurrentUserContextValue {
  const ctx = useContext(CurrentUserContext)
  if (!ctx) throw new Error('useCurrentUser must be used within CurrentUserProvider')
  return ctx
}
