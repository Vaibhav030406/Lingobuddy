import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, Dessert } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");


  const { logoutMutation } = useLogout();

  return (
    <nav className="bg-[var(--background)] border-b border-[var(--primary)] sticky top-0 z-30 h-16 flex items-center">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-end w-full">
      {isChatPage && (
        <div className="pl-5">
          <Link to="/" className="flex items-center gap-2.5">
            <Dessert className="size-9 text-[var(--primary)]" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--text)] tracking-wider">
              LoginBuddy
            </span>
          </Link>
        </div>
      )}

      <div className="flex items-center gap-3 sm:gap-4 ml-auto">
        <Link to={"/notifications"}>
          <button className="btn btn-ghost btn-circle">
            <BellIcon className="h-6 w-6 text-[var(--text)] opacity-70" />
          </button>
        </Link>
      </div>

      <ThemeSelector />

      <div className="avatar">
        <div className="w-9 rounded-full">
          <img src={authUser?.profilePicture} alt="User Avatar" />
        </div>
      </div>

      <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
        <LogOutIcon className="h-6 w-6 text-[var(--text)] opacity-70" />
      </button>
    </div>
  </div>
</nav>

  );
};
export default Navbar;