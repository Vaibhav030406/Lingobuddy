"use client"

import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Lock, Eye, EyeOff, ArrowRight, Languages, Sparkles } from "lucide-react"
import toast from "react-hot-toast"
import { useThemeSelector } from "../hooks/useThemeSelector"

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email
  const { theme } = useThemeSelector()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      toast.error("Email is missing. Please restart the process.")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("http://localhost:5001/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to reset password")

      toast.success("Password updated successfully")
      navigate("/login")
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--text)] p-4 transition-all duration-500">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-[var(--background)] border border-[var(--primary)]/20 rounded-2xl p-8 shadow-2xl backdrop-blur-sm hover:shadow-3xl hover:border-[var(--primary)]/40 transition-all duration-500 hover:scale-[1.02]">
          {/* Header */}
          <div className="text-center mb-8 animate-slide-down">
            <div className="flex items-center justify-center gap-3 mb-4 group">
              <div className="relative">
                <Languages className="size-8 text-[var(--primary)] group-hover:rotate-12 transition-transform duration-300" />
                <Sparkles className="size-4 text-[var(--primary)] absolute -top-1 -right-1 animate-spin-slow" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors duration-300">
                LingoBuddy
              </h2>
            </div>
            <h3 className="text-xl font-semibold text-[var(--text)] mb-2">Reset Password</h3>
            <p className="text-sm opacity-70">Create a new secure password for your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 animate-slide-up-delay-1">
              <label className="block text-sm font-medium text-[var(--text)] flex items-center gap-2 group">
                <Lock className="size-4 group-hover:text-[var(--primary)] transition-colors duration-300" />
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-12 pr-12 py-3 border border-[var(--primary)]/20 rounded-xl bg-[var(--background)] text-[var(--text)] placeholder-[var(--text)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all duration-300 hover:border-[var(--primary)]/40 focus:scale-[1.02]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-[var(--text)]/50" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text)]/50 hover:text-[var(--text)] hover:scale-110 transition-all duration-300"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2 animate-slide-up-delay-2">
              <label className="block text-sm font-medium text-[var(--text)] flex items-center gap-2 group">
                <Lock className="size-4 group-hover:text-[var(--primary)] transition-colors duration-300" />
                Re-enter Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full pl-12 pr-12 py-3 border border-[var(--primary)]/20 rounded-xl bg-[var(--background)] text-[var(--text)] placeholder-[var(--text)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all duration-300 hover:border-[var(--primary)]/40 focus:scale-[1.02]"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-[var(--text)]/50" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text)]/50 hover:text-[var(--text)] hover:scale-110 transition-all duration-300"
                >
                  {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--primary)] text-white py-3 px-6 rounded-xl font-medium hover:bg-[var(--primary)]/90 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl hover:shadow-[var(--primary)]/25 group relative overflow-hidden animate-slide-up-delay-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Updating Password...
                </>
              ) : (
                <>
                  Update Password
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </>
              )}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-8 text-center animate-fade-in-delay">
            <p className="text-sm text-[var(--text)]/70">
              Remember your password?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-[var(--primary)] hover:text-[var(--primary)]/80 font-medium transition-colors duration-300 hover:underline"
              >
                Back to Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage