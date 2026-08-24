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

interface JobMatchResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  matchedSkills: string[];
  missingSkills: string[];
  tips: Tip[];
}

interface Feedback {
  overallScore: number;
  ATS: ScoredSection;
  toneAndStyle: ScoredSection;
  content: ScoredSection;
  structure: ScoredSection;
  skills: ScoredSection;
  jobMatch?: JobMatchResult;
}


