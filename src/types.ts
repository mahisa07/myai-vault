export type DocumentCategory =
  | 'Projects'
  | 'Certificates'
  | 'Internships'
  | 'Achievements'
  | 'Research'
  | 'Hackathons'
  | 'Academics'
  | 'Skills'
  | 'Resume';

export type ClaimStatus = 'VERIFIED' | 'NEEDS_REVIEW' | 'SELF_REPORTED' | 'UNSUPPORTED';
export type ClaimCategory = 'Skills' | 'Projects' | 'Certifications' | 'Experience' | 'Achievements' | 'Technologies';
export type EvidenceStrength = 'Strong' | 'Moderate' | 'Weak' | 'None';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface EvidenceSource {
  id: string;
  userId: string;
  documentId: string;
  sourceTitle: string;
  sourceType: DocumentCategory;
  location: string;
  extractedText: string;
  createdAt: string;
}

export interface CareerClaim {
  id: string;
  userId: string;
  claim: string;
  category: ClaimCategory;
  status: ClaimStatus;
  evidenceStrength: EvidenceStrength;
  confidence: ConfidenceLevel;
  userVerified: boolean;
  evidenceSources: EvidenceSource[];
  evidenceDetails: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'image' | 'zip';
  fileSize: string;
  uploadDate: string;
  category: DocumentCategory;
  organization: string;
  issueDate: string;
  summary: string;
  extractedText: string;
  skills: string[];
  extractedClaims?: string[];
  embeddingVectorSim?: number;
  relatedDocIds: string[];
  status: 'processed' | 'processing' | 'failed';
  downloadUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  title: string;
  university: string;
  degree: string;
  graduationYear: string;
  targetRole: string;
  avatarUrl: string;
  bio: string;
  skills: string[];
  token?: string;
}

export interface UserRecord extends UserProfile {
  passwordHash: string;
  salt: string;
  createdAt: string;
  resetToken?: string;
  resetTokenExpires?: number;
}

export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  token?: string;
  error?: string;
  message?: string;
}

export interface TimelineEventItem {
  id: string;
  year: string;
  date: string;
  title: string;
  category: DocumentCategory;
  organization: string;
  description: string;
  skills: string[];
  docId?: string;
  iconType?: string;
}

export interface VerifiedSkillInsight {
  name: string;
  sourceCount: number;
}

export interface SkillGapInsight {
  verifiedSkills: VerifiedSkillInsight[];
  needsReviewSkills: { name: string; reason: string }[];
  missingSkills: { name: string; reason: string }[];
}

export interface RecommendedRoleInsight {
  title: string;
  description: string;
  relevantSkills: string[];
}

export interface CareerInsightsData {
  targetRole: string;
  totalVerifiedSkills: number;
  totalEvidenceSources: number;
  profileStatus: 'backed' | 'insufficient';
  skillGap: SkillGapInsight;
  recommendedRoles: RecommendedRoleInsight[];
  nextSteps: string[];
  
  // Legacy/Optional fields for backward compatibility
  atsScore?: number;
  atsBreakdown?: {
    keywordsScore: number;
    formattingScore: number;
    impactMetricsScore: number;
    relevanceScore: number;
  };
  topSkills?: { name: string; level: number; docCount: number }[];
  missingSkills?: { name: string; importance: 'High' | 'Medium' | 'Low'; reason: string }[];
  recommendedCareers?: {
    title: string;
    matchPercentage: number;
    description: string;
    demandLevel: 'High' | 'Very High' | 'Moderate';
  }[];
  suggestedCertifications?: {
    title: string;
    provider: string;
    estimatedHours: string;
    skillsCovered: string[];
  }[];
  learningRoadmap?: {
    phase: string;
    duration: string;
    title: string;
    description: string;
    actionItems: string[];
  }[];
  weakAreas?: string[];
  improvementTips?: string[];
}

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: { docId: string; title: string; snippet: string }[];
  isLoading?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'ai' | 'upload' | 'insight' | 'system';
  read: boolean;
}

// Resume Builder Types
export interface ResumeSkillItem {
  name: string;
  status: ClaimStatus;
  userVerified: boolean;
}

export interface ResumeContent {
  contact: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  skills: ResumeSkillItem[];
  experience: {
    title: string;
    organization: string;
    date: string;
    description: string;
    verified: boolean;
  }[];
  projects: {
    title: string;
    description: string;
    skills: string[];
    verified: boolean;
    evidenceDocTitle?: string;
  }[];
  certifications: {
    title: string;
    organization: string;
    date: string;
    verified: boolean;
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  achievements: {
    title: string;
    description: string;
    verified: boolean;
  }[];
}

export interface ResumeDocument {
  id: string;
  userId: string;
  title: string;
  template: 'professional' | 'modern';
  content: ResumeContent;
  createdAt: string;
  updatedAt: string;
}

// Portfolio Builder Types
export interface PortfolioProject {
  title: string;
  description: string;
  technologies: string[];
  evidenceDocId?: string;
  evidenceDocTitle?: string;
  evidenceSnippet?: string;
  verified: boolean;
}

export interface PortfolioContent {
  hero: {
    name: string;
    role: string;
    bio: string;
  };
  about: string;
  skills: {
    name: string;
    verified: boolean;
    sourceCount: number;
  }[];
  projects: PortfolioProject[];
  certifications: {
    title: string;
    organization: string;
    date: string;
    verified: boolean;
  }[];
  experience: {
    title: string;
    organization: string;
    date: string;
    description: string;
  }[];
  contact: {
    email: string;
    github?: string;
    linkedin?: string;
  };
}

export interface PortfolioDocument {
  id: string;
  userId: string;
  title: string;
  template: 'clean' | 'showcase';
  content: PortfolioContent;
  createdAt: string;
  updatedAt: string;
}
