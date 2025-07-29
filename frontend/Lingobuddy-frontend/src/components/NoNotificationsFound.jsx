import { BellIcon, SparklesIcon } from "lucide-react";

function NoNotificationsFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
          <BellIcon className="size-10 text-[var(--primary)]" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center">
          <SparklesIcon className="size-4 text-white" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-[var(--text)] mb-3">No pending friend requests</h3>
      <p className="text-[var(--text)]/70 max-w-md leading-relaxed">
        You don't have any pending friend requests right now. 
        When someone sends you a friend request, it will appear here for you to accept or decline.
      </p>
    </div>
  );
}

export default NoNotificationsFound;