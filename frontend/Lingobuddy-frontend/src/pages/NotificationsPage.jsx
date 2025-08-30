"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { UserCheckIcon, BellIcon, CheckCircleIcon, SparklesIcon } from "lucide-react"
import { acceptFriendRequest, getFriendRequests } from "../lib/api"
import NoNotificationsFound from "../components/NoNotificationsFound"
import { useThemeSelector } from "../hooks/useThemeSelector"
import { capitalize } from "../lib/utils"
import { getLanguageFlag } from "../components/FriendCard"

const NotificationsPage = () => {
  const queryClient = useQueryClient()
  const { theme } = useThemeSelector()

  const {
    data: friendRequests,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  })

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      // Invalidate both friend requests and friends queries
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] })
      queryClient.invalidateQueries({ queryKey: ["friends"] })
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] })
    },
  })

  // Debug logging
  console.log("NotificationsPage - friendRequests data:", friendRequests)
  console.log("NotificationsPage - isLoading:", isLoading)
  console.log("NotificationsPage - error:", error)

  // Only show pending requests in notifications, not accepted ones
  const incomingRequests = friendRequests?.incomingRequests || []
  // Remove accepted requests from notifications - they should appear in friends list instead
  // const acceptedRequests = friendRequests?.acceptedRequests || [];

  console.log("NotificationsPage - incomingRequests:", incomingRequests)

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] transition-all duration-500">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="flex items-center justify-center gap-3 mb-4 group">
            <div className="relative">
              <BellIcon className="size-8 text-[var(--primary)] group-hover:rotate-12 transition-transform duration-300 animate-float" />
              <SparklesIcon className="size-4 text-[var(--primary)] absolute -top-1 -right-1 animate-spin-slow" />
              <div className="absolute -inset-2 bg-[var(--primary)]/10 rounded-full blur-lg animate-pulse"></div>
            </div>
            <h1 className="text-3xl font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors duration-300">
              Notifications
            </h1>
          </div>
          <p className="text-sm opacity-70 animate-fade-in-delay">Manage your friend requests and connections</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-600 text-center animate-shake">
            <p>Error loading notifications: {error.message}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-[var(--primary)]/10 border-t-[var(--primary)]/30 rounded-full animate-spin animate-ping"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Friend Requests Section */}
            {incomingRequests.length > 0 && (
              <section className="space-y-6 animate-slide-up-delay-1">
                <div className="flex items-center gap-3 group">
                  <UserCheckIcon className="size-6 text-[var(--primary)] group-hover:scale-125 transition-transform duration-300" />
                  <h2 className="text-2xl font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors duration-300">
                    Friend Requests
                  </h2>
                  <div className="badge badge-primary badge-lg hover:scale-110 transition-transform duration-300 shadow-lg animate-bounce">
                    {incomingRequests.length} {incomingRequests.length === 1 ? "Request" : "Requests"}
                  </div>
                </div>

                <div className="grid gap-4">
                  {incomingRequests.map((request, index) => (
                    <div
                      key={request._id}
                      className="card bg-[var(--background)] border border-[var(--primary)]/20 hover:shadow-2xl hover:border-[var(--primary)]/40 transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] group animate-slide-up-stagger"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <div className="card-body p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="avatar group-hover:scale-110 transition-transform duration-300">
                              <div className="w-16 h-16 rounded-full ring-2 ring-[var(--primary)]/20 ring-offset-2 ring-offset-[var(--background)] group-hover:ring-4 group-hover:ring-[var(--primary)]/40 transition-all duration-300">
                                <img
                                  src={request.sender.profilePicture || "/placeholder.svg"}
                                  alt={request.sender.fullName}
                                  className="object-cover rounded-full transition-transform duration-300 group-hover:scale-110"
                                />
                              </div>
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-[var(--text)] group-hover:text-[var(--primary)] transition-colors duration-300">
                                {request.sender.fullName}
                              </h3>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <div className="badge badge-primary badge-outline hover:scale-105 transition-transform duration-300">
                                  {getLanguageFlag(request.sender.nativeLanguage)}
                                  Native: {capitalize(request.sender.nativeLanguage)}
                                </div>
                                <div className="badge badge-secondary badge-outline hover:scale-105 transition-transform duration-300">
                                  {getLanguageFlag(request.sender.learningLanguage)}
                                  Learning: {capitalize(request.sender.learningLanguage)}
                                </div>
                              </div>
                              {request.sender.location && (
                                <p className="text-sm opacity-70 mt-1 group-hover:opacity-90 transition-opacity duration-300">
                                  📍 {request.sender.location}
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            className="btn btn-primary hover:btn-secondary hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[var(--primary)]/25 group/btn relative overflow-hidden"
                            onClick={() => acceptRequestMutation(request._id)}
                            disabled={isPending}
                          >
                            {isPending ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                Accepting...
                              </>
                            ) : (
                              <>
                                <CheckCircleIcon className="size-4 mr-2 group-hover/btn:rotate-12 transition-transform duration-300" />
                                Accept Request
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* No Notifications */}
            {incomingRequests.length === 0 && (
              <div className="animate-fade-in">
                <NoNotificationsFound />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage