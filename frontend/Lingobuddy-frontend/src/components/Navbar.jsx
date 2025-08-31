import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, Languages, User, Settings, ChevronDown } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "../lib/api";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const navigate = useNavigate();
  const isChatPage = location.pathname?.startsWith("/chat");
  const { logoutMutation } = useLogout();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    enabled: !!authUser,
    staleTime: 1000 * 60, // 1 minute
  });

  const incomingRequestsCount = friendRequests?.incomingRequests?.length || 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEditProfile = () => {
    setIsProfileDropdownOpen(false);
    navigate("/edit-profile");
  };

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

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-[var(--primary)]/10 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--primary)]/20 group-hover:border-[var(--primary)]/40 transition-colors">
                  <img 
                    src={authUser?.profilePicture} 
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <ChevronDown 
                  className={`h-4 w-4 text-[var(--text)] opacity-70 transition-transform duration-200 ${
                    isProfileDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--background)] border border-[var(--primary)]/20 rounded-xl shadow-lg backdrop-blur-sm overflow-hidden animate-slide-down z-50">
                  <div className="p-3 border-b border-[var(--primary)]/10">
                    <p className="text-sm font-medium text-[var(--text)]">{authUser?.fullName}</p>
                    <p className="text-xs text-[var(--text)]/60">{authUser?.email}</p>
                  </div>
                  
                  <div className="p-1">
                    <button
                      onClick={handleEditProfile}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors group"
                    >
                      <Settings className="h-4 w-4 opacity-70 group-hover:text-[var(--primary)] transition-colors" />
                      Edit Profile
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        logoutMutation();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text)] hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors group"
                    >
                      <LogOutIcon className="h-4 w-4 opacity-70" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;