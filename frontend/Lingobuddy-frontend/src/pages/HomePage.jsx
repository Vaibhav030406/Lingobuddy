// frontend/Lingobuddy-frontend/src/pages/HomePage.jsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getAuthUser,
  sendFriendRequest,
} from "../lib/api"
import { Link } from "react-router-dom"
import {
  CheckCircleIcon,
  MapPinIcon,
  UserPlusIcon,
  UsersIcon,
  SparklesIcon,
  FilterIcon,
  XIcon,
} from "lucide-react"

import { capitalize } from "../lib/utils"
import { useThemeSelector } from "../hooks/useThemeSelector"
import { getLanguageFlag } from "../components/FriendCard"

const HomePage = () => {
  const queryClient = useQueryClient()
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set())
  const [pendingRequests, setPendingRequests] = useState(new Set())
  const [filterType, setFilterType] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const { theme } = useThemeSelector()

  const { data: authUserResponse, isLoading: loadingUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: 1,
  })

  const authUser = authUserResponse?.user || authUserResponse

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
    enabled: !!authUser,
  })

  const {
    data: outgoingFriendReqsResponse = {},
    isLoading: loadingOutgoingReqs,
  } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
    enabled: !!authUser,
  })

  const outgoingFriendReqs =
    outgoingFriendReqsResponse?.outgoingRequests || outgoingFriendReqsResponse

  const { mutate: sendRequestMutation } = useMutation({
    mutationFn: sendFriendRequest,
    onMutate: async (recipientId) => {
      await queryClient.cancelQueries({ queryKey: ["outgoingFriendReqs"] })
      setOutgoingRequestsIds((prev) => new Set([...prev, recipientId]))
      setPendingRequests((prev) => new Set([...prev, recipientId]))
      return { recipientId }
    },
    onSuccess: (data, recipientId) => {
      setPendingRequests((prev) => {
        const updated = new Set(prev)
        updated.delete(recipientId)
        return updated
      })
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] })
    },
    onError: (error, recipientId, context) => {
      setOutgoingRequestsIds((prev) => {
        const updated = new Set(prev)
        updated.delete(context.recipientId)
        return updated
      })
      setPendingRequests((prev) => {
        const updated = new Set(prev)
        updated.delete(context.recipientId)
        return updated
      })
      console.error("Failed to send friend request:", error)
    },
  })

  useEffect(() => {
    if (!loadingOutgoingReqs && outgoingFriendReqs) {
      const outgoingIds = new Set()
      const requests = Array.isArray(outgoingFriendReqs)
        ? outgoingFriendReqs
        : []

      requests.forEach((req) => {
        const recipientId =
          req?.recipient?._id || req?.recipientId || req?.recipient
        if (recipientId && req.status === "pending") {
          outgoingIds.add(recipientId)
        }
      })
      setOutgoingRequestsIds(outgoingIds)
    }
  }, [outgoingFriendReqs, loadingOutgoingReqs])

  const normalizeLanguage = (lang) => {
    if (!lang) return null
    if (typeof lang === "object" && lang.name) {
      return lang.name.toString().toLowerCase().trim()
    }
    return lang.toString().toLowerCase().trim()
  }

  const getFilteredUsers = () => {
    if (
      !authUser ||
      !Array.isArray(recommendedUsers) ||
      recommendedUsers.length === 0
    ) {
      return []
    }

    if (filterType === "all") {
      return recommendedUsers
    }

    const userNative = normalizeLanguage(authUser.nativeLanguage)
    const userLearning = normalizeLanguage(authUser.learningLanguage)

    if (!userNative || !userLearning) {
      return []
    }

    return recommendedUsers.filter((user) => {
      const theirNative = normalizeLanguage(user.nativeLanguage)
      const theirLearning = normalizeLanguage(user.learningLanguage)

      if (!theirNative || !theirLearning) return false

      switch (filterType) {
        case "compatible":
          return (
            (userNative === theirLearning && userLearning === theirNative) ||
            userLearning === theirNative ||
            userNative === theirLearning
          )
        case "native":
          return userLearning === theirNative
        case "learning":
          return userNative === theirLearning
        default:
          return false
      }
    })
  }

  const filteredUsers = getFilteredUsers()

  const getFilterLabel = (type) => {
    switch (type) {
      case "compatible":
        return "Perfect Match"
      case "native":
        return "Native Speakers"
      case "learning":
        return "Learning Partners"
      case "all":
      default:
        return "All Users"
    }
  }

  const getFilterDescription = (type) => {
    if (!authUser?.nativeLanguage || !authUser?.learningLanguage) {
      switch (type) {
        case "compatible":
          return "Perfect language exchange matches (requires profile setup)"
        case "native":
          return "Native speakers of your target language (requires profile setup)"
        case "learning":
          return "Users learning your native language (requires profile setup)"
        case "all":
        default:
          return "All available language learners"
      }
    }

    switch (type) {
      case "compatible":
        return "Users who speak what you're learning & learn what you speak"
      case "native":
        return `Native speakers of ${capitalize(authUser.learningLanguage)}`
      case "learning":
        return `Users learning ${capitalize(authUser.nativeLanguage)}`
      case "all":
      default:
        return "All available language learners"
    }
  }

  const isUserCompatible = (user) => {
    if (!authUser?.nativeLanguage || !authUser?.learningLanguage) return false

    const userNative = normalizeLanguage(authUser.nativeLanguage)
    const userLearning = normalizeLanguage(authUser.learningLanguage)
    const theirNative = normalizeLanguage(user.nativeLanguage)
    const theirLearning = normalizeLanguage(user.learningLanguage)

    if (!userNative || !userLearning || !theirNative || !theirLearning)
      return false

    return (
      (userNative === theirLearning && userLearning === theirNative) ||
      userLearning === theirNative ||
      userNative === theirLearning
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-6 py-8 sm:px-8 lg:px-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-3xl p-10 sm:p-12 border border-blue-500/20 shadow-xl mb-12 text-center">
          <div className="absolute top-0 right-0 w-[200%] h-[200%] bg-[radial-gradient(circle,_rgba(59,130,246,0.1)_0%,_transparent_70%)] animate-pulse" />
          
          <h1 className="relative z-10 text-4xl sm:text-5xl font-extrabold mb-4 text-[var(--text)]">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-[var(--primary)] to-blue-400 bg-clip-text text-transparent">
              LingoBuddy
            </span>
          </h1>
          <p className="relative z-10 text-lg opacity-80 mb-8 text-[var(--text)]">
            Connect with language learners worldwide and practice together
          </p>
          <Link
            to="/notifications"
            className="relative z-10 inline-flex items-center gap-2 bg-[var(--primary)] text-white px-7 py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300"
          >
            <UsersIcon size={20} />
            View Friend Requests
          </Link>
        </div>

        {/* Recommended Users Section */}
        <section>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <SparklesIcon size={28} className="text-[var(--primary)] flex-shrink-0" />
              <div>
                <h2 className="text-3xl font-bold text-[var(--text)]">Meet New Learners</h2>
                <p className="text-sm opacity-70 mt-1 text-[var(--text)]">
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 border-2 border-[var(--primary)] rounded-xl px-6 py-3 font-semibold transition-all duration-250 ${
                showFilters
                  ? "bg-[var(--primary)] text-white shadow-lg shadow-blue-500/30"
                  : "text-[var(--primary)] bg-transparent hover:bg-[var(--primary)] hover:text-white hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5"
              }`}
            >
              <FilterIcon size={18} />
              Filter
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-[var(--background)] border border-blue-500/20 rounded-2xl p-7 mb-8 shadow-lg animate-[slideDown_0.3s_ease]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filter by Language Compatibility</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-[var(--primary)]/10 rounded-lg transition-colors text-[var(--text)]"
                >
                  <XIcon size={20} />
                </button>
              </div>

              {(!authUser?.nativeLanguage || !authUser?.learningLanguage) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                  <SparklesIcon size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">
                      Complete your language profile!
                    </div>
                    <div className="text-sm text-gray-700">
                      Set your native and learning languages in your profile to use language filters effectively.
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {["all", "compatible", "native", "learning"].map((type) => {
                  const isDisabled =
                    type !== "all" &&
                    (!authUser?.nativeLanguage || !authUser?.learningLanguage)
                  return (
                    <button
                      key={type}
                      onClick={() => !isDisabled && setFilterType(type)}
                      disabled={isDisabled}
                      className={`p-5 rounded-xl border-2 transition-all duration-250 text-left flex flex-col gap-2 ${
                        filterType === type
                          ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg shadow-blue-500/30"
                          : isDisabled
                          ? "opacity-50 cursor-not-allowed bg-black/2 border-dashed border-blue-500/10"
                          : "border-blue-500/20 text-[var(--text)] hover:border-[var(--primary)] hover:bg-blue-500/5 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/15"
                      }`}
                    >
                      <div className="font-semibold text-[0.95rem]">
                        {getFilterLabel(type)}
                      </div>
                      <div className="text-[0.85rem] opacity-75">
                        {getFilterDescription(type)}
                      </div>
                    </button>
                  )
                })}
              </div>

              {filterType !== "all" && (
                <div className="mt-4 text-sm opacity-80 flex items-center gap-2 flex-wrap">
                  <span>Showing {filteredUsers.length} users</span>
                  {authUser?.nativeLanguage && authUser?.learningLanguage && (
                    <span className="text-[var(--primary)] font-medium">
                      • Your languages: {getLanguageFlag(authUser.nativeLanguage)}{" "}
                      {capitalize(authUser.nativeLanguage)} →{" "}
                      {getLanguageFlag(authUser.learningLanguage)}{" "}
                      {capitalize(authUser.learningLanguage)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Users Grid */}
          {filteredUsers.length === 0 ? (
            <div className="bg-[var(--background)] border border-blue-500/15 rounded-3xl p-12 text-center shadow-lg">
              <div className="mb-4 flex justify-center">
                <SparklesIcon size={48} className="text-[var(--primary)] opacity-50" />
              </div>
              <h3 className="font-semibold text-xl mb-2 text-[var(--text)]">
                {filterType === "all"
                  ? "No learners found"
                  : `No ${getFilterLabel(filterType).toLowerCase()} found`}
              </h3>
              <p className="text-[var(--text)] opacity-70">
                {filterType === "all"
                  ? "Check back later for more recommendations."
                  : "Try adjusting your filter or check back later for more matches."}
              </p>
              {filterType !== "all" && (
                <button
                  onClick={() => setFilterType("all")}
                  className="mt-4 px-5 py-2.5 rounded-xl border-2 border-[var(--primary)] bg-transparent text-[var(--primary)] font-semibold hover:bg-[var(--primary)] hover:text-white transition-all duration-250"
                >
                  Show All Users
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
              {filteredUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id)
                const isCurrentlyPending = pendingRequests.has(user._id)
                const isCompatible = isUserCompatible(user)

                return (
                  <div
                    key={user._id}
                    className="relative bg-[var(--background)] border border-blue-500/15 rounded-3xl shadow-lg p-6 flex flex-col gap-5 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 hover:border-[var(--primary)]"
                  >
                    {isCompatible && filterType === "compatible" && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <SparklesIcon size={12} />
                        Perfect Match
                      </div>
                    )}

                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={user.profilePicture || "/placeholder.svg"}
                          alt={user.fullName}
                          className="w-20 h-20 rounded-full border-3 border-[var(--primary)] object-cover flex-shrink-0 shadow-lg shadow-blue-500/20"
                        />
                        <div className="flex flex-col gap-2">
                          <div className="font-bold text-xl text-[var(--text)] leading-tight">
                            {user.fullName}
                          </div>
                          {user.location && (
                            <div className="text-sm opacity-70 flex items-center gap-1.5 text-[var(--text)]">
                              <MapPinIcon size={16} />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-row gap-2 flex-wrap">
                        {user.nativeLanguage && (
                          <div className="flex-1 min-w-0 flex items-center gap-1.5 px-2 py-1 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all whitespace-nowrap">
                            {getLanguageFlag(user.nativeLanguage)} Native:{" "}
                            {capitalize(user.nativeLanguage)}
                          </div>
                        )}
                        {user.learningLanguage && (
                          <div className="flex-1 min-w-0 flex items-center gap-1.5 px-2 py-1 rounded-xl border-2 border-[var(--primary)] text-[var(--primary)] bg-blue-500/8 text-xs font-semibold hover:bg-blue-500/15 hover:-translate-y-0.5 transition-all whitespace-nowrap">
                            {getLanguageFlag(user.learningLanguage)} Learning:{" "}
                            {capitalize(user.learningLanguage)}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isCurrentlyPending}
                        className={`w-full px-3.5 py-3.5 rounded-xl font-semibold text-[0.95rem] flex items-center justify-center gap-2 transition-all duration-250 ${
                          hasRequestBeenSent || isCurrentlyPending
                            ? "bg-black/5 border-2 border-black/15 text-[var(--text)] opacity-60 cursor-not-allowed"
                            : "border-2 border-[var(--primary)] bg-[var(--primary)] text-white hover:bg-transparent hover:text-[var(--primary)] hover:scale-[1.02] active:scale-[0.98]"
                        }`}
                      >
                        {isCurrentlyPending ? (
                          <>
                            <span>⏳</span> Sending...
                          </>
                        ) : hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon size={18} /> Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon size={18} /> Send Friend Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default HomePage