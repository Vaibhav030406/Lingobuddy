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
  Dessert,
} from "lucide-react";
import { LANGUAGES } from "../constants";
import { completeOnboarding } from "../lib/api";

const OnboardingPage = () => {
  const { authUser, isLoading, error: authError } = useAuthUser();
  const queryClient = useQueryClient();

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoaderIcon className="animate-spin text-blue-500 size-8" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-700">
        Error: {authError.message || "Failed to load user data"}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white text-gray-800 transition-all duration-300">
      <div className="w-full max-w-3xl border border-blue-200 bg-white rounded-xl shadow-lg p-6">
        <div className="mb-6 flex items-center gap-2 justify-center">
          <Dessert className="text-blue-500 size-8 animate-spin-slow" />
          <h1 className="text-2xl font-bold text-blue-600">Complete Your Profile</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 border border-red-300 rounded">
            <span>{error.response?.data?.message || "Error completing onboarding"}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Picture */}
          <div className="flex flex-col items-center space-y-4">
            <div className="size-32 rounded-full border border-blue-200 overflow-hidden bg-gray-100">
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
                  <CameraIcon className="size-10 text-gray-400" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleRandomAvatar}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              <ShuffleIcon className="inline size-4 mr-1" />
              Generate Random Avatar
            </button>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input
              type="text"
              value={formState.fullName}
              onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
              className="w-full border border-gray-300 bg-blue-100 p-2 rounded focus:ring-2 focus:ring-blue-400"
              placeholder="Your full name"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium">Bio</label>
            <textarea
              value={formState.bio}
              onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
              className="w-full border border-gray-300 bg-blue-100 p-2 rounded focus:ring-2 focus:ring-blue-400"
              placeholder="Tell us about yourself"
            />
          </div>

          {/* Languages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Native Language</label>
              <select
                value={formState.nativeLanguage}
                onChange={(e) => setFormState({ ...formState, nativeLanguage: e.target.value })}
                className="w-full border border-gray-300 p-2 bg-blue-100 rounded focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang.toLowerCase()}>{lang}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Learning Language</label>
              <select
                value={formState.learningLanguage}
                onChange={(e) => setFormState({ ...formState, learningLanguage: e.target.value })}
                className="w-full border border-gray-300 p-2 bg-blue-100 rounded focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang.toLowerCase()}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium">Location</label>
            <div className="relative">
              <MapPinIcon className="absolute top-1/2 -translate-y-1/2 left-3 size-5 text-gray-400" />
              <input
                type="text"
                value={formState.location}
                onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                className="w-full pl-10 border border-gray-300 p-2 rounded bg-blue-100 focus:ring-2 focus:ring-blue-400"
                placeholder="City, Country"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <LoaderIcon className="inline size-5 mr-2 animate-spin" />
                Onboarding...
              </>
            ) : (
              <>
                <ShipWheelIcon className="inline size-5 mr-2" />
                Complete Onboarding
              </>
            )}
          </button>
        </form>
      </div>

      {/* Add animation CSS */}
      <style jsx="true">{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default OnboardingPage;
