export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  theme: string;
  preferredLanguage: string;
  createdAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  id?: string;
  userId?: string;
  responseStyle: string;
  responseLength: string;
  voiceEnabled: boolean;
  voiceSpeed: number;
}

export interface Conversation {
  id: string;
  title: string;
  mode: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  status: string;
  tokenUsage?: number | null;
  createdAt: string;
}

export interface PracticeSession {
  id: string;
  userId: string;
  title: string;
  practiceType: string;
  topic: string;
  audienceType: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetDurationSeconds: number;
  actualDurationSeconds?: number | null;
  language: string;
  interactionMode: 'practice' | 'interactive' | 'qa';
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  transcripts?: PracticeTranscript[];
  questions?: PracticeQuestion[];
  evaluations?: PracticeEvaluation[];
  _count?: {
    transcripts: number;
    questions: number;
  };
}

export interface PracticeTranscript {
  id: string;
  sessionId: string;
  speaker: 'user' | 'assistant';
  content: string;
  sequenceNumber: number;
  startedAt?: string | null;
  createdAt: string;
}

export interface PracticeQuestion {
  id: string;
  sessionId: string;
  question: string;
  userAnswer?: string | null;
  feedback?: string | null;
  sequenceNumber: number;
  createdAt: string;
  answeredAt?: string | null;
}

export interface EvaluationCriterion {
  name: string;
  score: number;
  evidence: string;
  suggestion: string;
}

export interface ImprovementItem {
  issue: string;
  original: string;
  suggested: string;
  reason: string;
}

export interface PracticeEvaluation {
  id: string;
  sessionId: string;
  overallScore: number | null;
  summary: string;
  criteria: EvaluationCriterion[];
  strengths: string[];
  improvements: ImprovementItem[];
  nextPractice: string[];
  evaluationVersion?: number;
  createdAt: string;
}

export interface UploadedDocument {
  id: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string | null;
  createdAt: string;
  _count?: {
    chunks: number;
  };
}

export interface AnalyticsOverview {
  conversationsCount: number;
  totalSessions: number;
  completedSessionsCount: number;
  averageScore: number | null;
  totalPracticeMinutes: number;
  recommendation: string;
  recentSessions: Array<{
    id: string;
    title: string;
    practiceType: string;
    status: string;
    createdAt: string;
    evaluations: Array<{ overallScore: number | null }>;
  }>;
  recentConversations: Array<{
    id: string;
    title: string;
    mode: string;
    updatedAt: string;
  }>;
}

export interface ProgressData {
  scoreTimeline: Array<{
    sessionId: string;
    title: string;
    date: string;
    score: number;
    practiceType: string;
  }>;
  criteriaAverages: Array<{
    name: string;
    score: number;
  }>;
  totalSessionsCount: number;
}
