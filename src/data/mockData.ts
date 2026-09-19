import {
  DocumentItem,
  UserProfile,
  TimelineEventItem,
  CareerInsightsData,
  AppNotification,
} from '../types';

export const initialUserProfile: UserProfile = {
  id: '',
  name: '',
  email: '',
  title: 'AI Vault User',
  university: '',
  degree: '',
  graduationYear: '',
  targetRole: '',
  avatarUrl: '',
  bio: '',
  skills: [],
};

export const initialDocuments: DocumentItem[] = [];

export const initialTimelineEvents: TimelineEventItem[] = [];

export const initialCareerInsights: CareerInsightsData = {
  targetRole: 'Software Engineer',
  totalVerifiedSkills: 0,
  totalEvidenceSources: 0,
  profileStatus: 'insufficient',
  skillGap: {
    verifiedSkills: [],
    needsReviewSkills: [],
    missingSkills: [],
  },
  recommendedRoles: [],
  nextSteps: [
    'Upload your certificates, project files, or resume to extract and verify your skills.',
  ],
};

export const initialNotifications: AppNotification[] = [];
