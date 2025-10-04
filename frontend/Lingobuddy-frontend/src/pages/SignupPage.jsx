import { useState } from "react"
import { Languages, Sparkles, Eye, EyeOff, ArrowRight, Users, Globe } from "lucide-react"
import { Link } from "react-router-dom"
import useSignup from "../hooks/useSignup"
import { useThemeSelector } from "../hooks/useThemeSelector"
import { FaGoogle } from "react-icons/fa"

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const { theme } = useThemeSelector()
  const { signupMutation, isPending, error } = useSignup()

  const handleSignup = (e) => {
    e.preventDefault()
    
    // Basic validation is now handled in the useSignup hook
    // but we can add client-side validation here too
    if (!signupData.fullName?.trim() || !signupData.email?.trim() || !signupData.password) {
      return // The hook will handle the error
    }
    
    signupMutation(signupData)
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] flex items-center justify-center p-4 transition-all duration-500">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Hero Section */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center space-y-8 p-8 animate-slide-in-left">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/20 to-[var(--primary)]/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-[var(--primary)]/30 via-[var(--primary)]/15 to-[var(--primary)]/5 p-8 rounded-3xl border border-[var(--primary)]/20 backdrop-blur-sm hover:scale-105 transition-all duration-700 shadow-2xl">
              <div className="flex items-center justify-center gap-4 mb-6 relative">
                <div className="relative">
                  <Users className="size-16 text-[var(--primary)] animate-float" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--primary)]/30 rounded-full animate-ping"></div>
                </div>
                <div className="relative">
                  <Globe className="size-16 text-[var(--primary)] animate-float" style={{ animationDelay: "0.5s" }} />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[var(--primary)]/40 rounded-full animate-bounce"></div>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-[var(--text)] mb-2 bg-gradient-to-r from-[var(--text)] via-[var(--primary)] to-[var(--text)] bg-clip-text text-transparent">
                Join <span className="text-[var(--primary)] drop-shadow-lg">LingoBuddy</span>
              </h1>
              <p className="text-lg opacity-80 max-w-md animate-fade-in-delay">
                Start your language learning journey with millions of learners worldwide
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 text-sm opacity-70 animate-slide-up-delay-2">
            <div className="flex items-center space-x-3 hover:opacity-100 transition-opacity duration-300 group">
              <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse group-hover:scale-150 transition-transform duration-300"></div>
              <span>Connect with native speakers</span>
            </div>
            <div className="flex items-center space-x-3 hover:opacity-100 transition-opacity duration-300 group">
              <div
                className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse group-hover:scale-150 transition-transform duration-300"
                style={{ animationDelay: "0.3s" }}
              ></div>
              <span>Practice real conversations</span>
            </div>
            <div className="flex items-center space-x-3 hover:opacity-100 transition-opacity duration-300 group">
              <div
                className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse group-hover:scale-150 transition-transform duration-300"
                style={{ animationDelay: "0.6s" }}
              ></div>
              <span>Learn at your own pace</span>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full max-w-md mx-auto animate-slide-in-right">
          <div className="bg-[var(--background)] border border-[var(--primary)]/20 rounded-2xl p-8 shadow-2xl backdrop-blur-sm hover:shadow-3xl hover:border-[var(--primary)]/40 transition-all duration-500 hover:scale-[1.02]">
            {/* Header */}
            <div className="text-center mb-8 animate-fade-in">
              <div className="flex items-center justify-center gap-3 mb-4 group">
                <div className="relative">
                  <Languages className="size-8 text-[var(--primary)] group-hover:rotate-12 transition-transform duration-300" />
                  <Sparkles className="size-4 text-[var(--primary)] absolute -top-1 -right-1 animate-spin-slow" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors duration-300">
                  LingoBuddy
                </h2>
              </div>
              <h3 className="text-xl font-semibold text-[var(--text)] mb-2">Create your account</h3>
              <p className="text-sm opacity-70">Join our global community of language learners</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm animate-shake">
                {error.response?.data?.message || "An error occurred during signup"}
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-2 animate-slide-up-delay-1">
                <label className="block text-sm font-medium text-[var(--text)]">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-[var(--primary)]/20 rounded-xl bg-[var(--background)] text-[var(--text)] placeholder-[var(--text)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all duration-300 hover:border-[var(--primary)]/40 focus:scale-[1.02]"
                  placeholder="Enter your full name"
                  value={signupData.fullName}
                  onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 animate-slide-up-delay-2">
                <label className="block text-sm font-medium text-[var(--text)]">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-[var(--primary)]/20 rounded-xl bg-[var(--background)] text-[var(--text)] placeholder-[var(--text)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all duration-300 hover:border-[var(--primary)]/40 focus:scale-[1.02]"
                  placeholder="Enter your email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 animate-slide-up-delay-3">
                <label className="block text-sm font-medium text-[var(--text)]">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 pr-12 border border-[var(--primary)]/20 rounded-xl bg-[var(--background)] text-[var(--text)] placeholder-[var(--text)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all duration-300 hover:border-[var(--primary)]/40 focus:scale-[1.02]"
                    placeholder="Create a strong password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text)]/50 hover:text-[var(--text)] hover:scale-110 transition-all duration-300"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              {/* Or Divider */}
              <div className="my-6 flex items-center justify-center gap-2 text-sm text-[var(--text)]/60 animate-slide-up-delay-4">
                <div className="h-px flex-1 bg-[var(--text)]/20"></div>
                <span>OR</span>
                <div className="h-px flex-1 bg-[var(--text)]/20"></div>
              </div>

              {/* Google OAuth Button */}
              <button
                onClick={() => (window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`)}
                type="button"
                className="w-full bg-white text-black border border-[var(--primary)]/20 py-3 px-6 rounded-xl font-medium hover:bg-gray-100 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl group relative overflow-hidden animate-slide-up-delay-5"
              >
                <FaGoogle className="group-hover:rotate-12 transition-transform duration-300" />
                Continue with Google
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>

              <button
                type="submit"
                className="w-full bg-[var(--primary)] text-white py-3 px-6 rounded-xl font-medium hover:bg-[var(--primary)]/90 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl hover:shadow-[var(--primary)]/25 group relative overflow-hidden animate-slide-up-delay-6"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </>
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-8 text-center animate-fade-in-delay">
              <p className="text-sm text-[var(--text)]/70">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[var(--primary)] hover:text-[var(--primary)]/80 font-medium transition-colors duration-300 hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
