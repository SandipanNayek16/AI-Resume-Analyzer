import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";
import Navbar from "~/components/Navbar";

export const meta = () => ([
  { title: "ResumePilot — Settings" },
]);

const Settings = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FSItem[]>([]);
  const [kvKeys, setKvKeys] = useState<string[]>([]);
  const [wiping, setWiping] = useState(false);
  const [wiped, setWiped] = useState(false);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate("/auth?next=/settings");
  }, [isLoading]);

  const loadData = async () => {
    try {
      const f = (await fs.readDir("./")) as FSItem[];
      setFiles(f || []);
      const k = (await kv.list("resume:*")) as string[];
      setKvKeys(k || []);
    } catch {}
  };

  useEffect(() => { loadData(); }, []);

  const handleWipe = async () => {
    if (!confirm("Are you sure? This will delete ALL resume files and analyses. This cannot be undone.")) return;
    setWiping(true);
    try {
      for (const file of files) {
        await fs.delete(file.path);
      }
      await kv.flush();
      setWiped(true);
      setFiles([]);
      setKvKeys([]);
    } finally {
      setWiping(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-0">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="page-header rp-fade-up">
          <h2 className="text-text-primary text-2xl font-bold">Settings</h2>
          <p className="text-text-secondary text-sm">Manage your account and data.</p>
        </div>

        {/* Account */}
        <div className="card mb-5 rp-fade-up delay-100">
          <h3 className="font-semibold text-text-primary mb-4">Account</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full rp-gradient-brand flex items-center justify-center">
                <span className="text-white font-bold">
                  {auth.user?.username?.[0]?.toUpperCase() ?? "U"}
                </span>
              </div>
              <div>
                <p className="font-medium text-text-primary text-sm">{auth.user?.username}</p>
                <p className="text-xs text-text-muted">Puter Account</p>
              </div>
            </div>
            <button onClick={auth.signOut} className="rp-btn rp-sm rp-secondary text-xs">
              Sign Out
            </button>
          </div>
        </div>

        {/* Data stats */}
        <div className="card mb-5 rp-fade-up delay-200">
          <h3 className="font-semibold text-text-primary mb-4">Storage</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-text-primary">{kvKeys.length}</p>
              <p className="text-xs text-text-muted mt-1">Resume analyses</p>
            </div>
            <div className="bg-surface-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-text-primary">{files.length}</p>
              <p className="text-xs text-text-muted mt-1">Stored files</p>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rp-card border-error/20 bg-error/5 rp-fade-up delay-300">
          <h3 className="font-semibold text-error mb-2">Danger Zone</h3>
          <p className="text-sm text-text-secondary mb-4">
            Wipe all ResumePilot data from your Puter account. This deletes all uploaded resumes,
            preview images, and analysis history. This action cannot be undone.
          </p>
          {wiped ? (
            <div className="text-sm text-success font-medium">
              ✓ All data has been cleared successfully.
            </div>
          ) : (
            <button
              onClick={handleWipe}
              disabled={wiping || (files.length === 0 && kvKeys.length === 0)}
              className="rp-btn rp-md rp-danger"
            >
              {wiping ? (
                <>
                  <span className="size-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                  Clearing data...
                </>
              ) : "Clear All Data"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

