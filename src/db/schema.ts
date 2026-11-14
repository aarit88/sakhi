import { relations } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// ─── Module 1: Users, Auth, OTP, Consents ──────────────────────────────────────
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  name: text('name'),
  phone: text('phone'),
  phoneVerified: boolean('phone_verified').default(false).notNull(),
  role: text('role').default('USER').notNull(), // 'USER' | 'DOCTOR' | 'ADMIN'
  age: integer('age'),
  bloodGroup: text('blood_group'),
  cycleLengthAvg: integer('cycle_length_avg').default(28),
  periodLengthAvg: integer('period_length_avg').default(5),
  conditionsJson: text('conditions_json'),
  onboardingComplete: boolean('onboarding_complete').default(false).notNull(),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const otpVerifications = pgTable('otp_verifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  purpose: text('purpose').notNull(), // 'phone_otp' | 'password_reset'
  target: text('target').notNull(),
  codeHash: text('code_hash').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userConsents = pgTable('user_consents', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  consentType: text('consent_type').notNull(),
  granted: boolean('granted').default(false).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Module 3: Menstrual & Cycle Tracking ──────────────────────────────────────
export const periodLogs = pgTable('period_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  flowIntensity: text('flow_intensity'), // 'spotting' | 'light' | 'medium' | 'heavy'
  cycleDuration: integer('cycle_duration'),
  irregularities: text('irregularities'),
  crampsSeverity: integer('cramps_severity'),
  spotting: boolean('spotting').default(false).notNull(),
  symptomsJson: text('symptoms_json'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Module 4: Comprehensive Health Logging ────────────────────────────────────
export const symptomLogs = pgTable('symptom_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  type: text('type').notNull(),
  severity: integer('severity').notNull(), // 1-10
  category: text('category').default('general').notNull(),
  notes: text('notes'),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const moodLogs = pgTable('mood_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  score: integer('score').notNull(), // 1-10
  energyLevel: integer('energy_level'), // 1-10
  moodTag: text('mood_tag'),
  notes: text('notes'),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sleepLogs = pgTable('sleep_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  hours: doublePrecision('hours').notNull(),
  quality: text('quality').default('good').notNull(),
  notes: text('notes'),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const hydrationLogs = pgTable('hydration_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  intake: doublePrecision('intake').notNull(),
  target: doublePrecision('target').default(2.5).notNull(),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  steps: integer('steps').default(0).notNull(),
  calories: integer('calories').default(0).notNull(),
  activeMinutes: integer('active_minutes').default(0).notNull(),
  activityType: text('activity_type'),
  notes: text('notes'),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Module 5: Interactive 3D Body Map ─────────────────────────────────────────
export const bodyMapLogs = pgTable('body_map_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  regionId: text('region_id').notNull(),
  regionLabel: text('region_label').notNull(),
  viewSide: text('view_side').notNull(), // 'front' | 'back' | 'left' | 'right'
  symptom: text('symptom').notNull(),
  severity: integer('severity').notNull(), // 1-10
  duration: text('duration'),
  frequency: text('frequency'),
  onset: text('onset'),
  associatedSymptomsJson: text('associated_symptoms_json'),
  cycleContext: text('cycle_context'),
  notes: text('notes'),
  coordinatesJson: text('coordinates_json'),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Module 6: Medical Report Upload & OCR ─────────────────────────────────────
export const medicalReports = pgTable('medical_reports', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').default(0).notNull(),
  parsedText: text('parsed_text'),
  extractedDataJson: text('extracted_data_json'),
  uncertaintyFlagsJson: text('uncertainty_flags_json'),
  verifiedByUser: boolean('verified_by_user').default(false).notNull(),
  status: text('status').default('parsed').notNull(),
  reportDate: timestamp('report_date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Modules 7 & 8: AI Companion & Medical Safety Events ───────────────────────
export const aiConversations = pgTable('ai_conversations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').default('SAKHI Conversation').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const aiMessages = pgTable('ai_messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id')
    .references(() => aiConversations.id, { onDelete: 'cascade' })
    .notNull(),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  safetyFlagged: boolean('safety_flagged').default(false).notNull(),
  citationsJson: text('citations_json'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const safetyEvents = pgTable('safety_events', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  source: text('source').notNull(), // 'ai_chat' | 'anon_chat' | 'body_map' | 'report'
  severity: text('severity').notNull(), // 'emergency' | 'urgent' | 'warning'
  matchedCategory: text('matched_category').notNull(),
  matchedText: text('matched_text').notNull(),
  guidanceShown: text('guidance_shown').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Module 9: Ayurveda & Traditional Wellness ─────────────────────────────────
export const ayurvedicKnowledge = pgTable('ayurvedic_knowledge', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  condition: text('condition').notNull(),
  dosha: text('dosha').notNull(),
  cyclePhase: text('cycle_phase'),
  symptomsJson: text('symptoms_json').notNull(),
  traditionalExplanation: text('traditional_explanation').notNull(),
  pathyaJson: text('pathya_json').notNull(),
  apathyaJson: text('apathya_json').notNull(),
  lifestyleGuidanceJson: text('lifestyle_guidance_json').notNull(),
  contraindicationsJson: text('contraindications_json').notNull(),
  evidenceLevel: text('evidence_level').notNull(), // 'traditional' | 'evidence_supported' | 'limited_evidence' | 'contraindicated'
  evidenceSummary: text('evidence_summary').notNull(),
  sourcesJson: text('sources_json').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Module 10: Anonymous Chat & Community Support ─────────────────────────────
export const anonChatSessions = pgTable('anon_chat_sessions', {
  id: serial('id').primaryKey(),
  sessionToken: text('session_token').notNull().unique(),
  topic: text('topic').default('general').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const anonChatMessages = pgTable('anon_chat_messages', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id')
    .references(() => anonChatSessions.id, { onDelete: 'cascade' })
    .notNull(),
  sender: text('sender').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  safetyFlagged: boolean('safety_flagged').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const communityPosts = pgTable('community_posts', {
  id: serial('id').primaryKey(),
  authorPseudonym: text('author_pseudonym').notNull(),
  authorTokenHash: text('author_token_hash').notNull(),
  topic: text('topic').notNull(), // 'Menstrual Health' | 'PCOS & Hormones' | 'Mental Wellness' | 'Pregnancy' | 'Nutrition'
  title: text('title').notNull(),
  body: text('body').notNull(),
  helpfulCount: integer('helpful_count').default(0).notNull(),
  status: text('status').default('active').notNull(), // 'active' | 'flagged' | 'hidden'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const communityComments = pgTable('community_comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id')
    .references(() => communityPosts.id, { onDelete: 'cascade' })
    .notNull(),
  authorPseudonym: text('author_pseudonym').notNull(),
  body: text('body').notNull(),
  status: text('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const moderationReports = pgTable('moderation_reports', {
  id: serial('id').primaryKey(),
  targetType: text('target_type').notNull(), // 'post' | 'comment'
  targetId: integer('target_id').notNull(),
  reason: text('reason').notNull(),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Module 12: Doctor Portal & Patient Sharing ────────────────────────────────
export const doctorProfiles = pgTable('doctor_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  fullName: text('full_name').notNull(),
  specialty: text('specialty').notNull(),
  registrationNumber: text('registration_number').notNull(),
  clinicName: text('clinic_name').notNull(),
  city: text('city').notNull(),
  verified: boolean('verified').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const doctorShareTokens = pgTable('doctor_share_tokens', {
  id: serial('id').primaryKey(),
  patientUserId: integer('patient_user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  token: text('token').notNull().unique(),
  label: text('label').notNull(),
  doctorName: text('doctor_name'),
  scopesJson: text('scopes_json').notNull(), // JSON: { cycle, symptoms, bodyMap, reports, aiSummary }
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const clinicianNotes = pgTable('clinician_notes', {
  id: serial('id').primaryKey(),
  shareTokenId: integer('share_token_id')
    .references(() => doctorShareTokens.id, { onDelete: 'cascade' })
    .notNull(),
  patientUserId: integer('patient_user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  clinicianName: text('clinician_name').notNull(),
  note: text('note').notNull(),
  recommendations: text('recommendations'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const accessAuditLogs = pgTable('access_audit_logs', {
  id: serial('id').primaryKey(),
  shareTokenId: integer('share_token_id')
    .references(() => doctorShareTokens.id, { onDelete: 'cascade' })
    .notNull(),
  patientUserId: integer('patient_user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  viewerLabel: text('viewer_label').notNull(),
  action: text('action').notNull(),
  accessedSectionsJson: text('accessed_sections_json').notNull(),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Relations ─────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  consents: many(userConsents),
  periodLogs: many(periodLogs),
  symptomLogs: many(symptomLogs),
  moodLogs: many(moodLogs),
  sleepLogs: many(sleepLogs),
  hydrationLogs: many(hydrationLogs),
  activityLogs: many(activityLogs),
  bodyMapLogs: many(bodyMapLogs),
  medicalReports: many(medicalReports),
  aiConversations: many(aiConversations),
  doctorShares: many(doctorShareTokens),
}));

export const aiConversationsRelations = relations(aiConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [aiConversations.userId],
    references: [users.id],
  }),
  messages: many(aiMessages),
}));

export const aiMessagesRelations = relations(aiMessages, ({ one }) => ({
  conversation: one(aiConversations, {
    fields: [aiMessages.conversationId],
    references: [aiConversations.id],
  }),
}));

export const communityPostsRelations = relations(communityPosts, ({ many }) => ({
  comments: many(communityComments),
}));

export const communityCommentsRelations = relations(communityComments, ({ one }) => ({
  post: one(communityPosts, {
    fields: [communityComments.postId],
    references: [communityPosts.id],
  }),
}));
