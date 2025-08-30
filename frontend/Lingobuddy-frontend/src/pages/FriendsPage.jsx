// frontend/Lingobuddy-frontend/src/pages/FriendsPage.jsx
import { useQuery } from "@tanstack/react-query"
import { HeartIcon } from "lucide-react"

import FriendCard from "../components/FriendCard"
import NoFriendsFound from "../components/NoFriendsFound"
import { getUserFriends } from "../lib/api"
import { useThemeSelector } from "../hooks/useThemeSelector"

const FriendsPage = () => {
  const { theme } = useThemeSelector()
  
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  })

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] transition-all duration-500">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Header Section */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="flex items-center justify-center gap-3 mb-4 group">
            <HeartIcon className="size-8 text-[var(--primary)] group-hover:scale-125 transition-transform duration-300 animate-float" />
            <h1 className="text-3xl font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors duration-300">
              Your Friends
            </h1>
          </div>
          <p className="text-sm opacity-70 animate-fade-in-delay">
            Connect with your language partners
          </p>
        </div>

        {/* Friends List */}
        <section className="space-y-6 animate-slide-up-delay-1">
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
      </div>
    </div>
  )
}

export default FriendsPage;