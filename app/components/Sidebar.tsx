import { Link, useLocation } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { cn } from "~/lib/utils";
import { 
  LayoutDashboard, 
  Upload, 
  Briefcase, 
  FileText, 
  History, 
  MessageSquare, 
  Settings,
  LogOut
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analyze", href: "/upload", icon: Upload },
  { label: "Job Match", href: "/job-match", icon: Briefcase },
  { label: "My Resumes", href: "/resumes", icon: FileText },
  { label: "AI Copilot", href: "/copilot", icon: MessageSquare },
];

export function Sidebar() {
  const { auth } = usePuterStore();
  const location = useLocation();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border-default bg-surface-50 flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-border-default">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <span className="text-white text-sm font-bold">IQ</span>
          </div>
          <span className="text-lg font-bold text-text-primary tracking-tight">
            Resume<span className="text-brand-400">IQ</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
        <div className="px-2 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
          Menu
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-500/10 text-brand-400"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-300"
              )}
            >
              <Icon size={18} className={isActive ? "text-brand-400" : "text-text-muted"} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Footer / User */}
      <div className="p-4 border-t border-border-default">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-2",
            location.pathname === "/settings"
              ? "bg-brand-500/10 text-brand-400"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-300"
          )}
        >
          <Settings size={18} className="text-text-muted" />
          Settings
        </Link>
        <button
          onClick={() => auth.signOut()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-error hover:bg-error/10 transition-colors"
        >
          <LogOut size={18} className="text-text-muted" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
