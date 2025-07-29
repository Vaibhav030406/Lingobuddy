import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon, HeartIcon, SparklesIcon } from "lucide-react";

import { capitialize } from "../lib/utils";
import { useThemeSelector } from "../hooks/useThemeSelector";

import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [pendingRequests, setPendingRequests] = useState(new Set());
  const { theme } = useThemeSelector();

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  // Debug logging for friends
  console.log("HomePage - friends data:", friends);
  console.log("HomePage - friends count:", friends.length);

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs = [], isLoading: loadingOutgoingReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation } = useMutation({
    mutationFn: sendFriendRequest,
    onMutate: async (recipientId) => {
      console.log("Sending friend request to:", recipientId);
      // Cancel ongoing queries to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["outgoingFriendReqs"] });
      // Optimistically update outgoingRequestsIds and pendingRequests
      setOutgoingRequestsIds((prev) => new Set([...prev, recipientId]));
      setPendingRequests((prev) => new Set([...prev, recipientId]));
      return { recipientId };
    },
    onSuccess: (data, recipientId) => {
      console.log("Friend request sent successfully:", data);
      // Remove from pending requests on success
      setPendingRequests((prev) => {
        const updated = new Set(prev);
        updated.delete(recipientId);
        return updated;
      });
      // Invalidate to sync with server
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
    },
    onError: (error, recipientId, context) => {
      console.error("Failed to send friend request:", error);
      // Rollback optimistic updates
      setOutgoingRequestsIds((prev) => {
        const updated = new Set(prev);
        updated.delete(context.recipientId);
        return updated;
      });
      setPendingRequests((prev) => {
        const updated = new Set(prev);
        updated.delete(context.recipientId);
        return updated;
      });
      console.error("Failed to send friend request:", error);
    },
  });

  useEffect(() => {
    if (!loadingOutgoingReqs && outgoingFriendReqs) {
      console.log("outgoingFriendReqs:", outgoingFriendReqs); // Debug API response
      
      // Extract user IDs from outgoing friend requests
      const outgoingIds = new Set();
      
      // Handle the correct data structure: { outgoingRequests: [...] }
      const requests = outgoingFriendReqs.outgoingRequests || outgoingFriendReqs;
      
      if (Array.isArray(requests)) {
        requests.forEach((req) => {
          // Handle different possible data structures
          const recipientId = req?.recipient?._id || req?.recipientId || req?.recipient;
          
          if (recipientId && req.status === "pending") {
            outgoingIds.add(recipientId);
            console.log("Added to outgoing requests:", recipientId); // Debug
          }
        });
      }
      
      console.log("Final outgoingIds Set:", Array.from(outgoingIds)); // Debug
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs, loadingOutgoingReqs]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Header Section */}
        <div className="hero bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 rounded-box p-8 border border-[var(--primary)]/20">
          <div className="hero-content text-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold text-[var(--text)] mb-4">
                Welcome to <span className="text-[var(--primary)]">LingoBuddy</span>
              </h1>
              <p className="text-lg opacity-80 mb-6">
                Connect with language learners worldwide and practice together
              </p>
              <Link to="/notifications" className="btn btn-primary btn-lg">
                <UsersIcon className="mr-2 size-5" />
                View Friend Requests
              </Link>
            </div>
          </div>
        </div>

        {/* Friends Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HeartIcon className="size-6 text-[var(--primary)]" />
              <h2 className="text-3xl font-bold text-[var(--text)]">Your Friends</h2>
            </div>
            <div className="badge badge-primary badge-lg">
              {friends.length} {friends.length === 1 ? 'Friend' : 'Friends'}
            </div>
          </div>

          {loadingFriends ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-[var(--primary)]" />
            </div>
          ) : friends.length === 0 ? (
            <NoFriendsFound />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {friends.map((friend) => (
                <FriendCard key={friend._id} friend={friend} />
              ))}
            </div>
          )}
        </section>

        {/* Recommended Users Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SparklesIcon className="size-6 text-[var(--primary)]" />
              <div>
                <h2 className="text-3xl font-bold text-[var(--text)]">Meet New Learners</h2>
                <p className="text-base opacity-70 mt-1">
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>
            </div>
          </div>

          {loadingUsers || loadingOutgoingReqs ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-[var(--primary)]" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-[var(--background)] border border-[var(--primary)]/20 p-8 text-center shadow-lg">
              <div className="card-body">
                <div className="mx-auto mb-4">
                  <SparklesIcon className="size-12 text-[var(--primary)]/50" />
                </div>
                <h3 className="font-semibold text-xl mb-2 text-[var(--text)]">No recommendations available</h3>
                <p className="text-[var(--text)]/70">
                  Check back later for new language partners!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
                const isCurrentlyPending = pendingRequests.has(user._id);
                
                // Debug logging for each user
                console.log(`User ${user.fullName} (${user._id}):`, {
                  hasRequestBeenSent,
                  isCurrentlyPending,
                  outgoingRequestsIds: Array.from(outgoingRequestsIds),
                  pendingRequests: Array.from(pendingRequests)
                });

                return (
                  <div
                    key={user._id}
                    className="card bg-[var(--background)] border border-[var(--primary)]/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/40"
                    style={{
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    <div className="card-body p-6 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="avatar">
                          <div 
                            className="w-16 h-16 rounded-full ring-2"
                            style={{ 
                              borderColor: `var(--primary)`,
                              borderWidth: '2px'
                            }}
                          >
                            <img 
                              src={user.profilePicture} 
                              alt={user.fullName}
                              className="object-cover rounded-full"
                            />
                          </div>
                        </div>

                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-[var(--text)]">{user.fullName}</h3>
                          {user.location && (
                            <div className="flex items-center text-sm opacity-70 mt-1">
                              <MapPinIcon className="size-4 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <div 
                          className="badge badge-outline"
                          style={{
                            borderColor: `var(--primary)`,
                            color: `var(--primary)`,
                            backgroundColor: `var(--primary)`,
                            color: 'white'
                          }}
                        >
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitialize(user.nativeLanguage)}
                        </div>
                        <div 
                          className="badge badge-outline"
                          style={{
                            borderColor: `var(--primary)`,
                            color: `var(--primary)`
                          }}
                        >
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitialize(user.learningLanguage)}
                        </div>
                      </div>

                      {user.bio && (
                        <p className="text-sm opacity-80 leading-relaxed text-[var(--text)]">{user.bio}</p>
                      )}

                      <button
                        className={`btn w-full transition-all duration-200 ${
                          hasRequestBeenSent || isCurrentlyPending
                            ? "btn-disabled opacity-50" 
                            : "hover:scale-105"
                        }`}
                        style={{
                          backgroundColor: hasRequestBeenSent || isCurrentlyPending
                            ? 'var(--background)' 
                            : 'var(--primary)',
                          color: hasRequestBeenSent || isCurrentlyPending
                            ? 'var(--text)' 
                            : 'white',
                          borderColor: 'var(--primary)',
                          borderWidth: '1px'
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
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-2" />
                            Send Friend Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;