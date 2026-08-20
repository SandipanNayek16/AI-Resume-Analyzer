import { Menu } from "lucide-react";
import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { auth } = usePuterStore();

  return (
    <header className="h-16 border-b border-border-default bg-surface-50 flex items-center justify-between px-4 md:hidden sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-300 transition-colors"
        >
          <Menu size={20} />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-brand-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">IQ</span>
          </div>
          <span className="font-bold text-text-primary">
            Resume<span className="text-brand-400">IQ</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center">
        {auth.isAuthenticated && (
          <div className="size-8 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
            {auth.user?.username?.[0]?.toUpperCase() ?? "U"}
          </div>
        )}
      </div>
    </header>
  );
}
