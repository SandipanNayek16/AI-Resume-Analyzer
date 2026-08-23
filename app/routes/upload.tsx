import { type FormEvent, useEffect, useState } from "react";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";
import { useDropzone } from "react-dropzone";
import { cn, formatSize, parseAIResponse } from "~/lib/utils";

export const meta = () => ([
  { title: "ResumeIQ — Analyze Resume" },
  { name: "description", content: "Upload your resume and get an AI-powered ATS score and improvement tips." },
]);

type Stage = "upload" | "parsing" | "analyzing" | "scoring" | "rp-step-done" | "error";

const STAGES: { key: Stage; label: string; detail: string }[] = [
  { key: "upload",    label: "Uploading",       detail: "Uploading your PDF to secure storage..." },
  { key: "parsing",  label: "Converting",       detail: "Converting PDF to preview image..." },
  { key: "analyzing",label: "Analyzing",        detail: "AI is reading and understanding your resume..." },
  { key: "scoring",  label: "Scoring",          detail: "Calculating ATS compatibility and section scores..." },
  { key: "rp-step-done",     label: "Complete",         detail: "Analysis complete! Redirecting..." },
];

import { lazy, Suspense } from "react";
const Canvas = lazy(() => import("@react-three/fiber").then(m => ({ default: m.Canvas })));
const AIOrb = lazy(() => import("~/components/3d/AIOrb").then(m => ({ default: m.AIOrb })));
import { WebGLErrorBoundary } from "~/components/WebGLErrorBoundary";
import { PageTransition } from "~/components/motion/PageTransition";

const analyzingMessages = [
  "AI is reading and understanding your resume...",
  "Extracting your professional experience...",
  "Analyzing skill keywords and density...",
  "Evaluating ATS compatibility...",
  "Simulating recruiter parsing...",
];

