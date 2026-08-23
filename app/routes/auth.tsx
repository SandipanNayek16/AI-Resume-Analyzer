import { usePuterStore } from "~/lib/puter";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

export const meta = () => ([
  { title: "ResumeIQ — Sign In" },
  { name: "description", content: "Sign in to ResumeIQ to analyze and optimize your resume." },
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 rp-fade-up">
        <img src="/logo.png" alt="ResumeIQ Logo" className="size-10 object-contain drop-shadow-sm" />
        <span className="text-2xl font-black text-foreground tracking-tighter">
          Resume<span className="text-blue-500">IQ</span>
        </span>
      </div>

      {/* Card */}
      <div className="w-full max-w-md border border-border bg-white/70 shadow-xl backdrop-blur-xl rounded-2xl p-8 rp-scale-in relative z-10">
        <div className="flex flex-col items-center gap-2 text-center mb-8">
          <h2 className="text-foreground text-2xl font-bold">Welcome back</h2>
          <p className="text-slate-500 text-sm">
            Sign in with your Puter account to continue
          </p>
        </div>

        {/* Auth action */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex items-center gap-2 px-8 py-4 bg-blue-600/70 text-white rounded-xl text-lg font-semibold justify-center pointer-events-none">
              <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing you in...</span>
            </div>
          ) : auth.isAuthenticated ? (
            <button className="px-8 py-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-lg font-semibold hover:bg-red-100 transition-colors" onClick={auth.signOut}>
              Sign Out
            </button>
          ) : (
            <button className="group relative px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold overflow-hidden transition-all hover:scale-105 shadow-lg hover:shadow-blue-600/20" onClick={auth.signIn}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity" />
              <span className="relative z-10">Continue with Puter →</span>
            </button>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 pt-6 border-t border-border-subtle">
          <p className="text-xs text-slate-500 text-center leading-relaxed">
            ResumeIQ uses Puter for authentication and secure cloud storage.
            Your resume data is private and stored in your own Puter account.
          </p>
        </div>
      </div>

      {/* Features list */}
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-slate-500 animate-fade-in delay-300 relative z-10">
        {["ATS Score Analysis", "Job Matching", "AI Recommendations", "History Tracking"].map((f) => (
          <span key={f} className="flex items-center gap-1.5">
            <span className="text-success font-bold">✓</span> {f}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Auth;

