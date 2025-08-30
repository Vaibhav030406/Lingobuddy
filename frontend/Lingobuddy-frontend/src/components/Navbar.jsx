import { Link, useLocation } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, Languages } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "../lib/api";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const { logoutMutation } = useLogout();

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    enabled: !!authUser,
    staleTime: 1000 * 60, // 1 minute
  });

  const incomingRequestsCount = friendRequests?.incomingRequests?.length || 0;

  return (
    <nav className="bg-[var(--background)] border-b border-[var(--primary)] sticky top-0 z-30 h-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo - only show on chat pages */}
          {isChatPage && (
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <Languages className="w-8 h-8 text-[var(--primary)]" />
                <span className="text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--text)] tracking-wider">
                  LingoBuddy
                </span>
              </Link>
            </div>
          )}

          {/* Right side controls */}
          <div className="flex items-center gap-3 ml-auto">
            <Link to="/notifications" className="relative">
              <button className="p-2 rounded-full hover:bg-[var(--primary)]/10 transition-colors">
                <BellIcon className="h-5 w-5 text-[var(--text)] opacity-70" />
              </button>
              {incomingRequestsCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </Link>

            <ThemeSelector />

            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img 
                src={authUser?.profilePicture} 
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>

            <button 
              className="p-2 rounded-full hover:bg-red-500/10 transition-colors"
              onClick={logoutMutation}
            >
              <LogOutIcon className="h-5 w-5 text-[var(--text)] opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;