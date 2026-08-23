import { Menu } from "lucide-react";
import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { auth } = usePuterStore();

  return (
    <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-4 md:hidden sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-md text-slate-600 hover:text-foreground hover:bg-slate-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <div className="size-7 rounded-xl bg-blue-500 flex items-center justify-center shadow-[0_2px_12px_-2px_rgba(59,130,246,0.5)]">
            <span className="text-white text-xs font-black tracking-tight">IQ</span>
          </div>
          <span className="text-lg font-black text-foreground tracking-tighter">
            Resume<span className="text-blue-500">IQ</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center">
        {auth.isAuthenticated && (
          <div className="size-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
            {auth.user?.username?.[0]?.toUpperCase() ?? "U"}
          </div>
        )}
      </div>
    </header>
  );
}
