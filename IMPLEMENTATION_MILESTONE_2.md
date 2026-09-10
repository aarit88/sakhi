# SAKHI - MILESTONE 2: PRODUCTION HEALTH DATA + AI Agent Foundation

## Database Audit (Phase A)
- **Existing Schema:** PostgreSQL + Prisma. Models: `User`, `PeriodLog`, `Article`, `Tip`, `Resource`, `Reminder`, `CommunityPost`, `Comment`, `AnonQuestion`, `AnonAnswer`, `SymptomLog`, `MoodLog`, `SleepLog`, `HydrationLog`, `ActivityLog`, `MedicalReport`, `AIConversation`, `AIMessage`, `AnonChatSession`, `AnonChatMessage`.
- **Models Reused:** `MoodLog`, `SleepLog`, `HydrationLog`, `ActivityLog`, `SymptomLog`, `PeriodLog` (for Menstrual Cycle information). We will reuse `AIConversation` and `AIMessage` for the authenticated chatbot to avoid duplicating schemas.
- **Models Modified:** `AIMessage`
  - Added `safetyStatus String?` to persist safety trigger states (e.g. "NORMAL", "MEDICAL_ATTENTION_RECOMMENDED").
- **Models Newly Created:** None. We avoid creating duplicate tables.
- **Relationships:** Maintained strict relationship linking all health logs to `userId` enforcing data ownership boundaries.
- **Migration Strategy:** `npx prisma db push` will be executed safely.
- **API Mapping:** 
  - `GET/POST /api/health/mood` -> `MoodLog`
  - `GET/POST /api/health/sleep` -> `SleepLog`
  - `GET/POST /api/health/hydration` -> `HydrationLog`
  - `GET/POST /api/health/activity` -> `ActivityLog`
  - `GET/POST /api/health/symptoms` -> `SymptomLog`
  - `GET/POST /api/health/cycle` -> `PeriodLog`

## Real Health Data Model (Phase B)
All user logs strictly parse the authenticated `req.user.userId`. We use Zod for validation of dates, numeric ranges, and enums.

## Health REST APIs (Phase C)
Existing `bend/src/routes/health.ts` contains partially typed endpoints. We will add the missing `/api/health/cycle`, and rewrite `/api/health/summary` (which currently returns hardcoded metrics) to aggregate records using `prisma.findMany`.

## Frontend Replace Mock Data & Hooks (Phase D & E)
- Update `fend/hooks/use-health-data.ts` to export explicit strongly typed hooks: `useHealthSummary`, `useMoodData`, `useSleepData`, etc.
- Refactor `fend/components/health-tracking.tsx` to rip out `const healthMetrics` static arrays and integrate the dynamic hooks. Display empty states when no data is returned.

## AI Agent Foundation (Phase F - L)
Modular service architecture in `bend/src/services/ai`:
- `provider.ts`: Interface isolating the LLM API calls.
- `orchestrator.ts`: Middleman handling authorization context and dispatching.
- `safety/redFlags.ts`: Deterministic scanner checking inputs/outputs against a list of severe symptoms (e.g., "heavy bleeding").
- `prompts/system.ts`: The SAKHI persona strictly forbidding diagnosis and appropriately deferring to traditional wellness vs medical necessity.
- `tools/`: Scoped Prisma retrievals using `req.user.userId`.
- Endpoints: `POST /api/ai/chat` utilizing `AIConversation` models.

## Security (Phase G & O)
The AI agent explicitly is passed the user context by the `orchestrator` (`req.user.id`). It will never be permitted to dynamically define target users. All data responses are heavily scoped.

---
**This document outlines the decisions required to satisfy Milestone 2 objectives.**
