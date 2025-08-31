"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import useAuthUser from "../hooks/useAuthUser"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import {
  MapPinIcon,
  ShipWheelIcon,
  ShuffleIcon,
  CameraIcon,
  Languages,
  Sparkles,
  User,
  MessageSquare,
  Globe,
  ArrowRight,
  ArrowLeft,
  Save,
} from "lucide-react"
import { LANGUAGES } from "../constants"
import { completeOnboarding, updateProfile } from "../lib/api"
import { useThemeSelector } from "../hooks/useThemeSelector"

const OnboardingPage = () => {
  const { authUser, isLoading, error: authError } = useAuthUser()
  const queryClient = useQueryClient()
  const location = useLocation()
  const navigate = useNavigate()
  const { theme } = useThemeSelector()

  // Check if we're in edit mode
  const isEditMode = location.pathname === "/edit-profile"

  const [formState, setFormState] = useState({
    fullName: "",
    bio: "",
    nativeLanguage: "",
    learningLanguage: "",
    location: "",
    profilePicture: "",
  })

  // Update form state when authUser changes
  useEffect(() => {
    if (authUser) {
      setFormState({
        fullName: authUser.fullName || "",
        bio: authUser.bio || "",
        nativeLanguage: authUser.nativeLanguage || "",
        learningLanguage: authUser.learningLanguage || "",
        location: authUser.location || "",
        profilePicture: authUser.profilePicture || "",
      })
    }
  }, [authUser])

  const {
    mutate: onboardingMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: isEditMode ? updateProfile : completeOnboarding,
    onSuccess: () => {
      toast.success(isEditMode ? "Profile updated successfully!" : "Profile onboarded successfully")
      queryClient.invalidateQueries({ queryKey: ["authUser"] })
      if (isEditMode) {
        navigate("/") // Redirect to home after editing
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'complete'} profile.`)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onboardingMutation(formState)
  }

  const handleRandomAvatar = () => {
    const seed = Math.floor(Math.random() * 1000)
    const randomAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`
    setFormState({ ...formState, profilePicture: randomAvatar })
    toast.success("Random profile picture generated!")
  }

  const handleBack = () => {
    navigate("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--text)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin mx-auto"></div>
          <p className="text-[var(--text)]/70">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--text)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <p className="text-red-500">Error: {authError.message || "Failed to load user data"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] flex items-center justify-center p-4 transition-all duration-500">
      <div className="w-full max-w-4xl animate-fade-in">
        <div className="bg-[var(--background)] border border-[var(--primary)]/20 rounded-3xl p-8 shadow-2xl backdrop-blur-sm hover:shadow-3xl hover:border-[var(--primary)]/40 transition-all duration-700 hover:scale-[1.01]">
          
          {/* Back button for edit mode */}
          {isEditMode && (
            <div className="mb-6">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-[var(--text)]/70 hover:text-[var(--primary)] transition-colors duration-300 group"
              >
                <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform duration-300" />
                Back to Home
              </button>
            </div>
          )}

          <div className="text-center mb-8 animate-slide-down">
            <div className="flex items-center justify-center gap-3 mb-4 group">
              <div className="relative">
                <Languages className="size-8 text-[var(--primary)] group-hover:rotate-12 transition-transform duration-300 animate-float" />
                <Sparkles className="size-4 text-[var(--primary)] absolute -top-1 -right-1 animate-spin-slow" />
                <div className="absolute -inset-2 bg-[var(--primary)]/10 rounded-full blur-lg animate-pulse"></div>
              </div>
              <h1 className="text-3xl font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors duration-300">
                LingoBuddy
              </h1>
            </div>
            <h2 className="text-2xl font-semibold text-[var(--text)] mb-2 animate-slide-up-delay-1">
              {isEditMode ? "Edit Your Profile" : "Complete Your Profile"}
            </h2>
            <p className="text-sm opacity-70 animate-slide-up-delay-2">
              {isEditMode 
                ? "Update your information and language preferences" 
                : "Tell us about yourself to find the perfect language partners"
              }
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm animate-shake">
              {error.response?.data?.message || `Error ${isEditMode ? 'updating' : 'completing'} profile`}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col items-center space-y-6 animate-slide-up-delay-3">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-[var(--primary)]/20 overflow-hidden bg-[var(--background)] shadow-2xl group-hover:shadow-3xl group-hover:border-[var(--primary)]/40 transition-all duration-500 group-hover:scale-110">
                  {formState.profilePicture ? (
                    <img
                      src={formState.profilePicture || "/placeholder.svg"}
                      alt="Avatar"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={() => {
                        toast.error("Failed to load avatar")
                        setFormState({ ...formState, profilePicture: "" })
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <CameraIcon className="size-12 text-[var(--text)]/30 group-hover:text-[var(--primary)]/50 transition-colors duration-300" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform duration-300">
                  <User className="size-4 text-white" />
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-[var(--primary)]/10 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>

              <button
                type="button"
                onClick={handleRandomAvatar}
                className="bg-[var(--primary)]/10 text-[var(--primary)] px-6 py-3 rounded-xl hover:bg-[var(--primary)]/20 hover:scale-105 transition-all duration-300 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl group"
              >
                <ShuffleIcon className="size-4 group-hover:rotate-180 transition-transform duration-500" />
                Generate Random Avatar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2 animate-slide-up-delay-4">
                <label className="block text-sm font-medium text-[var(--text)] flex items-center gap-2 group">
                  <User className="size-4 group-hover:text-[var(--primary)] transition-colors duration-300" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formState.fullName}
                  onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-[var(--primary)]/20 rounded-xl bg-[var(--background)] text-[var(--text)] placeholder-[var(--text)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all duration-300 hover:border-[var(--primary)]/40 focus:scale-[1.02]"
                  placeholder="Your full name"
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-2 animate-slide-up-delay-5">
                <label className="block text-sm font-medium text-[var(--text)] flex items-center gap-2 group">
                  <MapPinIcon className="size-4 group-hover:text-[var(--primary)] transition-colors duration-300" />
                  Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formState.location}
                    onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-[var(--primary)]/20 rounded-xl bg-[var(--background)] text-[var(--text)] placeholder-[var(--text)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all duration-300 hover:border-[var(--primary)]/40 focus:scale-[1.02]"
                    placeholder="City, Country"
                  />
                  <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-[var(--text)]/50 hover:text-[var(--primary)] transition-colors duration-300" />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2 animate-slide-up-delay-6">
              <label className="block text-sm font-medium text-[var(--text)] flex items-center gap-2 group">
                <MessageSquare className="size-4 group-hover:text-[var(--primary)] transition-colors duration-300" />
                Bio
              </label>
              <textarea
                value={formState.bio}
                onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                className="w-full px-4 py-3 border border-[var(--primary)]/20 rounded-xl bg-[var(--background)] text-[var(--text)] placeholder-[var(--text)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all duration-300 resize-none hover:border-[var(--primary)]/40 focus:scale-[1.02]"
                placeholder="Tell us about yourself and your language learning goals..."
                rows={3}
              />
            </div>

            {/* Languages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 animate-slide-up-delay-7">
                <label className="block text-sm font-medium text-[var(--text)] flex items-center gap-2 group">
                  <Globe className="size-4 group-hover:text-[var(--primary)] transition-colors duration-300" />
                  Native Language
                </label>
                <select
                  value={formState.nativeLanguage}
                  onChange={(e) => setFormState({ ...formState, nativeLanguage: e.target.value })}
                  className="w-full px-4 py-3 border border-[var(--primary)]/20 rounded-xl bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all duration-300 hover:border-[var(--primary)]/40 focus:scale-[1.02]"
                  required
                >
                  <option value="">Select your native language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 animate-slide-up-delay-8">
                <label className="block text-sm font-medium text-[var(--text)] flex items-center gap-2 group">
                  <Languages className="size-4 group-hover:text-[var(--primary)] transition-colors duration-300" />
                  Learning Language
                </label>
                <select
                  value={formState.learningLanguage}
                  onChange={(e) => setFormState({ ...formState, learningLanguage: e.target.value })}
                  className="w-full px-4 py-3 border border-[var(--primary)]/20 rounded-xl bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all duration-300 hover:border-[var(--primary)]/40 focus:scale-[1.02]"
                  required
                >
                  <option value="">Select language you're learning</option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--primary)] text-white py-4 px-6 rounded-xl font-medium hover:bg-[var(--primary)]/90 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl hover:shadow-[var(--primary)]/25 group relative overflow-hidden animate-slide-up-delay-9"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isEditMode ? "Updating Profile..." : "Completing Profile..."}
                </>
              ) : (
                <>
                  {isEditMode ? (
                    <>
                      <Save className="size-5 group-hover:scale-110 transition-transform duration-300" />
                      Update Profile
                    </>
                  ) : (
                    <>
                      <ShipWheelIcon className="size-5 group-hover:rotate-180 transition-transform duration-500" />
                      Complete Profile
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage