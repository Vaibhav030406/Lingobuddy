import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  UserCheckIcon, 
  BellIcon, 
  ClockIcon, 
  MessageSquareIcon,
  CheckCircleIcon,
  UsersIcon,
  SparklesIcon
} from "lucide-react";
import { acceptFriendRequest, getFriendRequests } from "../lib/api";
import NoNotificationsFound from "../components/NoNotificationsFound";
import { useThemeSelector } from "../hooks/useThemeSelector";
import { capitialize } from "../lib/utils";
import { getLanguageFlag } from "../components/FriendCard";

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const { theme } = useThemeSelector();

  const { data: friendRequests, isLoading, error } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      // Invalidate both friend requests and friends queries
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
    },
  });

  // Debug logging
  console.log("NotificationsPage - friendRequests data:", friendRequests);
  console.log("NotificationsPage - isLoading:", isLoading);
  console.log("NotificationsPage - error:", error);

  // Only show pending requests in notifications, not accepted ones
  const incomingRequests = friendRequests?.incomingRequests || [];
  // Remove accepted requests from notifications - they should appear in friends list instead
  // const acceptedRequests = friendRequests?.acceptedRequests || [];

  console.log("NotificationsPage - incomingRequests:", incomingRequests);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <div className="container mx-auto px-4 py-6 space-y-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <BellIcon className="size-8 text-[var(--primary)]" />
              <SparklesIcon className="size-4 text-[var(--primary)] absolute -top-1 -right-1" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--text)]">Notifications</h1>
          </div>
          <p className="text-sm opacity-70">Manage your friend requests and connections</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-600 text-center">
            <p>Error loading notifications: {error.message}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Friend Requests Section */}
            {incomingRequests.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <UserCheckIcon className="size-6 text-[var(--primary)]" />
                  <h2 className="text-2xl font-bold text-[var(--text)]">Friend Requests</h2>
                  <div className="badge badge-primary badge-lg">
                    {incomingRequests.length} {incomingRequests.length === 1 ? 'Request' : 'Requests'}
                  </div>
                </div>

                <div className="grid gap-4">
                  {incomingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="card bg-[var(--background)] border border-[var(--primary)]/20 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="card-body p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="avatar">
                              <div className="w-16 h-16 rounded-full ring-2 ring-[var(--primary)]/20">
                                <img 
                                  src={request.sender.profilePicture} 
                                  alt={request.sender.fullName}
                                  className="object-cover rounded-full"
                                />
                              </div>
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-[var(--text)]">{request.sender.fullName}</h3>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <div className="badge badge-primary badge-outline">
                                  {getLanguageFlag(request.sender.nativeLanguage)}
                                  Native: {capitialize(request.sender.nativeLanguage)}
                                </div>
                                <div className="badge badge-secondary badge-outline">
                                  {getLanguageFlag(request.sender.learningLanguage)}
                                  Learning: {capitialize(request.sender.learningLanguage)}
                                </div>
                              </div>
                              {request.sender.location && (
                                <p className="text-sm opacity-70 mt-1">
                                  📍 {request.sender.location}
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            className="btn btn-primary hover:btn-secondary transition-all duration-200"
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
                                <CheckCircleIcon className="size-4 mr-2" />
                                Accept Request
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

            {/* Accepted Requests Section */}
            {/* This section is removed as per the edit hint */}

            {/* No Notifications */}
            {incomingRequests.length === 0 && (
              <NoNotificationsFound />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
