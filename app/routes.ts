import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/auth", "routes/auth.tsx"),
  layout("routes/dashboard-layout.tsx", [
    route("/dashboard", "routes/dashboard.tsx"),
    route("/upload", "routes/upload.tsx"),
    route("/resume/:id", "routes/resume.tsx"),
    route("/history", "routes/history.tsx"),
    route("/job-match", "routes/job-match.tsx"),
    route("/copilot", "routes/copilot.tsx"),
    route("/resumes", "routes/resumes.tsx"),
    route("/settings", "routes/wipe.tsx"),
  ]),
] satisfies RouteConfig;
