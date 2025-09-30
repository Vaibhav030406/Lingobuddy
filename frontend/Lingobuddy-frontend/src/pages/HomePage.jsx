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
import "./HomePage.css"

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
    <div className="homepage-root">
      <div className="homepage-container">
        {/* Header Section */}
        <div className="hero">
          <h1 className="hero-title">
            Welcome to <span className="primary">LingoBuddy</span>
          </h1>
          <p className="hero-desc">
            Connect with language learners worldwide and practice together
          </p>
          <Link to="/notifications" className="hero-link">
            <UsersIcon size={20} />
            View Friend Requests
          </Link>
        </div>

        {/* Recommended Users Section */}
        <section>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <SparklesIcon
                size={28}
                style={{ color: "var(--primary)", flexShrink: 0 }}
              />
              <div>
                <h2 className="section-title">Meet New Learners</h2>
                <p className="section-desc">
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`filter-toggle-btn${showFilters ? " active" : ""}`}
            >
              <FilterIcon size={18} />
              Filter
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="filter-panel">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>
                  Filter by Language Compatibility
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text)",
                    padding: "0.25rem",
                  }}
                >
                  <XIcon size={20} />
                </button>
              </div>

              {(!authUser?.nativeLanguage || !authUser?.learningLanguage) && (
                <div
                  style={{
                    background: "#fffbe6",
                    border: "1px solid #ffe58f",
                    borderRadius: "0.75rem",
                    padding: "1rem",
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                  }}
                >
                  <SparklesIcon size={20} style={{ color: "#faad14", flexShrink: 0, marginTop: "0.125rem" }} />
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                      Complete your language profile!
                    </div>
                    <div style={{ fontSize: "0.875rem", opacity: 0.8 }}>
                      Set your native and learning languages in your profile to use language filters effectively.
                    </div>
                  </div>
                </div>
              )}

              <div className="filter-options">
                {["all", "compatible", "native", "learning"].map((type) => {
                  const isDisabled =
                    type !== "all" &&
                    (!authUser?.nativeLanguage || !authUser?.learningLanguage)
                  return (
                    <button
                      key={type}
                      onClick={() => !isDisabled && setFilterType(type)}
                      disabled={isDisabled}
                      className={`filter-btn${filterType === type ? " selected" : ""}`}
                    >
                      <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                        {getFilterLabel(type)}
                      </div>
                      <div style={{ fontSize: "0.85rem", opacity: 0.75 }}>
                        {getFilterDescription(type)}
                      </div>
                    </button>
                  )
                })}
              </div>

              {filterType !== "all" && (
                <div
                  style={{
                    marginTop: "1rem",
                    fontSize: "0.9rem",
                    opacity: 0.8,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span>Showing {filteredUsers.length} users</span>
                  {authUser?.nativeLanguage && authUser?.learningLanguage && (
                    <span style={{ color: "var(--primary)", fontWeight: 500 }}>
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
            <div className="card-body">
              <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
                <SparklesIcon size={48} style={{ color: "var(--primary)", opacity: 0.5 }} />
              </div>
              <h3 style={{ fontWeight: 600, fontSize: "1.25rem", marginBottom: "0.5rem", color: "var(--text)" }}>
                {filterType === "all"
                  ? "No learners found"
                  : `No ${getFilterLabel(filterType).toLowerCase()} found`}
              </h3>
              <p style={{ color: "var(--text)", opacity: 0.7 }}>
                {filterType === "all"
                  ? "Check back later for more recommendations."
                  : "Try adjusting your filter or check back later for more matches."}
              </p>
              {filterType !== "all" && (
                <button
                  onClick={() => setFilterType("all")}
                  style={{
                    marginTop: "1rem",
                    padding: "0.625rem 1.25rem",
                    borderRadius: "0.75rem",
                    border: "2px solid var(--primary)",
                    background: "transparent",
                    color: "var(--primary)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Show All Users
                </button>
              )}
            </div>
          ) : (
            <div className="users-grid">
              {filteredUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id)
                const isCurrentlyPending = pendingRequests.has(user._id)
                const isCompatible = isUserCompatible(user)

                return (
                  <div key={user._id} className="user-card">
                    {isCompatible && filterType === "compatible" && (
                      <div
                        style={{
                          position: "absolute",
                          top: "1rem",
                          right: "1rem",
                          background: "#52c41a",
                          color: "#fff",
                          padding: "0.375rem 0.75rem",
                          borderRadius: "0.5rem",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <SparklesIcon size={12} />
                        Perfect Match
                      </div>
                    )}

                    <div className="user-header">
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <img
                          src={user.profilePicture || "/placeholder.svg"}
                          alt={user.fullName}
                          className="user-avatar"
                        />
                        <div className="user-info">
                          <div className="user-name">{user.fullName}</div>
                          {user.location && (
                            <div className="user-location">
                              <MapPinIcon size={16} />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="user-badges">
                        {user.nativeLanguage && (
                          <div className="badge-native">
                            {getLanguageFlag(user.nativeLanguage)} Native:{" "}
                            {capitalize(user.nativeLanguage)}
                          </div>
                        )}
                        {user.learningLanguage && (
                          <div className="badge-learning">
                            {getLanguageFlag(user.learningLanguage)} Learning:{" "}
                            {capitalize(user.learningLanguage)}
                          </div>
                        )}
                      </div>

                      <button
                        className="add-friend-btn"
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isCurrentlyPending}
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
    </div>
  )
}

export default HomePage