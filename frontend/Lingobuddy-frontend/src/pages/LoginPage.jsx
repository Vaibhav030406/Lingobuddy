import { useState } from "react";
import { Languages, Sparkles, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import useLogin from "../hooks/useLogin";
import { useThemeSelector } from "../hooks/useThemeSelector";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { isPending, error, loginMutation } = useLogin();
  const { theme } = useThemeSelector();

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation(loginData);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Hero Section */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center space-y-8 p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/20 to-[var(--primary)]/10 rounded-full blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-[var(--primary)]/30 to-[var(--primary)]/10 p-8 rounded-3xl border border-[var(--primary)]/20">
              <Languages className="size-24 text-[var(--primary)] mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-[var(--text)] mb-2">
                Welcome to <span className="text-[var(--primary)]">LingoBuddy</span>
              </h1>
              <p className="text-lg opacity-80 max-w-md">
                Connect with language learners worldwide and practice conversations together
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm opacity-70">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
              <span>Practice with native speakers</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
              <span>Learn at your own pace</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-[var(--background)] border border-[var(--primary)]/20 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="relative">
                  <Languages className="size-8 text-[var(--primary)]" />
                  <Sparkles className="size-4 text-[var(--primary)] absolute -top-1 -right-1" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--text)]">LingoBuddy</h2>
              </div>
              <h3 className="text-xl font-semibold text-[var(--text)] mb-2">Welcome back!</h3>
              <p className="text-sm opacity-70">Sign in to continue your language journey</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm">
                {error.response?.data?.message || "An error occurred during login"}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text)]">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-[var(--primary)]/20 rounded-xl bg-[var(--background)] text-[var(--text)] placeholder-[var(--text)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all duration-200"
                  placeholder="Enter your email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text)]">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 pr-12 border border-[var(--primary)]/20 rounded-xl bg-[var(--background)] text-[var(--text)] placeholder-[var(--text)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all duration-200"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text)]/50 hover:text-[var(--text)] transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--primary)] text-white py-3 px-6 rounded-xl font-medium hover:bg-[var(--primary)]/90 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-[var(--text)]/70">
                Don't have an account?{" "}
                <Link 
                  to="/signup" 
                  className="text-[var(--primary)] hover:text-[var(--primary)]/80 font-medium transition-colors"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