function ProcessingView({ stage, error }: { stage: Stage; error?: string }) {
  const stageKeys = STAGES.map((s) => s.key);
  const currentIdx = stageKeys.indexOf(stage);
  const current = STAGES.find((s) => s.key === stage);

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (stage === "analyzing") {
      interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % analyzingMessages.length);
      }, 2500);
    } else {
      setMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [stage]);

  const displayDetail = stage === "analyzing" ? analyzingMessages[messageIndex] : current?.detail;

  return (
    <PageTransition className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      {/* Cinematic AI Orb */}
      <div className="w-full max-w-sm h-64 relative">
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-blue-600/50"><div className="size-8 rounded-full border-2 border-current border-t-blue-600 animate-spin" /></div>}>
          <Canvas camera={{ position: [0, 0, 4] }}>
            <ambientLight intensity={0.5} />
            <AIOrb scale={error ? 0.8 : 1.2} color={error ? "#ef4444" : "#06b6d4"} />
          </Canvas>
        </Suspense>
        
        {/* Scanning grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d40a_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40a_1px,transparent_1px)] bg-[size:14px_14px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />
      </div>

      {/* Stage Context */}
      <div className="text-center flex flex-col gap-2 relative z-10 max-w-sm w-full">
        {stage === "error" ? (
          <>
            <p className="text-2xl font-black text-error font-mono">ANALYSIS_FAILED</p>
            <p className="text-sm text-slate-500">{error}</p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-[0.2em] animate-pulse">
              {current?.label || "Processing"}
            </p>
            <p className="text-lg text-foreground font-light transition-all duration-300">
              {displayDetail}
            </p>
          </>
        )}
      </div>

      {/* Cinematic Timeline */}
      {stage !== "error" && (
        <div className="flex flex-col gap-4 w-full max-w-sm mt-4 relative z-10 p-6 rounded-2xl bg-white/50 backdrop-blur-md border border-border/50">
          {STAGES.slice(0, -1).map((s, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <div key={s.key} className={cn("flex items-center gap-4 transition-all duration-500", active ? "opacity-100 scale-105" : done ? "opacity-50" : "opacity-30")}>
                {done ? (
                  <div className="size-6 rounded-full bg-success/20 flex items-center justify-center text-success"><span className="text-xs font-bold">✓</span></div>
                ) : active ? (
                  <div className="size-6 rounded-full border-2 border-blue-600/30 border-t-primary animate-spin" />
                ) : (
                  <div className="size-6 rounded-full border-2 border-border" />
                )}
                <span className={cn("text-sm font-medium", active ? "text-foreground" : "text-slate-500")}>
                  {s.detail}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </PageTransition>
  );
}

function FileDropzone({ onFileSelect, file }: { onFileSelect: (f: File | null) => void; file: File | null }) {
  const [error, setError] = useState<string>("");

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles, fileRejections) => {
      setError("");
      if (fileRejections.length > 0) {
        const err = fileRejections[0].errors[0];
        if (err.code === "file-too-large") {
          setError("File is too large (max 20MB).");
        } else if (err.code === "file-invalid-type") {
          setError("Invalid file type. Please upload a PDF.");
        } else {
          setError(err.message);
        }
        onFileSelect(null);
        return;
      }
      onFileSelect(acceptedFiles[0] ?? null);
    },
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 20 * 1024 * 1024,
  });

  if (file) {
    return (
      <div className="p-4 rounded-xl bg-white border border-border/50 flex items-center justify-between shadow-sm transition-all">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-lg bg-blue-600/10 flex items-center justify-center flex-shrink-0 text-blue-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{formatSize(file.size)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onFileSelect(null); }}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
          aria-label="Remove file"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div {...getRootProps()} className={cn("relative group cursor-pointer w-full p-10 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center", isDragActive ? "border-blue-600 bg-blue-600/10 scale-[1.02]" : "border-border bg-slate-50/50 hover:bg-slate-100/50 hover:border-blue-600/30")}>
      <input {...getInputProps()} aria-label="Upload PDF resume" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.05),transparent)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="size-16 rounded-2xl bg-white border border-border group-hover:bg-blue-600/10 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors mb-4 shadow-sm">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      </div>
      <div className="flex flex-col gap-1.5 z-10">
        <p className="text-base font-semibold text-foreground group-hover:text-blue-600 transition-colors">
          {isDragActive ? "Drop to analyze" : "Click to upload or drag & drop"}
        </p>
        <p className="text-sm text-slate-500 font-light">PDF format up to 20MB</p>
      </div>
      {error && (
        <p className="absolute bottom-3 text-xs font-semibold text-error/90 bg-error/10 px-3 py-1 rounded-full z-20">
          {error}
        </p>
      )}
    </div>
  );
}

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState<Stage>("upload");
  const [errorMsg, setErrorMsg] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate("/auth?next=/upload");
  }, [isLoading, auth.isAuthenticated]);

  const handleAnalyze = async ({
    companyName, jobTitle, jobDescription, file,
  }: { companyName: string; jobTitle: string; jobDescription: string; file: File }) => {
    setProcessing(true);
    setStage("upload");

    // 1. Upload PDF
    const uploadedFile = await fs.upload(file);
    if (!uploadedFile) { setStage("error"); setErrorMsg("Failed to upload PDF. Please try again."); return; }

    // 2. Convert to image
    setStage("parsing");
    const imageResult = await convertPdfToImage(file);
    if (!imageResult.file) { setStage("error"); setErrorMsg(imageResult.error || "Failed to convert PDF to preview."); return; }

    const uploadedImage = await fs.upload(imageResult.file);
    if (!uploadedImage) { setStage("error"); setErrorMsg("Failed to upload preview image."); return; }

    // 3. Save initial record
    setStage("analyzing");
    const uuid = generateUUID();
    const data: Resume = {
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      companyName, jobTitle,
      feedback: {} as Feedback,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`resume:${uuid}`, JSON.stringify(data));

    // 4. AI analysis
    const aiResponse = await ai.feedback(
      uploadedImage.path,
      prepareInstructions({ jobTitle, jobDescription })
    );
    if (!aiResponse) { setStage("error"); setErrorMsg("AI analysis failed. This may be a temporary issue — please try again."); return; }

    const feedbackText = typeof aiResponse.message.content === "string"
      ? aiResponse.message.content
      : aiResponse.message.content[0].text;

    // 5. Parse and save
    setStage("scoring");
    let feedback: Feedback;
    try {
      feedback = parseAIResponse(feedbackText);
    } catch {
      setStage("error");
      setErrorMsg("Failed to parse AI response. The model did not return valid JSON. Please try again.");
      return;
    }

    data.feedback = feedback;
    await kv.set(`resume:${uuid}`, JSON.stringify(data));

    setStage("rp-step-done");
    setTimeout(() => navigate(`/resume/${uuid}`), 800);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    handleAnalyze({
      companyName: formData.get("company-name") as string || "",
      jobTitle: formData.get("job-title") as string || "",
      jobDescription: formData.get("job-description") as string || "",
      file,
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      {processing ? (
        <ProcessingView stage={stage} error={errorMsg} />
      ) : (
        <PageTransition className="w-full flex justify-center">
            <div className="w-full max-w-xl">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground">Analyze Resume</h1>
                <p className="text-slate-600 mt-1">Upload your resume to get instant AI feedback.</p>
              </div>

              <form
                className="bg-white/70 border border-border rounded-2xl p-8 shadow-sm backdrop-blur-xl flex flex-col gap-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!file) return;
                  const fd = new FormData(e.currentTarget);
                  handleAnalyze({
                    companyName: fd.get("company-name") as string,
                    jobTitle: fd.get("job-title") as string,
                    jobDescription: fd.get("job-description") as string,
                    file,
                  });
                }}
              >
                {/* Target Job (optional) */}
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Target Job (Optional — improves accuracy)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label htmlFor="company-name" className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                      <input
                        id="company-name"
                        name="company-name"
                        type="text"
                        className="w-full px-4 py-2 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                        placeholder="e.g. Google, Microsoft"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="job-title" className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                      <input
                        id="job-title"
                        name="job-title"
                        type="text"
                        className="w-full px-4 py-2 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                        placeholder="e.g. Frontend Engineer"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="job-description" className="block text-sm font-medium text-slate-700 mb-1">Job Description</label>
                    <textarea
                      id="job-description"
                      name="job-description"
                      rows={4}
                      className="w-full px-4 py-2 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all resize-none"
                      placeholder="Paste the job description here for a more targeted analysis..."
                    />
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* Upload */}
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Resume PDF
                  </p>
                  <FileDropzone file={file} onFileSelect={setFile} />
                </div>

                <button
                  type="submit"
                  disabled={!file}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all w-full disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                  Analyze Resume <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>

                <p className="text-xs text-slate-500 text-center">
                  Your resume is stored securely in your private Puter cloud.
                </p>
              </form>
            </div>
          </PageTransition>
        )}
    </div>
  );
};

export default Upload;
