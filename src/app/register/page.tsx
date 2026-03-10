'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { User, PenTool, Shield, AlertCircle, ArrowLeft, CheckCircle, X } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [selectedRole, setSelectedRole] = useState<'user' | 'creator' | 'admin'>('user')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [redirecting, setRedirecting] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const role = searchParams.get('role') as 'user' | 'creator' | 'admin'
    if (role && ['user', 'creator', 'admin'].includes(role)) {
      setSelectedRole(role)
    }
  }, [searchParams])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
    }
  }, [countdownInterval])

  const startCountdown = () => {
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
          handleRedirect()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    setCountdownInterval(interval)
  }

  const handleRedirect = () => {
    // Clear interval
    if (countdownInterval) {
      clearInterval(countdownInterval)
      setCountdownInterval(null)
    }
    
    setShowSuccessPopup(false)
    router.push('/login')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setRedirecting(false)

    // Validation
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('All fields are required')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password: password.trim(),
          role: selectedRole,
          display_name: displayName.trim() || username.trim()
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Registration failed. Please try again.')
      }

      // Registration successful - show popup instead of inline success
      startCountdown()

    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { 
      id: 'user' as const, 
      label: 'User', 
      icon: User, 
      description: 'Read manga, bookmark favorites, track progress'
    },
    { 
      id: 'creator' as const, 
      label: 'Creator', 
      icon: PenTool, 
      description: 'Upload your manga, manage chapters, interact with readers'
    },
    { 
      id: 'admin' as const, 
      label: 'Admin', 
      icon: Shield, 
      description: 'Manage platform content, moderate users, system settings'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 pt-16 font-sans relative">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleRedirect}
          />
          
          {/* Popup */}
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-300 dark:border-gray-800 animate-in fade-in zoom-in duration-300">
            {/* Close button */}
            <button
              onClick={handleRedirect}
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
              REGISTRATION SUCCESSFUL!
            </h2>
            
            <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
              Your account has been created successfully!
            </p>

            {/* Redirect Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <p className="text-center text-gray-700 dark:text-gray-300">
                Redirecting you to login page
              </p>
              <p className="text-center text-gray-500 dark:text-gray-500 text-sm mt-2">
                Redirecting in {countdown} seconds...
              </p>
            </div>

            {/* Redirect Button */}
            <button
              onClick={handleRedirect}
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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link 
              href="/login" 
              className="inline-flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition text-sm"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Login
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
              Join <span className="text-gray-700 dark:text-gray-300">SagaRead</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create your account and start your manga journey
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {roles.map((role) => {
              const Icon = role.icon
              const isSelected = selectedRole === role.id
              
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-sm ${
                    isSelected
                      ? 'border-gray-900 dark:border-white bg-gray-100 dark:bg-gray-900'
                      : 'border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-700 dark:hover:border-gray-600'
                  }`}
                  disabled={loading || redirecting || showSuccessPopup}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${
                      isSelected ? 'bg-gray-900 dark:bg-white text-white dark:text-black' : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{role.label}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs leading-tight">{role.description}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Registration Form */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-300 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Register as <span className="text-gray-700 dark:text-gray-400 capitalize">{selectedRole}</span>
              </h2>
              {redirecting && (
                <div className="flex items-center text-green-600 dark:text-green-400 text-xs">
                  <CheckCircle size={14} className="mr-2" />
                  Redirecting...
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle size={16} className="text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
                </div>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      setError('')
                    }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white text-sm"
                    placeholder="Choose a username"
                    required
                    disabled={loading || redirecting || showSuccessPopup}
                  />
                  <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">This will be your unique identifier</p>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white text-sm"
                    placeholder="How you want to be shown"
                    disabled={loading || redirecting || showSuccessPopup}
                  />
                  <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Optional - defaults to username</p>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white text-sm"
                  placeholder="your@email.com"
                  required
                  disabled={loading || redirecting || showSuccessPopup}
                />
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">We'll never share your email</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError('')
                    }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white text-sm"
                    placeholder="At least 6 characters"
                    required
                    disabled={loading || redirecting || showSuccessPopup}
                  />
                  <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Minimum 6 characters</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setError('')
                    }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white text-sm"
                    placeholder="Re-enter your password"
                    required
                    disabled={loading || redirecting || showSuccessPopup}
                  />
                  <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Must match password</p>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="mr-3 mt-1 accent-gray-900 dark:accent-white"
                  required
                  disabled={loading || redirecting || showSuccessPopup}
                />
                <label htmlFor="terms" className="text-gray-700 dark:text-gray-300 text-xs">
                  I agree to the{' '}
                  <Link href="/terms" className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300">
                    Privacy Policy
                  </Link>
                  . I understand that SagaRad is a platform for sharing and discovering manga content.
                </label>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading || redirecting || showSuccessPopup}
                className={`w-full py-3 text-white dark:text-gray-100 font-semibold text-sm rounded-lg transition duration-200 flex items-center justify-center gap-2 ${
                  loading || redirecting || showSuccessPopup
                    ? 'bg-gray-700 cursor-not-allowed opacity-70'
                    : 'bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-gray-300"></div>
                    Creating Account...
                  </>
                ) : redirecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-gray-300"></div>
                    Redirecting...
                  </>
                ) : (
                  `Create ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Account`
                )}
              </button>

              {/* Login Link */}
              <div className="text-center pt-4 border-t border-gray-300 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Already have an account?{' '}
                  <Link 
                    href={`/login?role=${selectedRole}`}
                    className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold text-sm"
                  >
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-8">
            <p className="text-gray-500 dark:text-gray-500 text-xs">
              By registering, you agree to our community guidelines and content policies.
              {selectedRole === 'creator' && (
                <span className="block mt-1 text-gray-700 dark:text-gray-400">
                  Creators must follow content upload guidelines and copyright policies.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}