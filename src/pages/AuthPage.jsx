import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, Loader, Mail, Lock, User, Chrome, Facebook } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function AuthPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signUp, signIn, loading, error: authError, signInWithGoogle, signInWithFacebook } = useAuth()
  
  const modeParam = searchParams.get('mode')
  const [isSignUp, setIsSignUp] = useState(modeParam === 'signup' ? true : false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [oauthError, setOauthError] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const errors = {}

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    if (isSignUp) {
      if (!formData.fullName.trim()) {
        errors.fullName = 'Full name is required'
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const handleGoogleLogin = async () => {
    setOauthLoading(true)
    setOauthError(null)
    try {
      const result = await signInWithGoogle()
      if (!result.success) {
        setOauthError(result.error?.message || 'Google login failed')
      }
    } catch (err) {
      setOauthError(err.message || 'Failed to login with Google')
    } finally {
      setOauthLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    setOauthLoading(true)
    setOauthError(null)
    try {
      const result = await signInWithFacebook()
      if (!result.success) {
        setOauthError(result.error?.message || 'Facebook login failed')
      }
    } catch (err) {
      setOauthError(err.message || 'Failed to login with Facebook')
    } finally {
      setOauthLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      if (isSignUp) {
        await signUp(formData.email, formData.password)
      } else {
        await signIn(formData.email, formData.password)
      }

      // Redirect to booking after auth
      setTimeout(() => navigate('/booking'), 1000)
    } catch (err) {
      console.error('Auth error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2a2a2a] to-[#B35A38] flex items-center justify-center px-4 sm:px-6 py-20">
      <div className="w-full max-w-md">
        <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden p-5 sm:p-8">

          {/* Decorative blurs */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#B35A38]/20 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#C5A059]/20 rounded-full blur-3xl -z-10" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 bg-[#B35A38] rounded-full flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-[#B35A38]/30">
                R
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Roam Kenya</h1>
            <p className="text-white/60 text-sm">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* OAuth Error Alert */}
            {oauthError && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-start gap-3">
                <AlertCircle size={18} className="text-red-300 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{oauthError}</p>
              </div>
            )}

            {/* OAuth Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={oauthLoading || isSubmitting || loading}
                className="w-full group relative overflow-hidden rounded-2xl p-3.5 transition-all duration-300 bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-3">
                  <Chrome size={20} className="text-[#4285F4]" />
                  <span className="text-white font-semibold text-sm">Continue with Google</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleFacebookLogin}
                disabled={oauthLoading || isSubmitting || loading}
                className="w-full group relative overflow-hidden rounded-2xl p-3.5 transition-all duration-300 bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-3">
                  <Facebook size={20} className="text-[#1877F2]" />
                  <span className="text-white font-semibold text-sm">Continue with Facebook</span>
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-white/60 text-xs font-semibold">OR</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            {/* Auth Error Alert */}
            {authError && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-start gap-3">
                <AlertCircle size={18} className="text-red-300 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{authError}</p>
              </div>
            )}

            {/* Full Name (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase text-white/60 mb-2 ml-1">
                  <User size={14} /> Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full p-4 bg-white/10 rounded-xl border transition-all outline-none text-white font-medium placeholder-white/40 ${
                    formErrors.fullName ? 'border-red-500' : 'border-white/20 focus:border-[#C5A059]'
                  }`}
                />
                {formErrors.fullName && (
                  <p className="text-red-300 text-xs mt-2 ml-1">{formErrors.fullName}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase text-white/60 mb-2 ml-1">
                <Mail size={14} /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full p-4 bg-white/10 rounded-xl border transition-all outline-none text-white font-medium placeholder-white/40 ${
                  formErrors.email ? 'border-red-500' : 'border-white/20 focus:border-[#C5A059]'
                }`}
              />
              {formErrors.email && (
                <p className="text-red-300 text-xs mt-2 ml-1">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase text-white/60 mb-2 ml-1">
                <Lock size={14} /> Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full p-4 bg-white/10 rounded-xl border transition-all outline-none text-white font-medium placeholder-white/40 ${
                  formErrors.password ? 'border-red-500' : 'border-white/20 focus:border-[#C5A059]'
                }`}
              />
              {formErrors.password && (
                <p className="text-red-300 text-xs mt-2 ml-1">{formErrors.password}</p>
              )}
            </div>

            {/* Confirm Password (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase text-white/60 mb-2 ml-1">
                  <Lock size={14} /> Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full p-4 bg-white/10 rounded-xl border transition-all outline-none text-white font-medium placeholder-white/40 ${
                    formErrors.confirmPassword ? 'border-red-500' : 'border-white/20 focus:border-[#C5A059]'
                  }`}
                />
                {formErrors.confirmPassword && (
                  <p className="text-red-300 text-xs mt-2 ml-1">{formErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full bg-[#B35A38] hover:bg-[#a04a2a] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-lg shadow-[#B35A38]/20"
            >
              {isSubmitting || loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>

            {/* Toggle Auth Mode */}
            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-white/60 text-sm">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setFormData({ email: '', password: '', fullName: '', confirmPassword: '' })
                    setFormErrors({})
                  }}
                  className="text-[#C5A059] font-bold hover:underline"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white text-sm opacity-50">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </section>
  )
}
