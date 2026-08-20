import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
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
        <script src="https://js.puter.com/v2/"></script>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// Separate client-only component to safely call hooks
function PuterInitializer() {
  const { init } = usePuterStore();
  useEffect(() => {
    init();
  }, []);
  return null;
}

export default function App() {
  return (
    <>
      <PuterInitializer />
      <Outlet />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>{message}</h1>
      <p style={{ color: "#666" }}>{details}</p>
      {stack && (
        <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.8rem", marginTop: "1rem", color: "#999" }}>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
