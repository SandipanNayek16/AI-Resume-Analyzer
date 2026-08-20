import { usePuterStore } from "~/lib/puter";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

export const meta = () => ([
  { title: "ResumePilot — Sign In" },
  { name: "description", content: "Sign in to ResumePilot to analyze and optimize your resume." },
]);

const Auth = () => {
  const { isLoading, auth } = usePuterStore();
  const location = useLocation();
  const next = location.search.split("next=")[1] ?? "/";
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) navigate(next);
  }, [auth.isAuthenticated, next]);

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 rp-fade-up">
        <div className="size-10 rounded-xl rp-gradient-brand flex items-center justify-center">
          <span className="text-white font-bold">RP</span>
        </div>
        <span className="text-xl font-bold text-text-primary">
          Resume<span className="rp-text-gradient">Pilot</span>
        </span>
      </div>

      {/* Card */}
      <div className="rp-auth-card rp-scale-in relative z-10">
        <div className="flex flex-col items-center gap-2 text-center mb-8">
          <h2 className="text-text-primary">Welcome back</h2>
          <p className="text-text-secondary text-sm">
            Sign in with your Puter account to continue
          </p>
        </div>

        {/* Auth action */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="rp-btn rp-xl rp-primary opacity-70 pointer-events-none justify-center">
              <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing you in...</span>
            </div>
          ) : auth.isAuthenticated ? (
            <button className="rp-btn rp-xl rp-danger" onClick={auth.signOut}>
              Sign Out
            </button>
          ) : (
            <button className="rp-btn rp-xl rp-primary" onClick={auth.signIn}>
              Continue with Puter →
            </button>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 pt-6 border-t border-border-subtle">
          <p className="text-xs text-text-muted text-center leading-relaxed">
            ResumePilot uses Puter for authentication and secure cloud storage.
            Your resume data is private and stored in your own Puter account.
          </p>
        </div>
      </div>

      {/* Features list */}
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-text-muted animate-fade-in delay-300">
        {["ATS Score Analysis", "Job Matching", "AI Recommendations", "History Tracking"].map((f) => (
          <span key={f} className="flex items-center gap-1.5">
            <span className="text-success">✓</span> {f}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Auth;

