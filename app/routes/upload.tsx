import { type FormEvent, useEffect, useState } from "react";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";
import { useDropzone } from "react-dropzone";
import { cn, formatSize } from "~/lib/utils";

export const meta = () => ([
  { title: "ResumePilot — Analyze Resume" },
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

function ProcessingView({ stage, error }: { stage: Stage; error?: string }) {
  const stageKeys = STAGES.map((s) => s.key);
  const currentIdx = stageKeys.indexOf(stage);
  const current = STAGES.find((s) => s.key === stage);

  return (
    <div className="flex flex-col items-center justify-center gap-10 py-16 rp-fade-in">
      {/* Animated logo pulse */}
      <div className="relative">
        <div className="size-20 rounded-2xl rp-gradient-brand flex items-center justify-center shadow-lg rp-glow">
          <span className="text-white text-3xl font-bold">RP</span>
        </div>
        {stage !== "error" && (
          <div className="absolute inset-0 size-20 rounded-2xl rp-gradient-brand opacity-30 animate-ping" />
        )}
      </div>

      {/* Stage label */}
      <div className="text-center flex flex-col gap-2">
        {stage === "error" ? (
          <>
            <p className="text-lg font-semibold text-error">Analysis Failed</p>
            <p className="text-sm text-text-muted">{error}</p>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold text-text-primary">{current?.label}</p>
            <p className="text-sm text-text-secondary">{current?.detail}</p>
          </>
        )}
      </div>

      {/* Step indicators */}
      {stage !== "error" && (
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {STAGES.slice(0, -1).map((s, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <div key={s.key} className="flex items-center gap-3">
                <div className={cn("rp-step-dot", done ? "rp-step-done" : active ? "rp-step-active" : "rp-step-pending")} />
                <span className={cn(
                  "text-sm",
                  done ? "text-success" : active ? "text-text-primary font-medium" : "text-text-muted"
                )}>
                  {s.label}
                </span>
                {done && <span className="text-success text-xs ml-auto">✓</span>}
                {active && (
                  <span className="ml-auto">
                    <span className="size-3 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin inline-block" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FileDropzone({ onFileSelect, file }: { onFileSelect: (f: File | null) => void; file: File | null }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => onFileSelect(files[0] ?? null),
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 20 * 1024 * 1024,
  });

  if (file) {
    return (
      <div className="rp-upload-selected">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-error/15 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">📄</span>
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
            <p className="text-xs text-text-muted">{formatSize(file.size)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onFileSelect(null); }}
          className="rp-btn rp-sm rp-ghost text-text-muted"
          aria-label="Remove file"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div {...getRootProps()} className={cn("rp-upload-zone", isDragActive && "rp-drag-active")}>
      <input {...getInputProps()} aria-label="Upload PDF resume" />
      <div className="size-14 rounded-2xl bg-surface-400 flex items-center justify-center text-2xl">
        📄
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-text-primary">
          {isDragActive ? "Drop it here!" : "Click to upload or drag & drop"}
        </p>
        <p className="text-xs text-text-muted">PDF only · Max 20MB</p>
      </div>
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
    const uploadedFile = await fs.upload([file]);
    if (!uploadedFile) { setStage("error"); setErrorMsg("Failed to upload PDF. Please try again."); return; }

    // 2. Convert to image
    setStage("parsing");
    const imageResult = await convertPdfToImage(file);
    if (!imageResult.file) { setStage("error"); setErrorMsg("Failed to convert PDF to preview. The file may be corrupted."); return; }

    const uploadedImage = await fs.upload([imageResult.file]);
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
      uploadedFile.path,
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
      feedback = JSON.parse(feedbackText);
    } catch {
      setStage("error");
      setErrorMsg("Failed to parse AI response. Please try again.");
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
        <div className="rp-fade-up">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-xs font-medium mb-4">
              <span className="size-2 rounded-full bg-brand-400 animate-pulse" />
              AI Analysis Engine
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-3">Analyze Your Resume</h1>
            <p className="text-text-secondary max-w-md">
              Upload your PDF resume and optionally add a job description for a targeted ATS score and improvement tips.
            </p>
          </div>

            {/* Form card */}
            <div className="card">
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Target Job (optional) */}
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Target Job (Optional — improves accuracy)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label htmlFor="company-name" className="rp-label">Company Name</label>
                      <input
                        id="company-name"
                        name="company-name"
                        type="text"
                        className="rp-input"
                        placeholder="e.g. Google, Microsoft"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="job-title" className="rp-label">Job Title</label>
                      <input
                        id="job-title"
                        name="job-title"
                        type="text"
                        className="rp-input"
                        placeholder="e.g. Frontend Engineer"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="job-description" className="rp-label">Job Description</label>
                    <textarea
                      id="job-description"
                      name="job-description"
                      rows={4}
                      className="rp-input resize-none"
                      placeholder="Paste the job description here for a more targeted analysis..."
                    />
                  </div>
                </div>

                <div className="border-t border-border-subtle" />

                {/* Upload */}
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Resume PDF
                  </p>
                  <FileDropzone file={file} onFileSelect={setFile} />
                </div>

                <button
                  type="submit"
                  disabled={!file}
                  className="rp-btn rp-lg rp-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Analyze Resume →
                </button>

                <p className="text-xs text-text-muted text-center">
                  Your resume is stored securely in your private Puter cloud.
                </p>
              </form>
            </div>
          </div>
        )}
    </div>
  );
};

export default Upload;
