import { Link, useLocation, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { cn } from "~/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: "⊞" },
  { label: "Analyze", href: "/upload", icon: "⬆" },
  { label: "History", href: "/history", icon: "⊙" },
  { label: "Settings", href: "/settings", icon: "⚙" },
];

export default function Navbar() {
  const { auth, isLoading } = usePuterStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleAuth = async () => {
    if (auth.isAuthenticated) {
      await auth.signOut();
      navigate("/");
    } else {
      navigate(`/auth?next=${location.pathname}`);
    }
  };

  return (
    <nav className="rp-navbar">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 flex-shrink-0">
        <div className="size-10 rounded-2xl bg-blue-500 flex items-center justify-center shadow-[0_4px_24px_-4px_rgba(59,130,246,0.5)]">
          <span className="text-white text-base font-black tracking-tight">IQ</span>
        </div>
        <span className="text-2xl font-black text-foreground tracking-tighter">
          Resume<span className="text-blue-500">IQ</span>
        </span>
      </Link>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-1">
        {auth.isAuthenticated && NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
              location.pathname === item.href
                ? "bg-brand-500/15 text-brand-400"
                : "text-text-blue-500 hover:text-text-blue-600 hover:bg-surface-300"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {auth.isAuthenticated && (
          <Link
            to="/upload"
            className="hidden sm:flex rp-btn rp-md rp-primary text-sm"
          >
            <span>+ Analyze Resume</span>
          </Link>
        )}

        {/* User / Auth */}
        {isLoading ? (
          <div className="size-8 rounded-full skeleton" />
        ) : auth.isAuthenticated ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleAuth}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-text-blue-500 hover:text-text-blue-600 hover:bg-surface-300 transition-all cursor-pointer"
            >
              <div className="size-6 rounded-full rp-gradient-brand flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {auth.user?.username?.[0]?.toUpperCase() ?? "U"}
                </span>
              </div>
              <span className="hidden sm:block max-w-[100px] truncate">
                {auth.user?.username}
              </span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleAuth}
            className="rp-btn rp-md rp-primary text-sm"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}

