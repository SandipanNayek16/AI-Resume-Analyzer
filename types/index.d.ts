// ============================================================
// RESUME & FEEDBACK TYPES — ResumePilot
// ============================================================

interface Resume {
  id: string;
  companyName?: string;
  jobTitle?: string;
  imagePath: string;
  resumePath: string;
  feedback: Feedback;
  createdAt?: string; // ISO timestamp
}

type TipType = "good" | "improve";

interface Tip {
  type: TipType;
  tip: string;
  explanation?: string;
}

interface ScoredSection {
  score: number;
  tips: Tip[];
}

interface Feedback {
  overallScore: number;
  ATS: ScoredSection;
  toneAndStyle: ScoredSection;
  content: ScoredSection;
  structure: ScoredSection;
  skills: ScoredSection;
  jobMatch?: {
    score: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    matchedSkills: string[];
    missingSkills: string[];
    tips: Tip[];
  };
}

// ============================================================
// PUTER TYPES
// ============================================================

interface FSItem {
  id: string;
  uid: string;
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  modified: number;
}

interface PuterUser {
  username: string;
  uuid: string;
  email?: string;
}

interface KVItem {
  key: string;
  value: string;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content:
    | string
    | {
        type: string;
        text?: string;
        puter_path?: string;
      }[];
}

interface PuterChatOptions {
  model?: string;
  stream?: boolean;
}

interface AIResponse {
  message: {
    role: string;
    content:
      | string
      | {
          type: string;
          text: string;
        }[];
  };
}
