import useAuthUser from "../hooks/useAuthUser";
import { useLocation, Link } from "react-router-dom";
import { Languages, HomeIcon, BellIcon, UsersIcon } from "lucide-react";
import { useThemeSelector } from "../hooks/useThemeSelector";
import ThemeSelector from "./ThemeSelector";
import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "../lib/api";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const { theme } = useThemeSelector();

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    enabled: !!authUser,
    staleTime: 1000 * 60, // 1 minute
  });

  const incomingRequestsCount = friendRequests?.incomingRequests?.length || 0;

  return (
    <aside className="w-64 bg-[var(--background)] border-r border-[var(--primary)] hidden lg:flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-[var(--primary)]">
        <Link to="/" className="flex items-center gap-2">
          <Languages className="w-8 h-8 text-[var(--primary)]" />
          <span className="text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--text)] tracking-wider">
            LingoBuddy
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            currentPath === "/" 
              ? "bg-[var(--primary)] text-white" 
              : "text-[var(--text)] hover:bg-[var(--primary)]/10"
          }`}
        >
          <HomeIcon className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <Link
          to="/friends"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            currentPath === "/friends" 
              ? "bg-[var(--primary)] text-white" 
              : "text-[var(--text)] hover:bg-[var(--primary)]/10"
          }`}
        >
          <UsersIcon className="w-5 h-5" />
          <span>Friends</span>
        </Link>

        <Link
          to="/notifications"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative ${
            currentPath === "/notifications" 
              ? "bg-[var(--primary)] text-white" 
              : "text-[var(--text)] hover:bg-[var(--primary)]/10"
          }`}
        >
          <BellIcon className="w-5 h-5" />
          <span>Notifications</span>
          {incomingRequestsCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </Link>
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-[var(--primary)] mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img 
              src={authUser?.profilePicture} 
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-[var(--text)] truncate">
              {authUser?.fullName}
            </p>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;