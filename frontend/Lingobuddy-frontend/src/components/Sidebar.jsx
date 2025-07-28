import useAuthUser from "../hooks/useAuthUser";
import { useLocation, Link } from "react-router-dom";
import { Dessert, HomeIcon, BellIcon, UsersIcon } from "lucide-react";

const Sidebar = () => {
    const { authUser } = useAuthUser();
    const location = useLocation();
    const currentPath = location.pathname;


  return (
   <aside className="w-64 bg-[var(--background)] border-r border-[var(--primary)] hidden lg:flex flex-col h-screen sticky top-0">
  <div className="p-5 border-b border-[var(--primary)]">
    <Link to="/" className="flex items-center gap-2.5">
      <Dessert className="size-9 text-[var(--primary)]" />
      <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--text)] tracking-wider">
        LingoBuddy
      </span>
    </Link>
  </div>

  <nav className="flex-1 p-4 space-y-1">
    <Link
      to="/"
      className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
        currentPath === "/" ? "bg-[var(--primary)] text-white" : "text-[var(--text)]"
      }`}
    >
      <HomeIcon className="size-5 opacity-70" />
      <span>Home</span>
    </Link>

    <Link
      to="/friends"
      className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
        currentPath === "/friends" ? "bg-[var(--primary)] text-white" : "text-[var(--text)]"
      }`}
    >
      <UsersIcon className="size-5 opacity-70" />
      <span>Friends</span>
    </Link>

    <Link
      to="/notifications"
      className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
        currentPath === "/notifications" ? "bg-[var(--primary)] text-white" : "text-[var(--text)]"
      }`}
    >
      <BellIcon className="size-5 opacity-70" />
      <span>Notifications</span>
    </Link>
  </nav>

  <div className="p-4 border-t border-[var(--primary)] mt-auto">
    <div className="flex items-center gap-3">
      <div className="avatar">
        <div className="w-10 rounded-full">
          <img src={authUser?.profilePicture} alt="User Avatar" />
        </div>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm text-[var(--text)]">{authUser?.fullName}</p>
        <p className="text-xs text-success flex items-center gap-1">
          <span className="size-2 rounded-full bg-success inline-block" />
          Online
        </p>
      </div>
    </div>
  </div>
</aside>

  )
}

export default Sidebar
