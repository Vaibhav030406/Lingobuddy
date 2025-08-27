"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Mail, ArrowRight, Languages, Sparkles } from "lucide-react"
import toast from "react-hot-toast"
import { useThemeSelector } from "../hooks/useThemeSelector"

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { theme } = useThemeSelector()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch("http://localhost:5001/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to send OTP")
      toast.success("OTP sent to your email")
      navigate("/verify-otp", { state: { email } })
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
            <h3 className="text-xl font-semibold text-[var(--text)] mb-2">Forgot Password</h3>
            <p className="text-sm opacity-70">Enter your email to receive a verification code</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 animate-slide-up-delay-1">
              <label className="block text-sm font-medium text-[var(--text)] flex items-center gap-2 group">
                <Mail className="size-4 group-hover:text-[var(--primary)] transition-colors duration-300" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-3 border border-[var(--primary)]/20 rounded-xl bg-[var(--background)] text-[var(--text)] placeholder-[var(--text)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all duration-300 hover:border-[var(--primary)]/40 focus:scale-[1.02]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-[var(--text)]/50 hover:text-[var(--primary)] transition-colors duration-300" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--primary)] text-white py-3 px-6 rounded-xl font-medium hover:bg-[var(--primary)]/90 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl hover:shadow-[var(--primary)]/25 group relative overflow-hidden animate-slide-up-delay-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending OTP...
                </>
              ) : (
                <>
                  Send OTP
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

export default ForgotPasswordPage