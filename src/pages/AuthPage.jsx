import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Loader, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function AuthPage() {
  const navigate = useNavigate()
  const { signUp, signIn, loading, error: authError } = useAuth()
  
  const [isSignUp, setIsSignUp] = useState(false)
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
    <section className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2a2a2a] to-[#B35A38] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
          
          {/* Header */}
          <div className="bg-[#1A1A1A] p-8 text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 bg-[#B35A38] rounded-full flex items-center justify-center font-bold text-xl">
                R
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Roam Kenya</h1>
            <p className="text-gray-400 text-sm">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* Error Alert */}
            {authError && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{authError}</p>
              </div>
            )}

            {/* Full Name (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase text-gray-600 mb-3 ml-1">
                  <User size={14} /> Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full p-4 bg-gray-50 rounded-xl border-2 focus:bg-white transition-all outline-none text-gray-800 font-medium ${
                    formErrors.fullName ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-[#B35A38]'
                  }`}
                />
                {formErrors.fullName && (
                  <p className="text-red-500 text-xs mt-2 ml-1">{formErrors.fullName}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase text-gray-600 mb-3 ml-1">
                <Mail size={14} /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full p-4 bg-gray-50 rounded-xl border-2 focus:bg-white transition-all outline-none text-gray-800 font-medium ${
                  formErrors.email ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-[#B35A38]'
                }`}
              />
              {formErrors.email && (
                <p className="text-red-500 text-xs mt-2 ml-1">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase text-gray-600 mb-3 ml-1">
                <Lock size={14} /> Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full p-4 bg-gray-50 rounded-xl border-2 focus:bg-white transition-all outline-none text-gray-800 font-medium ${
                  formErrors.password ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-[#B35A38]'
                }`}
              />
              {formErrors.password && (
                <p className="text-red-500 text-xs mt-2 ml-1">{formErrors.password}</p>
              )}
            </div>

            {/* Confirm Password (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase text-gray-600 mb-3 ml-1">
                  <Lock size={14} /> Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full p-4 bg-gray-50 rounded-xl border-2 focus:bg-white transition-all outline-none text-gray-800 font-medium ${
                    formErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-[#B35A38]'
                  }`}
                />
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-2 ml-1">{formErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full bg-[#B35A38] hover:bg-[#a04a2a] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
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
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setFormData({ email: '', password: '', fullName: '', confirmPassword: '' })
                    setFormErrors({})
                  }}
                  className="text-[#B35A38] font-bold hover:underline"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white text-sm opacity-75">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </section>
  )
}
