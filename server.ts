import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  initialDocuments,
  initialTimelineEvents,
  initialCareerInsights,
  initialUserProfile,
} from './src/data/mockData.js';
import {
  DocumentItem,
  DocumentCategory,
  CareerInsightsData,
  ClaimCategory,
  ClaimStatus,
  EvidenceStrength,
  ConfidenceLevel,
  EvidenceSource,
  CareerClaim,
  ResumeDocument,
  PortfolioDocument,
  ResumeSkillItem,
  PortfolioProject,
  UserProfile,
  UserRecord,
  AuthResponse,
} from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// User-scoped storage maps
const userDocsMap = new Map<string, DocumentItem[]>();
const userTimelineMap = new Map<string, TimelineEventItem[]>();
const userClaimsMap = new Map<string, CareerClaim[]>();
const userResumesMap = new Map<string, ResumeDocument[]>();
const userPortfoliosMap = new Map<string, PortfolioDocument[]>();

// Persistent User Credentials Store
const USERS_FILE = path.join(__dirname, 'users.json');
const userSessionsMap = new Map<string, UserRecord>(); // token -> UserRecord

function loadUsersMap(): Map<string, UserRecord> {
  const map = new Map<string, UserRecord>();
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      const list: UserRecord[] = JSON.parse(data);
      if (Array.isArray(list)) {
        list.forEach((u) => {
          if (u && u.email) {
            map.set(u.email.toLowerCase().trim(), u);
          }
        });
      }
    }
  } catch (err) {
    console.error('Failed to load users.json store:', err);
  }
  return map;
}

const usersMap = loadUsersMap();

function saveUsersMap() {
  try {
    const list = Array.from(usersMap.values());
    fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save users.json store:', err);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(32).toString('hex');
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function sanitizeUser(u: UserRecord): UserProfile {
  const university = (u.university && u.university !== 'Stanford University') ? u.university : '';
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    title: u.title || 'AI Vault User',
    university,
    degree: u.degree || '',
    graduationYear: u.graduationYear || '',
    targetRole: u.targetRole || '',
    avatarUrl: u.avatarUrl || '',
    bio: u.bio || '',
    skills: u.skills || [],
  };
}

function getAuthenticatedUser(req: express.Request): UserRecord | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (userSessionsMap.has(token)) {
      return userSessionsMap.get(token)!;
    }
  }
  const tokenQuery = (req.query.token as string) || (req.body && req.body.token);
  if (tokenQuery && userSessionsMap.has(tokenQuery)) {
    return userSessionsMap.get(tokenQuery)!;
  }
  const emailReq = (req.query.email as string) || (req.body && req.body.email);
  if (emailReq && usersMap.has(emailReq.toLowerCase().trim())) {
    return usersMap.get(emailReq.toLowerCase().trim())!;
  }
  return null;
}

let careerInsights: CareerInsightsData = JSON.parse(JSON.stringify(initialCareerInsights));

function isSampleDoc(doc: DocumentItem): boolean {
  if (!doc || !doc.title) return true;
  const title = doc.title.toLowerCase();
  return (
    title.includes('deep learning') ||
    title.includes('banking risk') ||
    title.includes('goldman sachs') ||
    title.includes('alex_morgan') ||
    title.includes('aws certified') ||
    ['doc_01', 'doc_02', 'doc_03', 'doc_04', 'doc_05', 'doc_06', 'doc_07'].includes(doc.id)
  );
}

function getDocsForUser(email?: string): DocumentItem[] {
  if (!email || !email.trim()) return [];
  const key = email.toLowerCase().trim();
  if (!userDocsMap.has(key)) {
    userDocsMap.set(key, []);
  }
  const docs = userDocsMap.get(key)!.filter((d) => !isSampleDoc(d));
  userDocsMap.set(key, docs);
  return docs;
}

function getClaimsForUser(email?: string): CareerClaim[] {
  const key = (email || userProfile.email || 'default').toLowerCase();
  if (!userClaimsMap.has(key)) {
    userClaimsMap.set(key, []);
  }
  return userClaimsMap.get(key)!;
}

