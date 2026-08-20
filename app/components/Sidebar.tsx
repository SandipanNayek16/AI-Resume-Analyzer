import { Link, useLocation } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
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
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1 relative z-10">
        <div className="px-2 mb-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
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
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 bg-brand-500/10 rounded-lg border border-brand-500/20"
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              
              <div className="relative z-10 flex items-center gap-3">
                <Icon 
                  size={18} 
                  className={cn(
                    "transition-colors",
                    isActive ? "text-brand-400" : "text-text-muted group-hover:text-brand-400/70"
                  )} 
                />
                <span className="relative z-10">{item.label}</span>
              </div>
              
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-brand-400 rounded-r-full shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / User */}
      <div className="p-4 border-t border-border-default/50 relative z-10">
        <Link
          to="/settings"
          className={cn(
            "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1",
            location.pathname === "/settings"
              ? "text-text-primary"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          {location.pathname === "/settings" && (
            <motion.div
              layoutId="sidebar-active-indicator"
              className="absolute inset-0 bg-brand-500/10 rounded-lg border border-brand-500/20"
              initial={false}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
          <div className="relative z-10 flex items-center gap-3">
            <Settings size={18} className={cn("transition-colors", location.pathname === "/settings" ? "text-brand-400" : "text-text-muted group-hover:text-text-secondary")} />
            <span className="relative z-10">Settings</span>
          </div>
        </Link>
        <button
          onClick={() => auth.signOut()}
          className="group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-error transition-colors"
        >
          <div className="absolute inset-0 rounded-lg bg-error/0 group-hover:bg-error/10 transition-colors" />
          <div className="relative z-10 flex items-center gap-3 w-full">
            <LogOut size={18} className="text-text-muted group-hover:text-error transition-colors" />
            <span>Sign Out</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
