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
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon, SparklesIcon, FilterIcon, XIcon } from "lucide-react"

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

  // Extract user data more reliably
  const authUser = authUserResponse?.user || authUserResponse

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
    enabled: !!authUser, // Only fetch when we have authUser
  })

  const { data: outgoingFriendReqsResponse = {}, isLoading: loadingOutgoingReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
    enabled: !!authUser, // Only fetch when we have authUser
  })

  // Extract outgoing requests more reliably
  const outgoingFriendReqs = outgoingFriendReqsResponse?.outgoingRequests || outgoingFriendReqsResponse

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
      const requests = Array.isArray(outgoingFriendReqs) ? outgoingFriendReqs : []
      
      requests.forEach((req) => {
        const recipientId = req?.recipient?._id || req?.recipientId || req?.recipient
        if (recipientId && req.status === "pending") {
          outgoingIds.add(recipientId)
        }
      })
      setOutgoingRequestsIds(outgoingIds)
    }
  }, [outgoingFriendReqs, loadingOutgoingReqs])

  // Improved language normalization function
  const normalizeLanguage = (lang) => {
    if (!lang) return null
    if (typeof lang === 'object' && lang.name) {
      return lang.name.toString().toLowerCase().trim()
    }
    return lang.toString().toLowerCase().trim()
  }

  // Improved filter function with better debugging
  const getFilteredUsers = () => {
    console.log("=== FILTER DEBUG START ===")
    console.log("Filter type:", filterType)
    console.log("AuthUser:", authUser)
    console.log("Recommended users count:", recommendedUsers.length)

    if (!authUser || !Array.isArray(recommendedUsers) || recommendedUsers.length === 0) {
      console.log("Early return: no authUser or recommendedUsers")
      return []
    }

    // For "all" filter, return immediately
    if (filterType === "all") {
      console.log("Returning all users")
      return recommendedUsers
    }

    // Check if user has language setup
    const userNative = normalizeLanguage(authUser.nativeLanguage)
    const userLearning = normalizeLanguage(authUser.learningLanguage)

    console.log("User languages (normalized):", { userNative, userLearning })

    if (!userNative || !userLearning) {
      console.log("User hasn't completed language setup")
      return []
    }

    const filtered = recommendedUsers.filter(user => {
      const theirNative = normalizeLanguage(user.nativeLanguage)
      const theirLearning = normalizeLanguage(user.learningLanguage)
      
      console.log(`Checking user ${user.fullName}:`, { theirNative, theirLearning })

      // Skip users without complete language data
      if (!theirNative || !theirLearning) {
        console.log(`❌ ${user.fullName}: Missing language data`)
        return false
      }

      let matches = false

      switch (filterType) {
        case "compatible":
          // Perfect match: they speak what you're learning AND learn what you speak
          const perfectMatch = userNative === theirLearning && userLearning === theirNative
          // One way matches
          const speaksMyTarget = userLearning === theirNative
          const learnsMyNative = userNative === theirLearning
          
          matches = perfectMatch || speaksMyTarget || learnsMyNative
          
          if (matches) {
            console.log(`✅ COMPATIBLE: ${user.fullName}`, {
              perfectMatch,
              speaksMyTarget,
              learnsMyNative
            })
          }
          break

        case "native":
          // They are native speakers of what I'm learning
          matches = userLearning === theirNative
          if (matches) {
            console.log(`✅ NATIVE: ${user.fullName} speaks ${theirNative}`)
          }
          break

        case "learning":
          // They are learning what I speak natively
          matches = userNative === theirLearning
          if (matches) {
            console.log(`✅ LEARNING: ${user.fullName} is learning ${theirLearning}`)
          }
          break

        default:
          matches = false
      }

      if (!matches) {
        console.log(`❌ NO MATCH: ${user.fullName}`)
      }

      return matches
    })

    console.log(`=== FILTER RESULT: ${filtered.length} users matched ===`)
    return filtered
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

  // Show compatibility indicator
  const isUserCompatible = (user) => {
    if (!authUser?.nativeLanguage || !authUser?.learningLanguage) return false
    
    const userNative = normalizeLanguage(authUser.nativeLanguage)
    const userLearning = normalizeLanguage(authUser.learningLanguage)
    const theirNative = normalizeLanguage(user.nativeLanguage)
    const theirLearning = normalizeLanguage(user.learningLanguage)

    if (!userNative || !userLearning || !theirNative || !theirLearning) return false

    return (userNative === theirLearning && userLearning === theirNative) ||
           (userLearning === theirNative) ||
           (userNative === theirLearning)
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] transition-all duration-500">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Header Section */}
        <div className="hero bg-gradient-to-br from-[var(--primary)]/15 via-[var(--primary)]/8 to-transparent rounded-3xl p-8 border border-[var(--primary)]/20 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-700 hover:scale-[1.02] animate-fade-in">
          <div className="hero-content text-center">
            <div className="max-w-2xl space-y-6">
              <div className="relative">
                <h1 className="text-5xl font-bold text-[var(--text)] mb-4 bg-gradient-to-r from-[var(--text)] via-[var(--primary)] to-[var(--text)] bg-clip-text text-transparent animate-gradient-x">
                  Welcome to <span className="text-[var(--primary)] drop-shadow-lg">LingoBuddy</span>
                </h1>
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary)]/20 to-transparent blur-xl opacity-30 animate-pulse"></div>
              </div>
              <p className="text-lg opacity-80 mb-6 animate-slide-up-delay-1">
                Connect with language learners worldwide and practice together
              </p>
              <Link
                to="/notifications"
                className="btn btn-primary btn-lg group hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[var(--primary)]/25"
              >
                <UsersIcon className="mr-2 size-5 group-hover:rotate-12 transition-transform duration-300" />
                View Friend Requests
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Link>
            </div>
          </div>
        </div>

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && authUser && (
          <div className="bg-gray-100 p-4 rounded-lg text-sm">
            <div><strong>Debug Info:</strong></div>
            <div>Auth User: {authUser?.fullName}</div>
            <div>Native: {authUser?.nativeLanguage} ({typeof authUser?.nativeLanguage})</div>
            <div>Learning: {authUser?.learningLanguage} ({typeof authUser?.learningLanguage})</div>
            <div>Total Users: {recommendedUsers.length}</div>
            <div>Filtered Users: {filteredUsers.length}</div>
            <div>Filter Type: {filterType}</div>
          </div>
        )}

        {/* Recommended Users Section */}
        <section className="space-y-6 animate-slide-up-delay-3">
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <SparklesIcon className="size-6 text-[var(--primary)] group-hover:rotate-180 transition-transform duration-500" />
              <div>
                <h2 className="text-3xl font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors duration-300">
                  Meet New Learners
                </h2>
                <p className="text-base opacity-70 mt-1 group-hover:opacity-90 transition-opacity duration-300">
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>
            </div>
            
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline group hover:scale-110 transition-all duration-300"
              style={{
                borderColor: "var(--primary)",
                color: showFilters ? "white" : "var(--primary)",
                backgroundColor: showFilters ? "var(--primary)" : "transparent"
              }}
            >
              <FilterIcon className="size-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Filter
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="bg-[var(--background)] border border-[var(--primary)]/20 rounded-2xl p-6 space-y-4 shadow-lg animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--text)]">Filter by Language Compatibility</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="btn btn-ghost btn-sm hover:bg-[var(--primary)]/10"
                >
                  <XIcon className="size-4" />
                </button>
              </div>
              
              {/* Language Setup Warning */}
              {(!authUser?.nativeLanguage || !authUser?.learningLanguage) && (
                <div className="alert alert-warning">
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="size-5" />
                    <div>
                      <div className="font-semibold">Complete your language profile!</div>
                      <div className="text-sm">Set your native and learning languages in your profile to use language filters effectively.</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {["all", "compatible", "native", "learning"].map((type) => {
                  const isDisabled = type !== "all" && (!authUser?.nativeLanguage || !authUser?.learningLanguage)
                  
                  return (
                    <button
                      key={type}
                      onClick={() => !isDisabled && setFilterType(type)}
                      disabled={isDisabled}
                      className={`p-4 rounded-xl border transition-all duration-300 text-left hover:scale-105 ${
                        isDisabled 
                          ? "border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed"
                          : filterType === type
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 shadow-md"
                          : "border-[var(--primary)]/20 hover:border-[var(--primary)]/40"
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1 text-[var(--text)]">
                        {getFilterLabel(type)}
                      </div>
                      <div className="text-xs opacity-70 text-[var(--text)]">
                        {getFilterDescription(type)}
                      </div>
                    </button>
                  )
                })}
              </div>
              
              {filterType !== "all" && (
                <div className="flex items-center gap-2 text-sm opacity-80">
                  <span>Showing {filteredUsers.length} users</span>
                  {authUser?.nativeLanguage && authUser?.learningLanguage && (
                    <span className="text-[var(--primary)]">
                      • Your languages: {getLanguageFlag(authUser.nativeLanguage)} {capitalize(authUser.nativeLanguage)} 
                      → {getLanguageFlag(authUser.learningLanguage)} {capitalize(authUser.learningLanguage)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {(loadingUsers || loadingOutgoingReqs || loadingUser) ? (
            <div className="flex justify-center py-12">
              <div className="relative">
                <span className="loading loading-spinner loading-lg text-[var(--primary)]" />
                <div className="absolute inset-0 loading loading-spinner loading-lg text-[var(--primary)]/30 animate-ping"></div>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="card bg-[var(--background)] border border-[var(--primary)]/20 p-8 text-center shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in">
              <div className="card-body">
                <div className="mx-auto mb-4">
                  <SparklesIcon className="size-12 text-[var(--primary)]/50 animate-pulse" />
                </div>
                <h3 className="font-semibold text-xl mb-2 text-[var(--text)]">
                  {filterType === "all" ? "No learners found" : `No ${getFilterLabel(filterType).toLowerCase()} found`}
                </h3>
                <p className="text-[var(--text)]/70">
                  {filterType === "all" 
                    ? "Check back later for more recommendations."
                    : "Try adjusting your filter or check back later for more matches."
                  }
                </p>
                {filterType !== "all" && (
                  <button
                    onClick={() => setFilterType("all")}
                    className="btn btn-outline btn-sm mt-4"
                    style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
                  >
                    Show All Users
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user, index) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id)
                const isCurrentlyPending = pendingRequests.has(user._id)
                const isCompatible = isUserCompatible(user)

                return (
                  <div
                    key={user._id}
                    className={`card bg-[var(--background)] border transition-all duration-500 hover:-translate-y-2 hover:border-[var(--primary)]/60 group animate-slide-up-stagger hover:scale-[1.02] ${
                      isCompatible && filterType === "compatible" 
                        ? "border-[var(--primary)]/60 shadow-xl shadow-[var(--primary)]/20" 
                        : "border-[var(--primary)]/20 hover:shadow-2xl"
                    }`}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="card-body p-6 space-y-4">
                      {/* Compatibility Badge */}
                      {isCompatible && filterType === "compatible" && (
                        <div className="absolute top-4 right-4">
                          <div className="badge badge-success gap-1 text-xs animate-pulse">
                            <SparklesIcon className="size-3" />
                            Perfect Match
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4">
                        <div className="avatar group-hover:scale-110 transition-transform duration-300">
                          <div
                            className="w-16 h-16 rounded-full ring-2 ring-offset-2 ring-offset-[var(--background)] transition-all duration-300 group-hover:ring-4"
                            style={{
                              borderColor: `var(--primary)`,
                              borderWidth: "2px",
                            }}
                          >
                            <img
                              src={user.profilePicture || "/placeholder.svg"}
                              alt={user.fullName}
                              className="object-cover rounded-full transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                        </div>

                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-[var(--text)] group-hover:text-[var(--primary)] transition-colors duration-300">
                            {user.fullName}
                          </h3>
                          {user.location && (
                            <div className="flex items-center text-sm opacity-70 mt-1 group-hover:opacity-90 transition-opacity duration-300">
                              <MapPinIcon className="size-4 mr-1 group-hover:bounce" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {user.nativeLanguage && (
                          <div
                            className="badge badge-outline transition-all duration-300 hover:scale-105"
                            style={{
                              borderColor: `var(--primary)`,
                              backgroundColor: `var(--primary)`,
                              color: "white",
                            }}
                          >
                            {getLanguageFlag(user.nativeLanguage)}
                            Native: {capitalize(user.nativeLanguage)}
                          </div>
                        )}
                        {user.learningLanguage && (
                          <div
                            className="badge badge-outline transition-all duration-300 hover:scale-105"
                            style={{
                              borderColor: `var(--primary)`,
                              color: `var(--primary)`,
                            }}
                          >
                            {getLanguageFlag(user.learningLanguage)}
                            Learning: {capitalize(user.learningLanguage)}
                          </div>
                        )}
                      </div>

                      <button
                        className={`btn w-full transition-all duration-300 relative overflow-hidden group/btn ${
                          hasRequestBeenSent || isCurrentlyPending
                            ? "btn-disabled opacity-50"
                            : "hover:scale-105 hover:shadow-lg hover:shadow-[var(--primary)]/25"
                        }`}
                        style={{
                          backgroundColor:
                            hasRequestBeenSent || isCurrentlyPending ? "var(--background)" : "var(--primary)",
                          color: hasRequestBeenSent || isCurrentlyPending ? "var(--text)" : "white",
                          borderColor: "var(--primary)",
                          borderWidth: "1px",
                        }}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isCurrentlyPending}
                      >
                        {isCurrentlyPending ? (
                          <>
                            <span className="loading loading-spinner loading-sm mr-2" />
                            Sending...
                          </>
                        ) : hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2 animate-bounce" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-2 group-hover/btn:rotate-12 transition-transform duration-300" />
                            Send Friend Request
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
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
    </div>
  )
}

export default HomePage