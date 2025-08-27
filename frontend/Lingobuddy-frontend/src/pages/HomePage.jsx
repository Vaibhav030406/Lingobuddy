"use client"

// HomePage.jsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
  getAuthUser, // ✅ fetch logged-in user profile
} from "../lib/api"
import { Link } from "react-router-dom"
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon, HeartIcon, SparklesIcon } from "lucide-react"

import { capitialize } from "../lib/utils"
import { useThemeSelector } from "../hooks/useThemeSelector"

import FriendCard, { getLanguageFlag } from "../components/FriendCard"
import NoFriendsFound from "../components/NoFriendsFound"

const HomePage = () => {
  const queryClient = useQueryClient()
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set())
  const [pendingRequests, setPendingRequests] = useState(new Set())
  const [applyFilter, setApplyFilter] = useState(true) // ✅ toggle filter state
  const { theme } = useThemeSelector()

  // Logged-in user profile
  const { data: authUser, isLoading: loadingUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
  })

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  })

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  })

  const { data: outgoingFriendReqs = [], isLoading: loadingOutgoingReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  })

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
      const requests = outgoingFriendReqs.outgoingRequests || outgoingFriendReqs
      if (Array.isArray(requests)) {
        requests.forEach((req) => {
          const recipientId = req?.recipient?._id || req?.recipientId || req?.recipient
          if (recipientId && req.status === "pending") {
            outgoingIds.add(recipientId)
          }
        })
      }
      setOutgoingRequestsIds(outgoingIds)
    }
  }, [outgoingFriendReqs, loadingOutgoingReqs])

  // ✅ Apply filter: only show users whose native language = my learning language
  const filteredUsers = recommendedUsers.filter((user) => {
    if (!applyFilter || !authUser) return true
    return user.nativeLanguage?.toLowerCase() === authUser.learningLanguage?.toLowerCase()
  })

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

        {/* Friends Section */}
        <section className="space-y-6 animate-slide-up-delay-2">
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <HeartIcon className="size-6 text-[var(--primary)] group-hover:scale-125 transition-transform duration-300" />
              <h2 className="text-3xl font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors duration-300">
                Your Friends
              </h2>
            </div>
            <div className="badge badge-primary badge-lg hover:scale-110 transition-transform duration-300 shadow-lg">
              {friends.length} {friends.length === 1 ? "Friend" : "Friends"}
            </div>
          </div>

          {loadingFriends ? (
            <div className="flex justify-center py-12">
              <div className="relative">
                <span className="loading loading-spinner loading-lg text-[var(--primary)]" />
                <div className="absolute inset-0 loading loading-spinner loading-lg text-[var(--primary)]/30 animate-ping"></div>
              </div>
            </div>
          ) : friends.length === 0 ? (
            <div className="animate-fade-in">
              <NoFriendsFound />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {friends.map((friend, index) => (
                <div
                  key={friend._id}
                  className="animate-slide-up-stagger"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <FriendCard friend={friend} />
                </div>
              ))}
            </div>
          )}
        </section>

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

            <label className="flex items-center gap-2 cursor-pointer group hover:scale-105 transition-transform duration-300">
              <input
                type="checkbox"
                className="checkbox checkbox-primary transition-all duration-300 hover:scale-110"
                checked={applyFilter}
                onChange={() => setApplyFilter((prev) => !prev)}
              />
              <span className="text-sm text-[var(--text)] opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                Match my target language
              </span>
            </label>
          </div>

          {loadingUsers || loadingOutgoingReqs || loadingUser ? (
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
                <h3 className="font-semibold text-xl mb-2 text-[var(--text)]">No matching learners</h3>
                <p className="text-[var(--text)]/70">Try turning off the filter to see more learners.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user, index) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id)
                const isCurrentlyPending = pendingRequests.has(user._id)

                return (
                  <div
                    key={user._id}
                    className="card bg-[var(--background)] border border-[var(--primary)]/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-[var(--primary)]/60 group animate-slide-up-stagger hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="card-body p-6 space-y-4">
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
                        <div
                          className="badge badge-outline transition-all duration-300 hover:scale-105"
                          style={{
                            borderColor: `var(--primary)`,
                            backgroundColor: `var(--primary)`,
                            color: "white",
                          }}
                        >
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitialize(user.nativeLanguage)}
                        </div>
                        <div
                          className="badge badge-outline transition-all duration-300 hover:scale-105"
                          style={{
                            borderColor: `var(--primary)`,
                            color: `var(--primary)`,
                          }}
                        >
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitialize(user.learningLanguage)}
                        </div>
                      </div>

                      {user.bio && (
                        <p className="text-sm opacity-80 leading-relaxed text-[var(--text)] group-hover:opacity-100 transition-opacity duration-300">
                          {user.bio}
                        </p>
                      )}

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