'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/login?error=Authentication failed')
          return
        }

        if (session) {
          console.log('Session established:', session)
          router.push('/dashboard')
        } else {
          console.log('No session found')
          router.push('/login?error=No session found')
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        router.push('/login?error=Unexpected error occurred')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-gray-600">Signing you in, please wait...</p>
      </div>
    </div>
  )
} 