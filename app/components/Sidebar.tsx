import { Link, useLocation } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Upload, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Settings,
  LogOut,
  User
} from "lucide-react";

const WORKSPACE_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analyze", href: "/upload", icon: Upload },
  { label: "Job Match", href: "/job-match", icon: Briefcase },
  { label: "My Resumes", href: "/resumes", icon: FileText },
  { label: "AI Copilot", href: "/copilot", icon: MessageSquare },
];

export function Sidebar() {
  const { auth } = usePuterStore();
  const location = useLocation();

  const user = auth.user;

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border/80 bg-background flex flex-col h-screen sticky top-0">
      
      {/* Brand Header */}
      <div className="h-[72px] flex items-center px-6 border-b border-border/60 shrink-0">
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <img src="/logo.png" alt="ResumeIQ Logo" className="size-8 object-contain" />
          <span className="text-xl font-black text-foreground tracking-tighter">
            Resume<span className="text-blue-600">IQ</span>
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1 relative z-10 scrollbar-thin">
        <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Workspace
        </div>
        
        {WORKSPACE_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "text-blue-700 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-blue-600 rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <div className="relative z-10 flex items-center gap-3 w-full">
                <Icon 
                  size={18} 
                  strokeWidth={2}
                  className={cn(
                    "transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                  )} 
                />
                <span className="relative z-10">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer Area */}
      <div className="p-4 border-t border-border/60 relative z-10 flex flex-col gap-1 bg-slate-50/50 dark:bg-slate-900/20 shrink-0">
        
        {/* User Profile */}
        {user && (
          <div className="px-3 py-3 mb-2 flex items-center gap-3 rounded-xl border border-border/80 bg-white dark:bg-slate-900 shadow-sm">
            <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800">
               <User size={14} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col min-w-0">
               <span className="text-sm font-bold text-foreground truncate capitalize">
                 {user.email ? user.email.split('@')[0].replace(/[^a-zA-Z]/g, ' ') : "Account"}
               </span>
               <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest truncate">Account</span>
            </div>
          </div>
        )}

        <div className="px-3 mb-2 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          System
        </div>

        <Link
          to="/settings"
          className={cn(
            "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            location.pathname === "/settings"
              ? "text-blue-700 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          )}
        >
          {location.pathname === "/settings" && (
            <motion.div
              layoutId="sidebar-active-indicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-blue-600 rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"
              initial={false}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <div className="relative z-10 flex items-center gap-3">
            <Settings 
              size={18} 
              strokeWidth={2}
              className={cn("transition-transform duration-200 group-hover:rotate-45", location.pathname === "/settings" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300")} 
            />
            <span className="relative z-10">Settings</span>
          </div>
        </Link>

        <button
          onClick={() => auth.signOut()}
          className="group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
        >
          <div className="relative z-10 flex items-center gap-3 w-full">
            <LogOut 
              size={18} 
              strokeWidth={2}
              className="text-slate-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-transform duration-200 group-hover:-translate-x-1" 
            />
            <span>Sign Out</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