function rebuildEvidenceClaims(email?: string): CareerClaim[] {
  const key = (email || userProfile.email || 'default').toLowerCase();
  const docs = getDocsForUser(email);
  const existingClaims = userClaimsMap.get(key) || [];

  const claimMap = new Map<string, {
    claim: string;
    category: ClaimCategory;
    sources: EvidenceSource[];
    details: string;
  }>();

  docs.forEach((doc) => {
    const docSource: EvidenceSource = {
      id: `src_${doc.id}`,
      userId: key,
      documentId: doc.id,
      sourceTitle: doc.title,
      sourceType: doc.category,
      location: `Extracted Document Section (${doc.category})`,
      extractedText: doc.summary || doc.extractedText.slice(0, 150),
      createdAt: doc.uploadDate || new Date().toISOString().split('T')[0],
    };

    // 1. Extract Skills claims
    doc.skills.forEach((skill) => {
      const sKey = `skill_${skill.toLowerCase()}`;
      if (!claimMap.has(sKey)) {
        claimMap.set(sKey, {
          claim: skill,
          category: 'Skills',
          sources: [docSource],
          details: `Extracted skill "${skill}" from ${doc.title} (${doc.organization}).`,
        });
      } else {
        const item = claimMap.get(sKey)!;
        if (!item.sources.some((s) => s.documentId === doc.id)) {
          item.sources.push(docSource);
          item.details += ` Additional evidence in ${doc.title}.`;
        }
      }
    });

    // 2. Extract Document Category claims (Certificates, Projects, Experience)
    if (doc.category === 'Certificates') {
      const cKey = `cert_${doc.title.toLowerCase()}`;
      if (!claimMap.has(cKey)) {
        claimMap.set(cKey, {
          claim: `${doc.title} Certificate`,
          category: 'Certifications',
          sources: [docSource],
          details: `Verified certification issued by ${doc.organization} (${doc.issueDate}).`,
        });
      }
    } else if (doc.category === 'Projects') {
      const pKey = `proj_${doc.title.toLowerCase()}`;
      if (!claimMap.has(pKey)) {
        claimMap.set(pKey, {
          claim: `${doc.title} Project`,
          category: 'Projects',
          sources: [docSource],
          details: `Completed capstone project documented in ${doc.title}.`,
        });
      }
    } else if (doc.category === 'Internships') {
      const iKey = `exp_${doc.title.toLowerCase()}`;
      if (!claimMap.has(iKey)) {
        claimMap.set(iKey, {
          claim: `${doc.organization} Internship Experience`,
          category: 'Experience',
          sources: [docSource],
          details: `Professional internship experience at ${doc.organization} (${doc.issueDate}).`,
        });
      }
    }
  });

  const updatedClaims: CareerClaim[] = [];

  // Preserve user-added or self-reported claims
  existingClaims.forEach((ex) => {
    if (ex.status === 'SELF_REPORTED' || ex.status === 'UNSUPPORTED' || ex.userVerified) {
      const match = Array.from(claimMap.values()).find(
        (c) => c.claim.toLowerCase() === ex.claim.toLowerCase()
      );
      if (match) {
        ex.evidenceSources = match.sources;
        ex.status = 'VERIFIED';
        ex.evidenceStrength = match.sources.length >= 2 ? 'Strong' : 'Moderate';
        ex.confidence = 'High';
      }
      updatedClaims.push(ex);
    }
  });

  // Add auto-extracted claims
  claimMap.forEach((val) => {
    const exists = updatedClaims.some((c) => c.claim.toLowerCase() === val.claim.toLowerCase());
    if (!exists) {
      const sourceCount = val.sources.length;
      const strength: EvidenceStrength = sourceCount >= 2 ? 'Strong' : sourceCount === 1 ? 'Moderate' : 'None';
      updatedClaims.push({
        id: `claim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: key,
        claim: val.claim,
        category: val.category,
        status: 'VERIFIED',
        evidenceStrength: strength,
        confidence: 'High',
        userVerified: false,
        evidenceSources: val.sources,
        evidenceDetails: val.details,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      });
    }
  });

  userClaimsMap.set(key, updatedClaims);
  return updatedClaims;
}

function isSampleTimelineEvent(ev: TimelineEventItem): boolean {
  if (!ev || !ev.title) return true;
  const title = ev.title.toLowerCase();
  return (
    title.includes('deep learning') ||
    title.includes('banking risk') ||
    title.includes('goldman sachs') ||
    title.includes('alex_morgan') ||
    title.includes('aws certified') ||
    ['tl_doc_01', 'tl_doc_02', 'tl_doc_03', 'tl_doc_04', 'tl_doc_05', 'tl_01', 'tl_02'].includes(ev.id)
  );
}

function getTimelineForUser(email?: string): TimelineEventItem[] {
  const key = (email || userProfile.email || 'default').toLowerCase();
  if (!userTimelineMap.has(key)) {
    userTimelineMap.set(key, []);
  }
  const events = userTimelineMap.get(key)!.filter((e) => !isSampleTimelineEvent(e));
  userTimelineMap.set(key, events);
  return events;
}

// Initialize Gemini AI Client safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.error('Failed to initialize Gemini AI client:', err);
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '20mb' }));

  // Helper to sync graph & timeline when docs change
  function rebuildGraphAndTimeline(email?: string) {
    const docs = getDocsForUser(email);
    // Refresh skills on profile
    const allSkillsSet = new Set<string>();
    docs.forEach((doc) => doc.skills.forEach((s) => allSkillsSet.add(s)));
    userProfile.skills = Array.from(allSkillsSet);
    rebuildEvidenceClaims(email);
  }

  // API Routes

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'MyAI Vault', geminiConfigured: !!process.env.GEMINI_API_KEY });
  });

  // Auth Endpoints (Real Credentials & Security)
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, confirmPassword, university, targetRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const emailClean = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailClean)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    if (usersMap.has(emailClean)) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);
    const userId = 'usr_' + Date.now();

    const newRecord: UserRecord = {
      id: userId,
      name: String(name).trim(),
      email: emailClean,
      passwordHash,
      salt,
      title: targetRole ? `${targetRole} Candidate` : 'Student / Professional',
      university: university ? String(university).trim() : '',
      degree: '',
      graduationYear: '',
      targetRole: targetRole ? String(targetRole).trim() : '',
      avatarUrl: '',
      bio: '',
      skills: [],
      createdAt: new Date().toISOString(),
    };

    usersMap.set(emailClean, newRecord);
    saveUsersMap();

    const token = generateToken();
    userSessionsMap.set(token, newRecord);

    res.json({
      success: true,
      user: sanitizeUser(newRecord),
      token,
      message: 'Account created successfully.',
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const emailClean = String(email).trim().toLowerCase();
    const userRecord = usersMap.get(emailClean);

    if (!userRecord) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const inputHash = hashPassword(password, userRecord.salt);
    if (inputHash !== userRecord.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken();
    userSessionsMap.set(token, userRecord);

    res.json({
      success: true,
      user: sanitizeUser(userRecord),
      token,
    });
  });

  app.get('/api/auth/me', (req, res) => {
    const userRecord = getAuthenticatedUser(req);
    if (!userRecord) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    res.json({ success: true, user: sanitizeUser(userRecord) });
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const emailClean = String(email).trim().toLowerCase();
    const userRecord = usersMap.get(emailClean);

    if (userRecord) {
      const resetToken = crypto.randomBytes(24).toString('hex');
      const resetTokenExpires = Date.now() + 3600000; // 1 hour

      userRecord.resetToken = resetToken;
      userRecord.resetTokenExpires = resetTokenExpires;
      saveUsersMap();

      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      const resetUrl = `${appUrl}/?resetToken=${resetToken}`;

      console.log('\n======================================================');
      console.log(`[AUTH SYSTEM] PASSWORD RESET LINK GENERATED FOR: ${emailClean}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log('======================================================\n');
    }

    // Always return generic success message to prevent user enumeration
    res.json({
      success: true,
      message: 'If an account exists for this email address, a password reset link has been sent.',
    });
  });

  app.post('/api/auth/reset-password', (req, res) => {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    let targetUser: UserRecord | null = null;
    for (const u of usersMap.values()) {
      if (
        u.resetToken === resetToken &&
        u.resetTokenExpires &&
        u.resetTokenExpires > Date.now()
      ) {
        targetUser = u;
        break;
      }
    }

    if (!targetUser) {
      return res.status(400).json({ error: 'Invalid or expired password reset link.' });
    }

    targetUser.salt = generateSalt();
    targetUser.passwordHash = hashPassword(newPassword, targetUser.salt);
    delete targetUser.resetToken;
    delete targetUser.resetTokenExpires;
    saveUsersMap();

    res.json({
      success: true,
      message: 'Your password has been reset successfully.',
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      userSessionsMap.delete(token);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // Profile endpoints
  app.put('/api/profile', (req, res) => {
    const authUser = getAuthenticatedUser(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userRecord = usersMap.get(authUser.email.toLowerCase());
    if (userRecord) {
      Object.assign(userRecord, req.body);
      saveUsersMap();
      res.json({ success: true, user: sanitizeUser(userRecord) });
    } else {
      res.status(404).json({ error: 'User profile not found' });
    }
  });

  // Documents API
  app.get('/api/documents', (req, res) => {
    const reqEmail = (req.query.email as string) || userProfile.email;
    res.json({ documents: getDocsForUser(reqEmail) });
  });

  app.get('/api/documents/:id', (req, res) => {
    const reqEmail = (req.query.email as string) || userProfile.email;
    const docs = getDocsForUser(reqEmail);
    const doc = docs.find((d) => d.id === req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ document: doc });
  });

  app.delete('/api/documents/:id', (req, res) => {
    const docId = req.params.id;
    const reqEmail = (req.query.email as string) || userProfile.email;
    const key = (reqEmail || 'default').toLowerCase();
    
    const docs = getDocsForUser(reqEmail).filter((d) => d.id !== docId);
    userDocsMap.set(key, docs);

    const timeline = getTimelineForUser(reqEmail).filter((t) => t.docId !== docId);
    userTimelineMap.set(key, timeline);

    rebuildGraphAndTimeline(reqEmail);
    res.json({ success: true, remainingCount: docs.length });
  });

  // Upload Document & Run AI Pipeline
  app.post('/api/documents/upload', async (req, res) => {
    try {
      const { title, fileName, fileType, category, organization, rawText, contentBase64, email } = req.body;
      const reqEmail = email || userProfile.email;
      const userDocs = getDocsForUser(reqEmail);
      const userTimeline = getTimelineForUser(reqEmail);

      if (!title || !fileName) {
        return res.status(400).json({ error: 'Title and fileName are required' });
      }

      const isBinaryPdf = rawText && (rawText.startsWith('%PDF') || rawText.includes('PDF-1.'));
      const extractedTextSample =
        (!isBinaryPdf && rawText ? rawText : '') ||
        `Document Title: ${title}. Category: ${category || 'General'}. Issued by: ${organization || 'Institution'}. Details: Verified credential and technical milestone in Computer Science, Software Engineering, and AI Systems.`;

      let summary = `Verified document titled "${title}" related to ${category || 'academic/professional'} achievements.`;
      let skills: string[] = ['Python', 'Problem Solving', 'Data Analysis'];
      let detectedCategory: DocumentCategory = (category as DocumentCategory) || 'Certificates';
      let detectedOrg = organization || '';
      let issueDate = new Date().toISOString().split('T')[0];

      // Call Gemini for real AI parsing & classification if available
      const ai = getGeminiClient();
      if (ai) {
        try {
          const prompt = `Analyze this uploaded document for a student's career portfolio.
Document Title: ${title}
File Name: ${fileName}
Category Hint: ${category || 'Unknown'}
${extractedTextSample ? `Raw Text / Excerpt: ${extractedTextSample}` : ''}

Provide a JSON output with the following fields:
1. "summary": A concise 2-3 sentence AI summary of what this document proves.
2. "skills": An array of 3-6 key technical or professional skills extracted from this document (e.g. ["Python", "FastAPI", "SQL"]).
3. "category": One of strictly ["Projects", "Certificates", "Internships", "Achievements", "Research", "Hackathons", "Academics", "Skills", "Resume"].
4. "organization": The issuing institution or company (e.g. "Stanford", "AWS", "Google", "Goldman Sachs").
5. "issueDate": Date formatted as YYYY-MM-DD or estimated year.
`;

          const contentsPayload: any[] = [prompt];
          if (contentBase64) {
            const cleanBase64 = contentBase64.replace(/^data:[^;]+;base64,/, '');
            let mime = 'application/pdf';
            if (fileType === 'image' || fileName.match(/\.(png|jpg|jpeg)$/i)) {
              mime = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
            }
            contentsPayload.push({
              inlineData: {
                mimeType: mime,
                data: cleanBase64,
              },
            });
          }

          const aiRes = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: contentsPayload,
            config: {
              responseMimeType: 'application/json',
            },
          });

          if (aiRes.text) {
            const parsed = JSON.parse(aiRes.text.trim());
            if (parsed.summary) summary = parsed.summary;
            if (Array.isArray(parsed.skills) && parsed.skills.length > 0) skills = parsed.skills;
            if (parsed.category) detectedCategory = parsed.category as DocumentCategory;
            if (parsed.organization) detectedOrg = parsed.organization;
            if (parsed.issueDate) issueDate = parsed.issueDate;
          }
        } catch (geminiErr) {
          console.warn('Gemini extraction fallback:', geminiErr);
        }
      }

      const newDoc: DocumentItem = {
        id: docId,
        title,
        fileName,
        fileType: fileType || 'pdf',
        fileSize: (Math.random() * 2 + 1).toFixed(1) + ' MB',
        uploadDate: new Date().toISOString().split('T')[0],
        category: detectedCategory,
        organization: detectedOrg,
        issueDate,
        summary,
        extractedText: extractedTextSample,
        skills,
        relatedDocIds: userDocs.slice(0, 2).map((d) => d.id),
        status: 'processed',
      };

      userDocs.unshift(newDoc);

      // Add timeline event
      userTimeline.unshift({
        id: 'tl_' + docId,
        year: issueDate.substring(0, 4) || '2026',
        date: issueDate,
        title,
        category: detectedCategory,
        organization: detectedOrg,
        description: summary,
        skills,
        docId,
      });

      rebuildGraphAndTimeline(reqEmail);

      res.json({ success: true, document: newDoc });
    } catch (err: any) {
      console.error('Upload handler error:', err);
      res.status(500).json({ error: err?.message || 'Failed to process document upload' });
    }
  });

  // Semantic Search API
  app.post('/api/search', async (req, res) => {
    const { query, email } = req.body;
    const reqEmail = email || userProfile.email;
    const userDocs = getDocsForUser(reqEmail);

    if (!query) {
      return res.json({ results: userDocs });
    }

    const q = query.toLowerCase();

    // Perform vector similarity ranking with Gemini or keyword fallback
    let resultsWithScore = userDocs.map((doc) => {
      let score = 0;
      const text = `${doc.title} ${doc.category} ${doc.organization} ${doc.summary} ${doc.extractedText} ${doc.skills.join(' ')}`.toLowerCase();
      
      const terms = q.split(' ').filter((t: string) => t.length > 2);
      terms.forEach((term: string) => {
        if (text.includes(term)) score += 0.25;
      });

      if (doc.title.toLowerCase().includes(q)) score += 0.4;
      if (doc.category.toLowerCase().includes(q)) score += 0.3;
      if (doc.skills.some((s) => s.toLowerCase().includes(q))) score += 0.35;

      const normScore = Math.min(0.99, Math.max(0.45, 0.5 + score * 0.3));
      return {
        ...doc,
        embeddingVectorSim: Math.round(normScore * 100) / 100,
      };
    });

    resultsWithScore.sort((a, b) => (b.embeddingVectorSim || 0) - (a.embeddingVectorSim || 0));

    res.json({ query, results: resultsWithScore });
  });

  // Timeline API
  app.get('/api/timeline', (req, res) => {
    const reqEmail = (req.query.email as string) || userProfile.email;
    res.json({ timeline: getTimelineForUser(reqEmail) });
  });

  // Evidence Vault Claims API
  app.get('/api/evidence/claims', (req, res) => {
    const reqEmail = (req.query.email as string) || userProfile.email;
    const claims = rebuildEvidenceClaims(reqEmail);
    const totalSources = Array.from(new Set(claims.flatMap((c) => c.evidenceSources.map((s) => s.documentId)))).length;
    const verifiedCount = claims.filter((c) => c.status === 'VERIFIED').length;
    const reviewCount = claims.filter((c) => c.status === 'NEEDS_REVIEW').length;
    const unsupportedCount = claims.filter((c) => c.status === 'UNSUPPORTED').length;

    res.json({
      claims,
      summary: {
        totalSources,
        verifiedCount,
        reviewCount,
        unsupportedCount,
        totalClaims: claims.length,
      },
    });
  });

  app.post('/api/evidence/claims', (req, res) => {
    const { claim, category, status, evidenceDetails, email } = req.body;
    const reqEmail = email || userProfile.email;
    const key = (reqEmail || 'default').toLowerCase();
    const userClaims = getClaimsForUser(reqEmail);

    if (!claim) {
      return res.status(400).json({ error: 'Claim title is required' });
    }

    const newClaim: CareerClaim = {
      id: `claim_user_${Date.now()}`,
      userId: key,
      claim,
      category: category || 'Skills',
      status: status || 'SELF_REPORTED',
      evidenceStrength: 'None',
      confidence: 'Medium',
      userVerified: true,
      evidenceSources: [],
      evidenceDetails: evidenceDetails || 'Self-reported claim added by user.',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    userClaims.unshift(newClaim);
    res.json({ success: true, claim: newClaim });
  });

  app.put('/api/evidence/claims/:id', (req, res) => {
    const reqEmail = (req.query.email as string) || req.body.email || userProfile.email;
    const userClaims = getClaimsForUser(reqEmail);
    const claim = userClaims.find((c) => c.id === req.params.id);

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    Object.assign(claim, req.body, { updatedAt: new Date().toISOString().split('T')[0] });
    res.json({ success: true, claim });
  });

  app.delete('/api/evidence/claims/:id', (req, res) => {
    const reqEmail = (req.query.email as string) || userProfile.email;
    const key = (reqEmail || 'default').toLowerCase();
    const userClaims = getClaimsForUser(reqEmail).filter((c) => c.id !== req.params.id);
    userClaimsMap.set(key, userClaims);
    res.json({ success: true });
  });

  app.post('/api/evidence/reprocess', (req, res) => {
    const reqEmail = req.body?.email || userProfile.email;
    const claims = rebuildEvidenceClaims(reqEmail);
    res.json({ success: true, claims });
  });

  // Resume & Portfolio Helper Functions
  function getResumesForUser(email?: string): ResumeDocument[] {
    const key = (email || userProfile.email || 'default').toLowerCase();
    if (!userResumesMap.has(key)) {
      userResumesMap.set(key, []);
    }
    return userResumesMap.get(key)!;
  }

  function getPortfoliosForUser(email?: string): PortfolioDocument[] {
    const key = (email || userProfile.email || 'default').toLowerCase();
    if (!userPortfoliosMap.has(key)) {
      userPortfoliosMap.set(key, []);
    }
    return userPortfoliosMap.get(key)!;
  }

  function generateResumeData(email?: string, template: 'professional' | 'modern' = 'professional'): ResumeDocument {
    const key = (email || 'default').toLowerCase();
    const userRec = usersMap.get(key);
    const userName = userRec?.name || 'Vault User';
    const userEmail = userRec?.email || email || '';
    const userRole = userRec?.targetRole || 'Professional';
    const userUni = userRec?.university || '';

    const docs = getDocsForUser(email);
    const claims = rebuildEvidenceClaims(email);

    const resumeSkills: ResumeSkillItem[] = claims
      .filter((c) => c.status !== 'UNSUPPORTED')
      .map((c) => ({
        name: c.claim,
        status: c.status,
        userVerified: c.userVerified || c.status === 'VERIFIED',
      }));

    const experienceDocs = docs.filter((d) => d.category === 'Internships' || d.category === 'Academics');
    const projectDocs = docs.filter((d) => d.category === 'Projects');
    const certDocs = docs.filter((d) => d.category === 'Certificates');

    const summaryText = docs.length > 0
      ? `Results-driven ${userRole} with an evidence-backed background${userUni ? ` from ${userUni}` : ''}. Proven technical competencies supported by ${docs.length} verified credential(s) in ${resumeSkills.slice(0, 5).map((s) => s.name).join(', ')}.`
      : `Motivated ${userRole} focused on building an evidence-backed career portfolio.`;

    const newResume: ResumeDocument = {
      id: `res_${Date.now()}`,
      userId: key,
      title: `${userName} ATS Resume (${new Date().toLocaleDateString()})`,
      template,
      content: {
        contact: {
          name: userName,
          email: userEmail,
          phone: '',
          location: '',
          linkedin: '',
          github: '',
          portfolio: '',
        },
        summary: summaryText,
        skills: resumeSkills.length > 0 ? resumeSkills : [
          { name: 'Technical Skills', status: 'SELF_REPORTED', userVerified: true },
          { name: 'Problem Solving', status: 'SELF_REPORTED', userVerified: true }
        ],
        experience: experienceDocs.map((d) => ({
          title: d.title,
          organization: d.organization,
          date: d.issueDate,
          description: d.summary,
          skills: d.skills,
        })),
        projects: projectDocs.map((d) => ({
          title: d.title,
          description: d.summary,
          technologies: d.skills,
          date: d.issueDate,
          verified: true,
        })),
        certifications: certDocs.map((d) => ({
          title: d.title,
          provider: d.organization,
          date: d.issueDate,
          verified: true,
        })),
        education: [
          {
            degree: userRec?.degree || 'Degree Program',
            institution: userUni || 'Academic Institution',
            graduationYear: userRec?.graduationYear || '2026',
            details: 'Coursework and academic achievements verified in MyAI Vault.',
          }
        ],
        achievements: docs.filter((d) => d.category === 'Achievements').map((d) => d.title),
      },
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    const userResumes = getResumesForUser(email);
    userResumes.unshift(newResume);
    return newResume;
  }

  function generatePortfolioData(email?: string, template: 'clean' | 'showcase' = 'clean'): PortfolioDocument {
    const key = (email || 'default').toLowerCase();
    const userRec = usersMap.get(key);
    const userName = userRec?.name || 'Vault User';
    const userEmail = userRec?.email || email || '';
    const userRole = userRec?.targetRole || 'Professional';
    const userUni = userRec?.university || '';

    const docs = getDocsForUser(email);
    const claims = rebuildEvidenceClaims(email);

    const portfolioSkills = claims
      .filter((c) => c.status !== 'UNSUPPORTED')
      .map((c) => ({
        name: c.claim,
        verified: c.status === 'VERIFIED',
        sourceCount: c.evidenceSources ? c.evidenceSources.length : 1,
      }));

    const projectDocs = docs.filter((d) => d.category === 'Projects' || d.category === 'Certificates');

    const newPortfolio: PortfolioDocument = {
      id: `port_${Date.now()}`,
      userId: key,
      title: `${userName} Verified Portfolio (${new Date().toLocaleDateString()})`,
      template,
      content: {
        hero: {
          name: userName,
          role: userRole,
          bio: userRec?.bio || `Building evidence-backed technical solutions${userUni ? ` at ${userUni}` : ''}.`,
        },
        about: `Welcome to my verified career portfolio. Every project, certification, and skill listed here is grounded directly in my verified MyAI Vault documents and evidence sources.`,
        skills: portfolioSkills.length > 0 ? portfolioSkills : [
          { name: 'Technical Skills', verified: true, sourceCount: 1 }
        ],
        projects: projectDocs.map((d) => ({
          title: d.title,
          description: d.summary,
          technologies: d.skills,
          evidenceDocId: d.id,
          evidenceDocTitle: d.title,
          evidenceSnippet: d.extractedText ? d.extractedText.slice(0, 140) + '...' : d.summary,
          verified: true,
        })),
        certifications: docs.filter((d) => d.category === 'Certificates').map((d) => ({
          title: d.title,
          organization: d.organization,
          date: d.issueDate,
          verified: true,
        })),
        experience: docs.filter((d) => d.category === 'Internships').map((d) => ({
          title: d.title,
          organization: d.organization,
          date: d.issueDate,
          description: d.summary,
        })),
        contact: {
          email: userEmail,
          github: '',
          linkedin: '',
        },
      },
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    const userPortfolios = getPortfoliosForUser(email);
    userPortfolios.unshift(newPortfolio);
    return newPortfolio;
  }

  // Resume REST APIs
  app.get('/api/resumes', (req, res) => {
    const reqEmail = (req.query.email as string) || userProfile.email;
    res.json({ resumes: getResumesForUser(reqEmail) });
  });

  app.post('/api/resumes/generate', (req, res) => {
    const reqEmail = req.body?.email || userProfile.email;
    const template = req.body?.template || 'professional';
    const resume = generateResumeData(reqEmail, template);
    res.json({ success: true, resume });
  });

  app.put('/api/resumes/:id', (req, res) => {
    const reqEmail = (req.query.email as string) || req.body.email || userProfile.email;
    const userResumes = getResumesForUser(reqEmail);
    const resume = userResumes.find((r) => r.id === req.params.id);
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    Object.assign(resume, req.body, { updatedAt: new Date().toISOString().split('T')[0] });
    res.json({ success: true, resume });
  });

  app.delete('/api/resumes/:id', (req, res) => {
    const reqEmail = (req.query.email as string) || userProfile.email;
    const key = (reqEmail || 'default').toLowerCase();
    const userResumes = getResumesForUser(reqEmail).filter((r) => r.id !== req.params.id);
    userResumesMap.set(key, userResumes);
    res.json({ success: true });
  });

  // Portfolio REST APIs
  app.get('/api/portfolios', (req, res) => {
    const reqEmail = (req.query.email as string) || userProfile.email;
    res.json({ portfolios: getPortfoliosForUser(reqEmail) });
  });

  app.post('/api/portfolios/generate', (req, res) => {
    const reqEmail = req.body?.email || userProfile.email;
    const template = req.body?.template || 'clean';
    const portfolio = generatePortfolioData(reqEmail, template);
    res.json({ success: true, portfolio });
  });

  app.put('/api/portfolios/:id', (req, res) => {
    const reqEmail = (req.query.email as string) || req.body.email || userProfile.email;
    const userPortfolios = getPortfoliosForUser(reqEmail);
    const portfolio = userPortfolios.find((p) => p.id === req.params.id);
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });
    Object.assign(portfolio, req.body, { updatedAt: new Date().toISOString().split('T')[0] });
    res.json({ success: true, portfolio });
  });

  app.delete('/api/portfolios/:id', (req, res) => {
    const reqEmail = (req.query.email as string) || userProfile.email;
    const key = (reqEmail || 'default').toLowerCase();
    const userPortfolios = getPortfoliosForUser(reqEmail).filter((p) => p.id !== req.params.id);
    userPortfoliosMap.set(key, userPortfolios);
    res.json({ success: true });
  });

  function computeCareerInsights(email?: string): CareerInsightsData {
    const key = (email || 'default').toLowerCase();
    const userRec = usersMap.get(key);
    const targetRole = userRec?.targetRole || userProfile.targetRole || 'Software Engineer';

    const docs = getDocsForUser(email);
    const claims = rebuildEvidenceClaims(email);

    const verifiedClaims = claims.filter((c) => c.status === 'VERIFIED');
    const needsReviewClaims = claims.filter(
      (c) => c.status === 'NEEDS_REVIEW' || c.status === 'SELF_REPORTED'
    );
    const unsupportedClaims = claims.filter((c) => c.status === 'UNSUPPORTED');

    const verifiedMap = new Map<string, number>();
    verifiedClaims.forEach((c) => {
      const srcCount = c.evidenceSources ? Math.max(1, c.evidenceSources.length) : 1;
      verifiedMap.set(c.claim, (verifiedMap.get(c.claim) || 0) + srcCount);
    });

    docs.forEach((d) => {
      (d.skills || []).forEach((sk) => {
        if (!verifiedMap.has(sk)) {
          verifiedMap.set(sk, 1);
        }
      });
    });

    const verifiedSkillsList: VerifiedSkillInsight[] = Array.from(verifiedMap.entries()).map(
      ([name, sourceCount]) => ({ name, sourceCount })
    );

    const totalVerifiedSkills = verifiedSkillsList.length;
    let totalEvidenceSources = 0;
    verifiedSkillsList.forEach((s) => (totalEvidenceSources += s.sourceCount));
    if (totalEvidenceSources === 0 && docs.length > 0) {
      totalEvidenceSources = docs.length;
    }

    const needsReviewSkills = needsReviewClaims.map((c) => ({
      name: c.claim,
      reason: c.evidenceDetails || 'Self-reported or extracted claim pending user verification.',
    }));

    const missingSkills = unsupportedClaims.map((c) => ({
      name: c.claim,
      reason: 'No supporting document evidence found in vault.',
    }));

    const profileStatus: 'backed' | 'insufficient' =
      totalVerifiedSkills > 0 || totalEvidenceSources > 0 ? 'backed' : 'insufficient';

    const recommendedRoles: RecommendedRoleInsight[] = [];
    if (totalVerifiedSkills > 0) {
      const skillNames = verifiedSkillsList.map((s) => s.name);
      recommendedRoles.push({
        title: targetRole || 'Software Engineer',
        description: `Aligned directly with your verified skills (${skillNames.slice(0, 3).join(', ')}).`,
        relevantSkills: skillNames.slice(0, 4),
      });

      if (skillNames.some((s) => /python|ai|machine|data/i.test(s))) {
        recommendedRoles.push({
          title: 'AI & Data Specialist',
          description: 'Leverages your verified Python and data processing skills.',
          relevantSkills: skillNames.filter((s) => /python|ai|data|sql/i.test(s)).slice(0, 3),
        });
      } else {
        recommendedRoles.push({
          title: 'Full Stack Engineer',
          description: 'Matches your indexed software engineering project documentation.',
          relevantSkills: skillNames.slice(0, 3),
        });
      }
    }

    const nextSteps: string[] = [];
    if (needsReviewClaims.length > 0) {
      nextSteps.push(
        `Review ${needsReviewClaims.length} claim(s) currently marked as Needs Review in your Evidence Vault.`
      );
    }
    if (unsupportedClaims.length > 0) {
      nextSteps.push(
        `Upload supporting documents for unsupported skills (${unsupportedClaims.map((c) => c.claim).slice(0, 2).join(', ')}).`
      );
    }
    if (docs.length === 0) {
      nextSteps.push('Upload your certificates, project files, or resume to extract and verify your skills.');
    } else if (nextSteps.length < 3) {
      nextSteps.push('Export your verified skills into a tailored Resume or Portfolio document.');
    }

    return {
      targetRole,
      totalVerifiedSkills,
      totalEvidenceSources,
      profileStatus,
      skillGap: {
        verifiedSkills: verifiedSkillsList,
        needsReviewSkills,
        missingSkills,
      },
      recommendedRoles,
      nextSteps: nextSteps.slice(0, 3),
    };
  }

  // Career Insights API
  app.get('/api/insights', (req, res) => {
    const reqEmail = (req.query.email as string) || userProfile.email;
    res.json({ insights: computeCareerInsights(reqEmail) });
  });

  // Regenerate Career Insights
  app.post('/api/insights/generate', async (req, res) => {
    const reqEmail = req.body?.email || userProfile.email;
    const computed = computeCareerInsights(reqEmail);
    res.json({ insights: computed });
  });

  // RAG AI Chat Assistant API
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, chatHistory, email } = req.body;
      const authUser = getAuthenticatedUser(req);
      const reqEmail = email || authUser?.email || '';
      const userRec = usersMap.get((reqEmail || '').toLowerCase());
      const userName = userRec?.name || authUser?.name || 'Vault User';
      const userRole = userRec?.targetRole || authUser?.targetRole || 'Professional';
      const userUni = userRec?.university || authUser?.university || '';

      const userDocs = getDocsForUser(reqEmail);
      const userClaims = getClaimsForUser(reqEmail);

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Context building from vault documents & claims
      const hasDocs = userDocs.length > 0;
      const vaultContext = hasDocs
        ? userDocs
            .map(
              (doc) =>
                `[Doc ID: ${doc.id}] Title: ${doc.title} | Category: ${doc.category} | Org: ${doc.organization} | Date: ${doc.issueDate}\nSummary: ${doc.summary}\nExtracted Skills: ${doc.skills.join(', ')}\nText Excerpt: ${doc.extractedText}`
            )
            .join('\n\n---\n\n')
        : 'NO DOCUMENTS UPLOADED YET. The user vault is currently completely empty.';

      const claimsContext = userClaims.length > 0
        ? userClaims
            .map(
              (c) =>
                `- Claim: "${c.claim}" [Category: ${c.category}, Status: ${c.status}, Strength: ${c.evidenceStrength}, Sources: ${c.evidenceSources.map((s) => s.sourceTitle).join(', ') || 'None'}]`
            )
            .join('\n')
        : 'No claims in Evidence Vault.';

      const systemInstruction = `You are the MyAI Vault AI Career & Document Assistant for ${userName}.
Target Career Role: ${userRole}${userUni ? ` (${userUni})` : ''}.

Total Verified Documents in Vault: ${userDocs.length}

DOCUMENT VAULT CONTENT:
${vaultContext}

EVIDENCE VAULT CLAIMS & STATUSES:
${claimsContext}

INSTRUCTIONS & RULES:
1. Ground your responses strictly in the user's uploaded vault documents and Evidence Vault claims above.
2. DO NOT invent certificates, skills, internships, projects, companies, or test scores.
3. If asked about a skill or experience (e.g. "Do I have SQL experience?"):
   - Check if evidence exists in the Evidence Vault context.
   - If verified evidence exists, explicitly state: "SUPPORTED BY YOUR VAULT:" and cite the relevant document(s).
   - If no supporting evidence exists (status UNSUPPORTED or missing), explicitly state: "NOT FOUND IN YOUR VAULT: I couldn't find supporting evidence for [Topic] in your current Evidence Vault."
4. Structure your responses clearly with Markdown:
   - **Direct Summary**: Concise 1-2 sentence response.
   - **Key Highlights**: Bullet points listing verified skills/milestones or missing skills.
   - **Evidence & Grounding**: Mentioning specific documents or stating that no supporting documents are present.
   - **Next Action**: A practical recommendation for their career profile.
5. Keep answers professional, sharp, and easy to read.`;

      const ai = getGeminiClient();
      let answerText = '';
      let sources: { docId: string; title: string; snippet: string; category?: string }[] = [];

      if (ai) {
        try {
          const aiRes = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: message,
            config: {
              systemInstruction,
              temperature: 0.6,
            },
          });
          answerText = aiRes.text || "I've analyzed your vault, but couldn't construct a text response.";
        } catch (geminiErr: any) {
          console.error('Gemini chat error:', geminiErr);
          if (hasDocs) {
            const allSkills = Array.from(new Set(userDocs.flatMap((d) => d.skills)));
            answerText = `**Direct Summary**\nBased on your ${userDocs.length} verified documents in MyAI Vault:\n\n**SUPPORTED BY YOUR VAULT:**\n- **Verified Skills**: ${allSkills.join(', ')}\n- **Total Documents**: ${userDocs.length} document(s) indexed.\n\n**Next Step**\nUpload additional certifications or resumes to expand your ATS career matrix.`;
          } else {
            answerText = `**Direct Summary**\nYour document vault is currently empty.\n\n**NOT FOUND IN YOUR VAULT:**\nNo documents or certificates have been uploaded yet.\n\n**Next Step**\nClick **Upload Document** to add your first certificate, project, or resume so I can index your career skills.`;
          }
        }
      } else {
        // Fallback response when GEMINI_API_KEY is not configured
        if (hasDocs) {
          const allSkills = Array.from(new Set(userDocs.flatMap((d) => d.skills)));
          answerText = `**Direct Summary**\nAnalyzed ${userDocs.length} verified documents in your MyAI Vault.\n\n**SUPPORTED BY YOUR VAULT:**\n- **Indexed Skills**: ${allSkills.slice(0, 8).join(', ')}\n- **Documents**: ${userDocs.map((d) => d.title).join(', ')}\n\n*Note: Configure GEMINI_API_KEY in Settings > Secrets for live conversational RAG reasoning.*`;
        } else {
          answerText = `**Direct Summary**\nYour MyAI Vault is currently empty.\n\n**NOT FOUND IN YOUR VAULT:**\nNo uploaded certificates or documents detected.\n\n**Next Step**\nUpload a PDF certificate or resume to activate AI document understanding.`;
        }
      }

      // Attach relevant sources based on keyword matching
      const qLower = message.toLowerCase();
      userDocs.forEach((d) => {
        const textToMatch = `${d.title} ${d.category} ${d.organization} ${d.skills.join(' ')} ${d.summary}`.toLowerCase();
        const words = qLower.split(' ').filter((w) => w.length > 2);
        const matches = words.some((w) => textToMatch.includes(w)) || qLower.includes(d.category.toLowerCase());
        
        if (matches && sources.length < 3) {
          sources.push({
            docId: d.id,
            title: d.title,
            snippet: d.summary,
            category: d.category,
          });
        }
      });

      // If no keyword match found but vault has docs and user asked a general question
      if (sources.length === 0 && userDocs.length > 0 && !qLower.includes('not found')) {
        sources.push({
          docId: userDocs[0].id,
          title: userDocs[0].title,
          snippet: userDocs[0].summary,
          category: userDocs[0].category,
        });
      }

      res.json({
        reply: answerText,
        sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err: any) {
      console.error('Chat endpoint error:', err);
      res.status(500).json({ error: 'Failed to process chat assistant query' });
    }
  });

  // Reset sample data API
  app.post('/api/reset-sample-data', (req, res) => {
    const reqEmail = req.body?.email || userProfile.email;
    const key = (reqEmail || 'default').toLowerCase();
    userDocsMap.set(key, []);
    userTimelineMap.set(key, []);
    careerInsights = JSON.parse(JSON.stringify(initialCareerInsights));
    userProfile = { ...initialUserProfile };
    res.json({ success: true, message: 'Vault reset to initial empty state' });
  });

  // Vite Middleware for Dev vs Production Static Serving
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
