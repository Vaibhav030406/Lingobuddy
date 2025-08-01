import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  LoaderIcon,
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
} from "lucide-react";
import { LANGUAGES } from "../constants";
import { completeOnboarding } from "../lib/api";
import { useThemeSelector } from "../hooks/useThemeSelector";

const OnboardingPage = () => {
  const { authUser, isLoading, error: authError } = useAuthUser();
  const queryClient = useQueryClient();
  const { theme } = useThemeSelector();

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    profilePicture: authUser?.profilePicture || "",
  });

  const { mutate: onboardingMutation, isPending, error } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile onboarded successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to complete onboarding.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onboardingMutation(formState);
  };

  const handleRandomAvatar = () => {
    const seed = Math.floor(Math.random() * 1000);
    const randomAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;
    setFormState({ ...formState, profilePicture: randomAvatar });
    toast.success("Random profile picture generated!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--text)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin mx-auto"></div>
          <p className="text-[var(--text)]/70">Loading your profile...</p>
        </div>
      </div>
    );
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
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-[var(--background)] border border-[var(--primary)]/20 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <Languages className="size-8 text-[var(--primary)]" />
                <Sparkles className="size-4 text-[var(--primary)] absolute -top-1 -right-1" />
              </div>
              <h1 className="text-3xl font-bold text-[var(--text)]">LingoBuddy</h1>
            </div>
            <h2 className="text-2xl font-semibold text-[var(--text)] mb-2">Complete Your Profile</h2>
            <p className="text-sm opacity-70">Tell us about yourself to find the perfect language partners</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm">
              {error.response?.data?.message || "Error completing onboarding"}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-[var(--primary)]/20 overflow-hidden bg-[var(--background)] shadow-lg">
                  {formState.profilePicture ? (
                    <img
                      src={formState.profilePicture}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={() => {
                        toast.error("Failed to load avatar");
                        setFormState({ ...formState, profilePicture: "" });
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <CameraIcon className="size-12 text-[var(--text)]/30" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center">
                  <User className="size-4 text-white" />
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleRandomAvatar}
                className="bg-[var(--primary)]/10 text-[var(--primary)] px-6 py-3 rounded-xl hover:bg-[var(--primary)]/20 transition-all duration-200 flex items-center gap-2 font-medium"
              >
                <ShuffleIcon className="size-4" />
                Generate Random Avatar
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text)] flex items-center gap-2">
                  <User className="size-4" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formState.fullName}
                  onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-[var(--primary)]/20 rounded-xl bg-[var(--background)] text-[var(--text)] placeholder-[var(--text)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all duration-200"
                  placeholder="Your full name"
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text)] flex items-center gap-2">
                  <MapPinIcon className="size-4" />
                  Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formState.location}
                    onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-[var(--primary)]/20 rounded-xl bg-[var(--background)] text-[var(--text)] placeholder-[var(--text)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all duration-200"
                    placeholder="City, Country"
                  />
                  <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-[var(--text)]/50" />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text)] flex items-center gap-2">
                <MessageSquare className="size-4" />
                Bio
              </label>
              <textarea
                value={formState.bio}
                onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                className="w-full px-4 py-3 border border-[var(--primary)]/20 rounded-xl bg-[var(--background)] text-[var(--text)] placeholder-[var(--text)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all duration-200 resize-none"
                placeholder="Tell us about yourself and your language learning goals..."
                rows={3}
              />
            </div>

            {/* Languages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text)] flex items-center gap-2">
                  <Globe className="size-4" />
                  Native Language
                </label>
                <select
                  value={formState.nativeLanguage}
                  onChange={(e) => setFormState({ ...formState, nativeLanguage: e.target.value })}
                  className="w-full px-4 py-3 border border-[var(--primary)]/20 rounded-xl bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all duration-200"
                  required
                >
                  <option value="">Select your native language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang.toLowerCase()}>{lang}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text)] flex items-center gap-2">
                  <Languages className="size-4" />
                  Learning Language
                </label>
                <select
                  value={formState.learningLanguage}
                  onChange={(e) => setFormState({ ...formState, learningLanguage: e.target.value })}
                  className="w-full px-4 py-3 border border-[var(--primary)]/20 rounded-xl bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all duration-200"
                  required
                >
                  <option value="">Select language you're learning</option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang.toLowerCase()}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[var(--primary)] text-white py-4 px-6 rounded-xl font-medium hover:bg-[var(--primary)]/90 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Completing Profile...
                </>
              ) : (
                <>
                  <ShipWheelIcon className="size-5" />
                  Complete Profile
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
