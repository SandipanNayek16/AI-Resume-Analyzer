import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { usePuterStore } from "~/lib/puter";
import { useEffect } from "react";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <script src="https://js.puter.com/v2/" id="puter.js"></script>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

import { GlowBackground } from "~/components/visual/GlowBackground";

// Separate client-only component to safely call hooks
function PuterInitializer() {
  const { init } = usePuterStore();
  useEffect(() => {
    init();
  }, []);
  return null;
}

import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router";

export default function App() {
  const location = useLocation();
  return (
    <GlowBackground>
      <PuterInitializer />
      <AnimatePresence mode="wait">
        <Outlet key={location.pathname} />
      </AnimatePresence>
    </GlowBackground>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "A fatal error occurred.";
  let details = "The application encountered an unexpected state and could not recover.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "Signal Lost" : "System Error";
    details =
      error.status === 404
        ? "The requested intelligence vector could not be located in our database."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center font-sans text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.05),transparent)] pointer-events-none" />
      
      <div className="size-20 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(220,38,38,0.2)]">
        <span className="text-3xl">⚠️</span>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
        {message}
      </h1>
      
      <p className="text-lg text-slate-400 max-w-lg mb-10 leading-relaxed font-light">
        {details}
      </p>

      {stack && (
        <div className="w-full max-w-3xl mb-10 text-left bg-black/40 border border-red-900/50 rounded-xl p-6 overflow-auto">
          <pre className="text-xs text-red-400 font-mono leading-relaxed">
            {stack}
          </pre>
        </div>
      )}

      <button
        onClick={() => window.location.href = '/dashboard'}
        className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
      >
        Reboot System
      </button>
    </div>
  );
}
