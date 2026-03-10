'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, PenTool, Shield, Eye, AlertCircle, X } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'user' | 'creator' | 'admin' | 'guest'>('user')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [successData, setSuccessData] = useState<{ role: string; redirectPath: string } | null>(null)
  const [countdown, setCountdown] = useState(5)
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null)

  const getRedirectPath = (role: string) => {
    switch(role) {
      case 'admin': return '/admin'
      case 'creator': return '/creator'
      default: return '/'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch(role) {
      case 'admin': return 'Admin'
      case 'creator': return 'Creator'
      case 'guest': return 'Guest'
      default: return 'User'
    }
  }

  const startCountdown = (role: string, path: string) => {
    setSuccessData({ role, redirectPath: path })
    setShowSuccessPopup(true)
    setCountdown(5)

    // Clear any existing interval
    if (countdownInterval) {
      clearInterval(countdownInterval)
    }

    // Start new countdown
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          handleRedirectNow(path)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    setCountdownInterval(interval)
  }

  const handleRedirectNow = (path: string) => {
    // Clear interval
    if (countdownInterval) {
      clearInterval(countdownInterval)
      setCountdownInterval(null)
    }
    
    setShowSuccessPopup(false)
    router.push(path)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (selectedRole === 'guest') {
      localStorage.setItem('userRole', 'guest')
      localStorage.setItem('userData', JSON.stringify({
        role: 'guest',
        username: 'guest_user',
        displayName: 'Guest User'
      }))
      
      // Dispatch guest login event
      window.dispatchEvent(new Event('userLogin'))
      
      // Show success popup for guest
      const roleDisplay = getRoleDisplayName('guest')
      startCountdown('guest', '/')
      return
    }

    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          role: selectedRole
        }),
      })

      const data = await response.json()
      console.log('Login response:', data)

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Login failed')
      }

      // Store user data
      localStorage.setItem('userRole', data.user.role)
      localStorage.setItem('userData', JSON.stringify(data.user))
      localStorage.setItem('authToken', data.token)

      // CRITICAL: Dispatch login event to update navbar IMMEDIATELY
      window.dispatchEvent(new Event('userLogin'))

      // Show success popup before redirect
      const roleDisplay = getRoleDisplayName(data.user.role)
      const redirectPath = getRedirectPath(data.user.role)
      startCountdown(roleDisplay, redirectPath)

    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { 
      id: 'user' as const, 
      label: 'User', 
      icon: User, 
      description: 'Read manga, save progress, create collections'
    },
    { 
      id: 'creator' as const, 
      label: 'Creator', 
      icon: PenTool, 
      description: 'Upload and manage your own content'
    },
    { 
      id: 'admin' as const, 
      label: 'Admin', 
      icon: Shield, 
      description: 'Manage platform content and users'
    },
    { 
      id: 'guest' as const, 
      label: 'Guest', 
      icon: Eye, 
      description: 'Browse without logging in'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 pt-16 font-sans relative">
      {/* Success Popup */}
      {showSuccessPopup && successData && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => handleRedirectNow(successData.redirectPath)}
          />
          
          {/* Popup */}
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-300 dark:border-gray-800 animate-in fade-in zoom-in duration-300">
            {/* Close button */}
            <button
              onClick={() => handleRedirectNow(successData.redirectPath)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>

            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg 
                className="w-8 h-8 text-green-600 dark:text-green-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>

            {/* Success Message */}
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              LOGIN SUCCESS!
            </h2>
            
            <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
              Welcome back, {successData.role}!
            </p>

            {/* Redirect Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <p className="text-center text-gray-700 dark:text-gray-300">
                You will be redirected shortly
              </p>
              <p className="text-center text-gray-500 dark:text-gray-500 text-sm mt-2">
                Redirecting in {countdown} seconds...
              </p>
            </div>

            {/* Redirect Button */}
            <button
              onClick={() => handleRedirectNow(successData.redirectPath)}
              className="w-full py-3 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 font-semibold text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
            >
              Redirect Now
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Welcome to <span className="text-gray-700 dark:text-gray-300">SagaRead</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Choose how you want to experience our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {roles.map((role) => {
              const Icon = role.icon
              const isSelected = selectedRole === role.id
              
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-gray-900 dark:border-white bg-gray-100 dark:bg-gray-900'
                      : 'border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-700 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                      isSelected ? 'bg-gray-900 dark:bg-white text-white dark:text-black' : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <h3 className="text-base font-bold mb-2 text-gray-900 dark:text-white">{role.label}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">{role.description}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {selectedRole !== 'guest' ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-300 dark:border-gray-800 shadow-sm">
              <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                Login as <span className="text-gray-700 dark:text-gray-400 capitalize">{selectedRole}</span>
              </h2>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                  <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5" size={16} />
                  <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">Username or Email</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      setError('')
                    }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white text-sm"
                    placeholder="Enter your username or email"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError('')
                    }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white text-sm"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 accent-gray-900 dark:accent-white" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">Remember me</span>
                  </label>
                  <a href="#" className="text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 text-white dark:text-gray-100 font-semibold text-sm rounded-lg transition flex items-center justify-center gap-2 ${
                    loading
                      ? 'bg-gray-700 cursor-not-allowed'
                      : 'bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-gray-300"></div>
                      Logging in...
                    </>
                  ) : (
                    `Login as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
                  )}
                </button>

                <div className="text-center">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Don't have an account? </span>
                  <Link 
                    href={`/register?role=${selectedRole}`}
                    className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold text-sm"
                  >
                    Register as {selectedRole}
                  </Link>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={handleLogin}
                className="inline-block px-8 py-3 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 font-semibold text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition"
              >
                Continue as Guest
              </button>
              <p className="text-gray-600 dark:text-gray-400 mt-4 text-sm">
                You can browse content but won't be able to save progress or upload
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}