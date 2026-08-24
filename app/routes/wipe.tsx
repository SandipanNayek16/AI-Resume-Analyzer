import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { PageTransition } from "~/components/motion/PageTransition";
import { ScrollReveal } from "~/components/motion/ScrollReveal";
import { AlertTriangle, User, Database, ShieldAlert, CheckCircle2, HardDrive, FileText, ChevronRight } from "lucide-react";
import { cn } from "~/lib/utils";

export const meta = () => ([
  { title: "ResumeIQ — Settings" },
]);

const Settings = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FSItem[]>([]);
  const [kvKeys, setKvKeys] = useState<string[]>([]);
  const [wiping, setWiping] = useState(false);
  const [wiped, setWiped] = useState(false);
  const [wipeError, setWipeError] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

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
    setWiping(true);
    setWipeError(false);
    try {
      for (const file of files) {
        await fs.delete(file.path);
      }
      await kv.flush();
      setWiped(true);
      setFiles([]);
      setKvKeys([]);
      setIsModalOpen(false);
    } catch (e) {
      setWipeError(true);
    } finally {
      setWiping(false);
    }
  };
  
  const getDisplayName = () => {
      if (!auth.user) return "Account";
      if (auth.user.email) {
          return auth.user.email.split('@')[0].replace(/[^a-zA-Z]/g, ' ') || "Account";
      }
      return "Account";
  };

  if (isLoading) {
      return (
          <div className="max-w-4xl mx-auto py-12 px-6">
              <div className="animate-pulse space-y-8">
                  <div className="h-10 w-48 bg-slate-200 rounded-lg"></div>
                  <div className="h-40 w-full bg-slate-100 rounded-2xl"></div>
              </div>
          </div>
      );
  }

  const hasData = files.length > 0 || kvKeys.length > 0;

  return (
    <PageTransition className="max-w-[960px] mx-auto py-8 lg:py-12 px-4 sm:px-6">

      <ScrollReveal direction="up" distance={20} className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tighter">
          SETTINGS
        </h1>
        <p className="text-slate-500 mt-2 text-base font-medium">Manage your account, resume data, and privacy.</p>
      </ScrollReveal>

      <div className="flex flex-col gap-8">
          
        {/* Account Section */}
        <ScrollReveal delay={0.1} direction="up" distance={20}>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Account</h2>
          <div className="bg-white dark:bg-slate-900 border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 shadow-sm">
                <User size={24} strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg capitalize">{getDisplayName()}</h3>
                <p className="text-sm text-slate-500 font-medium">Puter Account connected</p>
                {auth.user?.email && (
                    <p className="text-xs text-slate-400 mt-0.5">{auth.user.email}</p>
                )}
              </div>
            </div>
            <button onClick={auth.signOut} className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-colors shadow-sm text-sm shrink-0 border border-border">
              Sign Out
            </button>
          </div>
        </ScrollReveal>

        {/* Data & Storage Section */}
        <ScrollReveal delay={0.15} direction="up" distance={20}>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Data & Storage</h2>
          <div className="bg-white dark:bg-slate-900 border border-border/80 rounded-2xl shadow-sm overflow-hidden">
             
             <div className="p-6 border-b border-border/60">
                 <p className="text-sm text-slate-500 mb-6 font-medium">
                     Your ResumeIQ data is securely stored in your connected Puter account.
                 </p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-border/50">
                        <div className="flex items-center gap-2 text-slate-500 mb-2">
                           <FileText size={16} />
                           <span className="text-xs font-bold uppercase tracking-widest">Resume Analyses</span>
                        </div>
                        <p className="text-3xl font-black font-mono text-foreground">{kvKeys.length}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-border/50">
                        <div className="flex items-center gap-2 text-slate-500 mb-2">
                           <HardDrive size={16} />
                           <span className="text-xs font-bold uppercase tracking-widest">Stored Files</span>
                        </div>
                        <p className="text-3xl font-black font-mono text-foreground">{files.length}</p>
                    </div>
                 </div>
             </div>

             <div className="p-2 bg-slate-50/50 dark:bg-slate-800/20">
                 <Link to="/resumes" className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                     <span className="font-semibold text-sm text-slate-700 dark:text-slate-300 group-hover:text-foreground">View My Resumes</span>
                     <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                 </Link>
             </div>
          </div>
        </ScrollReveal>

        {/* Privacy Section */}
        <ScrollReveal delay={0.2} direction="up" distance={20}>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Privacy</h2>
            <div className="bg-white dark:bg-slate-900 border border-border/80 rounded-2xl p-6 shadow-sm">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    Your resume data is used exclusively to provide analysis and AI features within ResumeIQ. 
                    All data is persisted in your personal Puter account storage. We do not use your resume data to train external AI models.
                </p>
            </div>
        </ScrollReveal>

        {/* Danger Zone */}
        <ScrollReveal delay={0.25} direction="up" distance={20}>
          <h2 className="text-sm font-bold text-rose-500 uppercase tracking-widest mb-4 px-1">Danger Zone</h2>
          <div className="bg-rose-50/30 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            
            <div className="flex-1">
                <h3 className="font-bold text-rose-600 dark:text-rose-500 text-lg mb-2 flex items-center gap-2">
                    <AlertTriangle size={18} strokeWidth={2.5} /> Delete all ResumeIQ data
                </h3>
                <p className="text-sm text-rose-600/80 dark:text-rose-400/80 font-medium max-w-xl">
                    This permanently removes your uploaded resumes, resume previews, analyses, and stored ResumeIQ data from your Puter account. This action cannot be undone.
                </p>
            </div>

            {wiped ? (
              <div className="bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-xl flex items-center gap-2 font-bold text-sm">
                 <CheckCircle2 size={18} /> ALL DATA DELETED
              </div>
            ) : wipeError ? (
               <div className="flex flex-col gap-2 items-end">
                  <span className="text-xs font-bold text-rose-600 bg-rose-100 px-3 py-1 rounded-full">DATA DELETION FAILED</span>
                  <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors shadow-sm text-sm">
                    Try Again
                  </button>
               </div>
            ) : (
                <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={!hasData}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all shadow-sm shadow-rose-600/20 text-sm whitespace-nowrap disabled:opacity-50 disabled:hover:bg-rose-600 disabled:cursor-not-allowed w-full md:w-auto text-center"
                >
                    Delete All Data
                </button>
            )}
          </div>
        </ScrollReveal>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !wiping && setIsModalOpen(false)} />
          <div className="relative z-10 grid w-full max-w-md gap-4 border border-border/50 bg-white dark:bg-slate-900 p-6 shadow-2xl rounded-2xl animate-fade-in">
              <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                      <h2 className="text-xl font-black text-rose-600 flex items-center gap-2">
                          <ShieldAlert size={24} /> DELETE ALL DATA?
                      </h2>
                      <p className="text-slate-500 font-medium text-sm">
                          This will permanently delete:
                      </p>
                  </div>

                  <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-4 border border-rose-100 dark:border-rose-900/50">
                      <ul className="text-sm font-semibold text-rose-700 dark:text-rose-400 space-y-2">
                          <li className="flex items-center gap-2"><CheckCircle2 size={16} /> Uploaded resumes</li>
                          <li className="flex items-center gap-2"><CheckCircle2 size={16} /> Resume analyses</li>
                          <li className="flex items-center gap-2"><CheckCircle2 size={16} /> Resume previews</li>
                          <li className="flex items-center gap-2"><CheckCircle2 size={16} /> Analysis history</li>
                      </ul>
                  </div>

                  <div className="flex flex-col gap-3">
                      <p className="text-sm font-bold text-foreground">
                          Type <span className="text-rose-600 bg-rose-100 dark:bg-rose-900/50 px-2 py-0.5 rounded font-mono select-none">DELETE</span> to confirm.
                      </p>
                      <input 
                          type="text" 
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          placeholder="DELETE"
                          disabled={wiping}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-lg font-bold disabled:opacity-50"
                      />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                      <button onClick={() => !wiping && setIsModalOpen(false)} disabled={wiping} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
                          Cancel
                      </button>
                      <button 
                          onClick={handleWipe}
                          disabled={confirmText !== "DELETE" || wiping}
                          className="px-5 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-600/50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center min-w-[140px]"
                      >
                          {wiping ? (
                              <>
                                  <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                  Deleting...
                              </>
                          ) : "Delete Everything"}
                      </button>
                  </div>
              </div>
          </div>
        </div>
      )}

    </PageTransition>
  );
};

export default Settings;
