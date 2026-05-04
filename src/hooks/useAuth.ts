import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { AuthUser } from '../types'

export function useAuth(): AuthUser {
    const [user, setUser] = useState<AuthUser['user']>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                const role = session.user.user_metadata?.role as 'admin' | 'user' | undefined
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    role,
                })
            }
            setIsLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                const role = session.user.user_metadata?.role as 'admin' | 'user' | undefined
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    role,
                })
            } else {
                setUser(null)
            }
            setIsLoading(false)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    return {
        user,
        isAdmin: user?.role === 'admin',
        isLoading,
    }
}
